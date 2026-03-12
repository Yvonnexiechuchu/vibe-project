import { callClaudeJSON } from "./claude";
import type { XhsMention } from "./types";
import type { XhsFeed } from "./xhs-client";

interface ExtractedRestaurant {
  restaurantName: string;
  neighborhood: string | null;
  cuisineTags: string[];
  vibeTags: string[];
  sentimentThemes: string[];
}

const EXTRACTION_PROMPT = `You are a restaurant mention extractor for the DMV (DC/Maryland/Virginia) area.

Given a Xiaohongshu (小红书) feed post about restaurants, extract ALL restaurant names mentioned with their details.

Return a JSON array of objects:
[
  {
    "restaurantName": "exact restaurant name",
    "neighborhood": "neighborhood or area" or null,
    "cuisineTags": ["cuisine type"],
    "vibeTags": ["atmosphere descriptors"],
    "sentimentThemes": ["positive or negative themes mentioned"]
  }
]

Guidelines:
- Extract every distinct restaurant name mentioned.
- Neighborhood should be a DMV area (Georgetown, Arlington, Bethesda, etc.)
- cuisineTags: type of food (Korean, Italian, Brunch, etc.)
- vibeTags: atmosphere words (trendy, cozy, romantic, photogenic, etc.)
- sentimentThemes: what people say about it (e.g., "great ambiance", "long wait", "authentic", "must-try", "overrated", "good for groups")
- If a post mentions no specific restaurant names, return an empty array [].
- Extract Chinese restaurant names as-is AND their English names if both are given.`;

export async function extractRestaurantsFromFeeds(feeds: XhsFeed[]): Promise<XhsMention[]> {
  const mentions: XhsMention[] = [];

  // Process feeds in batches of 5
  const batchSize = 5;
  for (let i = 0; i < feeds.length; i += batchSize) {
    const batch = feeds.slice(i, i + batchSize);

    const batchText = batch
      .map((f, idx) => `--- Post ${idx + 1} ---\nTitle: ${f.title}\nContent: ${f.description}\n`)
      .join("\n");

    try {
      const extracted = await callClaudeJSON<ExtractedRestaurant[]>(
        EXTRACTION_PROMPT,
        batchText,
        { maxTokens: 2048 }
      );

      if (!Array.isArray(extracted)) continue;

      for (const restaurant of extracted) {
        // Find which feed this restaurant was mentioned in
        const matchingFeed = batch.find(
          f =>
            f.title.includes(restaurant.restaurantName) ||
            f.description.includes(restaurant.restaurantName) ||
            restaurant.restaurantName.split(/\s+/).some(word =>
              word.length > 2 && (f.title.includes(word) || f.description.includes(word))
            )
        ) || batch[0];

        mentions.push({
          feedId: matchingFeed.feedId,
          xsecToken: matchingFeed.xsecToken,
          title: matchingFeed.title,
          restaurantName: restaurant.restaurantName,
          neighborhood: restaurant.neighborhood,
          cuisineTags: restaurant.cuisineTags || [],
          vibeTags: restaurant.vibeTags || [],
          sentimentThemes: restaurant.sentimentThemes || [],
          likeCount: matchingFeed.likeCount,
          collectCount: matchingFeed.collectCount,
          commentCount: matchingFeed.commentCount,
          imageUrl: matchingFeed.imageUrl,
          authorName: matchingFeed.authorName,
          feedUrl: `https://www.xiaohongshu.com/explore/${matchingFeed.feedId}`,
        });
      }
    } catch (err) {
      console.error("[XHS Extractor] Batch extraction error:", err);
    }
  }

  return mentions;
}

/**
 * Build a single, focused "Location + Cuisine" search query for XHS.
 * Keep it simple — one good query returns better results than many scattered ones.
 */
export function buildSearchQuery(cuisine: string | null, location: string | null): string {
  const parts: string[] = [];

  if (location) parts.push(location);
  if (cuisine) parts.push(cuisine);

  // If we have both, that's a great query already
  if (parts.length > 0) {
    parts.push("餐厅推荐");
    return parts.join(" ");
  }

  // Fallback: generic DMV restaurant search
  return "DC 餐厅推荐";
}
