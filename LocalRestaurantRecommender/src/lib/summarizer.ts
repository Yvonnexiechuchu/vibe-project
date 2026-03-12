import { callClaudeJSON } from "./claude";
import type { ParsedQuery, RestaurantCandidate, Recommendation } from "./types";

interface SummaryOutput {
  whyItFits: string;
  pros: string[];
  caveats: string[];
  xhsSummary: string;
  googleSummary: string;
}

const SYSTEM_PROMPT = `You are a restaurant recommendation summarizer for a dining decision copilot.

Given a user's dining request and a list of ranked restaurant candidates (already ranked by a scoring engine),
generate human-friendly summaries for each restaurant.

DO NOT change the ranking order. The ranking has already been determined by a deterministic scoring engine.
Your job is only to explain WHY each restaurant is a good fit and summarize the available evidence.

For each restaurant, generate:
1. whyItFits: A 1-2 sentence explanation of why this restaurant matches the user's request.
2. pros: 2-4 short positive highlights (3-6 words each)
3. caveats: 1-2 potential watch-outs (3-6 words each). If none, use ["No notable concerns"]
4. xhsSummary: 1-2 sentence summary of what Xiaohongshu posts say about this place. Focus on vibe, popularity, and notable mentions. If no XHS data, say "No Xiaohongshu reviews available."
5. googleSummary: 1-2 sentence summary based on Google rating, review count, and practical info. If no Google data, say "Google data unavailable."

Return a JSON array of objects in the SAME ORDER as the input restaurants:
[
  {
    "whyItFits": "...",
    "pros": ["...", "..."],
    "caveats": ["..."],
    "xhsSummary": "...",
    "googleSummary": "..."
  }
]

Keep language warm, concise, and helpful. Avoid generic filler. Be specific to each restaurant.`;

export async function summarizeRecommendations(
  candidates: RestaurantCandidate[],
  query: ParsedQuery
): Promise<Recommendation[]> {
  // Build context for Claude
  const restaurantDescriptions = candidates.map((c, i) => {
    const xhsInfo = c.xhsMentions.length > 0
      ? `XHS mentions: ${c.xhsMentions.length}. ` +
        `Themes: ${[...new Set(c.xhsMentions.flatMap(m => m.sentimentThemes))].join(", ")}. ` +
        `Vibes: ${[...new Set(c.xhsMentions.flatMap(m => m.vibeTags))].join(", ")}. ` +
        `Total likes: ${c.xhsMentions.reduce((s, m) => s + m.likeCount, 0)}. ` +
        `Total collects: ${c.xhsMentions.reduce((s, m) => s + m.collectCount, 0)}.`
      : "No XHS data.";

    const googleInfo = c.googlePlace
      ? `Google: ${c.googlePlace.rating}/5 (${c.googlePlace.reviewCount} reviews). ` +
        `Price: ${"$".repeat(c.googlePlace.priceLevel || 0) || "unknown"}. ` +
        `Address: ${c.googlePlace.address}. ` +
        `${c.googlePlace.openNow !== null ? (c.googlePlace.openNow ? "Currently open." : "Currently closed.") : ""}`
      : "No Google data.";

    return `--- Restaurant #${i + 1}: ${c.canonicalName} ---
Neighborhood: ${c.neighborhood || "unknown"}
Cuisine: ${c.cuisineTags.join(", ") || "unknown"}
Vibe: ${c.vibeTags.join(", ") || "unknown"}
Score: ${c.totalScore.toFixed(3)}
${xhsInfo}
${googleInfo}`;
  }).join("\n\n");

  const userMessage = `User request: "${query.rawText}"
Parsed preferences:
- Cuisine: ${query.cuisine || "any"}
- Location: ${query.location || "DMV area"}
- Party size: ${query.partySize || "not specified"}
- Occasion: ${query.occasion || "not specified"}
- Budget: ${query.budget || "not specified"}
- Vibe: ${query.vibe.join(", ") || "not specified"}
- Timing: ${query.timing || "not specified"}

Ranked restaurants (do NOT change order):
${restaurantDescriptions}`;

  try {
    const summaries = await callClaudeJSON<SummaryOutput[]>(
      SYSTEM_PROMPT,
      userMessage,
      { maxTokens: 4096, temperature: 0.4 }
    );

    return candidates.map((candidate, i) => ({
      rank: i + 1,
      restaurant: candidate,
      whyItFits: summaries[i]?.whyItFits || "Matches your dining preferences.",
      pros: summaries[i]?.pros || ["Good option"],
      caveats: summaries[i]?.caveats || ["No notable concerns"],
      xhsSummary: summaries[i]?.xhsSummary || "No Xiaohongshu reviews available.",
      googleSummary: summaries[i]?.googleSummary || "Google data unavailable.",
    }));
  } catch (err) {
    console.error("[Summarizer] Error:", err);
    // Fallback: return candidates with generic summaries
    return candidates.map((candidate, i) => ({
      rank: i + 1,
      restaurant: candidate,
      whyItFits: "Matches your dining preferences based on available data.",
      pros: candidate.vibeTags.slice(0, 2).concat(candidate.cuisineTags.slice(0, 1)),
      caveats: ["Limited review data"],
      xhsSummary: candidate.xhsMentions.length > 0
        ? `Mentioned in ${candidate.xhsMentions.length} Xiaohongshu post(s).`
        : "No Xiaohongshu reviews available.",
      googleSummary: candidate.googlePlace
        ? `Rated ${candidate.googlePlace.rating}/5 with ${candidate.googlePlace.reviewCount} reviews on Google.`
        : "Google data unavailable.",
    }));
  }
}
