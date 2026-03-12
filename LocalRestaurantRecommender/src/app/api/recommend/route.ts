import { NextRequest } from "next/server";
import { parseQuery } from "@/lib/query-parser";
import { searchXhsFeeds, enrichFeedsWithDetails } from "@/lib/xhs-client";
import { extractRestaurantsFromFeeds, buildSearchQuery } from "@/lib/xhs-extractor";
import { searchPlacesBatch } from "@/lib/google-places";
import { mergeCandidates } from "@/lib/candidate-merger";
import { rankCandidates } from "@/lib/ranking-engine";
import { summarizeRecommendations } from "@/lib/summarizer";
import type { RecommendationResponse } from "@/lib/types";

export const maxDuration = 60; // Allow up to 60s for the full pipeline

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const rawQuery = body.query;

    if (!rawQuery || typeof rawQuery !== "string") {
      return Response.json({ error: "Missing query" }, { status: 400 });
    }

    // Set up SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // Step 0: Parse query
          send({ type: "step", step: 0, status: "active" });
          const parsedQuery = await parseQuery(rawQuery);
          send({ type: "step", step: 0, status: "done" });

          // Step 1: Search Xiaohongshu with a focused location+cuisine query
          send({ type: "step", step: 1, status: "active" });
          const searchQuery = buildSearchQuery(parsedQuery.cuisine, parsedQuery.location);
          console.log("[Pipeline] XHS search query:", searchQuery);

          const feeds = await searchXhsFeeds(searchQuery);
          console.log("[Pipeline] XHS feeds returned:", feeds.length);

          // Sort by engagement, take top 10 for extraction
          const topFeeds = feeds
            .sort((a, b) => (b.likeCount + b.collectCount) - (a.likeCount + a.collectCount))
            .slice(0, 10);

          // Fetch full details (title + description) for top feeds
          // Search results only have displayTitle, no description content
          console.log("[Pipeline] Enriching top feeds with details...");
          const enrichedFeeds = await enrichFeedsWithDetails(topFeeds);
          console.log("[Pipeline] Enriched feeds:", enrichedFeeds.filter(f => f.description).length, "with descriptions");

          const xhsMentions = await extractRestaurantsFromFeeds(enrichedFeeds);
          console.log("[Pipeline] Extracted mentions:", xhsMentions.length);
          send({ type: "step", step: 1, status: "done" });

          // Step 2: Google Places enrichment
          send({ type: "step", step: 2, status: "active" });
          const uniqueRestaurants = [...new Set(xhsMentions.map(m => m.restaurantName))];
          const restaurantEntries = uniqueRestaurants.map(name => ({
            name,
            neighborhood: xhsMentions.find(m => m.restaurantName === name)?.neighborhood,
          }));

          const googlePlaces = await searchPlacesBatch(restaurantEntries);
          send({ type: "step", step: 2, status: "done" });

          // Step 3: Merge + rank
          send({ type: "step", step: 3, status: "active" });
          const candidatesBeforeMerge = xhsMentions.length;
          const mergedCandidates = mergeCandidates(xhsMentions, googlePlaces);
          const rankedCandidates = rankCandidates(mergedCandidates, parsedQuery, 5);
          send({ type: "step", step: 3, status: "done" });

          // Step 4: Summarize
          send({ type: "step", step: 4, status: "active" });
          const recommendations = await summarizeRecommendations(rankedCandidates, parsedQuery);
          send({ type: "step", step: 4, status: "done" });

          // Build final response
          const response: RecommendationResponse = {
            query: parsedQuery,
            recommendations,
            searchMetadata: {
              xhsFeedsSearched: feeds.length,
              googlePlacesQueried: googlePlaces.size,
              candidatesBeforeMerge,
              candidatesAfterMerge: mergedCandidates.length,
              processingTimeMs: Date.now() - startTime,
            },
          };

          send({ type: "result", data: response });
        } catch (err) {
          console.error("[Recommend API] Pipeline error:", err);
          send({
            type: "error",
            message: err instanceof Error ? err.message : "Pipeline failed",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[Recommend API] Request error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
