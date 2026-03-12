import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = process.env.XHS_MCP_URL || "http://localhost:18060/mcp";

let mcpClient: Client | null = null;
let connectionPromise: Promise<Client> | null = null;

async function getClient(): Promise<Client> {
  if (mcpClient) return mcpClient;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));

    const client = new Client({
      name: "restaurant-copilot",
      version: "1.0.0",
    });

    await client.connect(transport);

    const tools = await client.listTools();
    console.log("[XHS] Connected. Available tools:", tools.tools.map(t => t.name));

    mcpClient = client;
    return client;
  })();

  try {
    return await connectionPromise;
  } catch (err) {
    connectionPromise = null;
    mcpClient = null;
    throw err;
  }
}

export interface XhsFeed {
  feedId: string;
  xsecToken: string;
  title: string;
  description: string;
  likeCount: number;
  collectCount: number;
  commentCount: number;
  imageUrl: string | null;
  authorName: string;
}

export interface XhsFeedDetail {
  title: string;
  description: string;
  likeCount: number;
  collectCount: number;
  commentCount: number;
  authorName: string;
  imageUrls: string[];
  comments: Array<{ content: string; likeCount: string }>;
}

export interface SearchFilters {
  sort_by?: "综合" | "最新" | "最多点赞" | "最多评论" | "最多收藏";
  note_type?: "不限" | "视频" | "图文";
  publish_time?: "不限" | "一天内" | "一周内" | "半年内";
}

/**
 * Search Xiaohongshu feeds using the search_feeds MCP tool.
 * Uses a focused "location + cuisine" keyword with filters for best results.
 */
export async function searchXhsFeeds(
  keyword: string,
  filters?: SearchFilters
): Promise<XhsFeed[]> {
  try {
    const client = await getClient();
    console.log("[XHS] Searching for:", keyword, "filters:", filters);

    const args: Record<string, unknown> = { keyword };

    // Apply filters — default to 综合 (comprehensive) sort
    const resolvedFilters = {
      sort_by: filters?.sort_by ?? "综合",
      note_type: filters?.note_type ?? "不限",
      publish_time: filters?.publish_time ?? "不限",
    };
    args.filters = resolvedFilters;

    const result = await client.callTool({
      name: "search_feeds",
      arguments: args,
    });

    console.log("[XHS] Raw result type:", typeof result.content, "isArray:", Array.isArray(result.content));

    // Parse the MCP tool result
    const content = result.content;
    if (!content || !Array.isArray(content)) return [];

    const textContent = content.find((c: { type: string }) => c.type === "text");
    if (!textContent || !("text" in textContent)) return [];

    const text = textContent.text as string;
    console.log("[XHS] Response text preview:", text.slice(0, 500));

    try {
      const data = JSON.parse(text);

      // The actual MCP response is { feeds: [...], count: N }
      // Each feed has: { xsecToken, id, modelType, noteCard: { displayTitle, user, interactInfo, cover } }
      let rawFeeds: unknown[] = [];

      if (data.feeds && Array.isArray(data.feeds)) {
        rawFeeds = data.feeds;
      } else if (Array.isArray(data)) {
        rawFeeds = data;
      } else if (data.data && Array.isArray(data.data)) {
        rawFeeds = data.data;
      } else if (data.items && Array.isArray(data.items)) {
        rawFeeds = data.items;
      } else {
        console.log("[XHS] Unexpected data structure:", Object.keys(data));
        return [];
      }

      // Filter out non-note entries (e.g., hot_query) and normalize
      return rawFeeds
        .filter((f: any) => {
          const modelType = (f as any).modelType;
          return !modelType || modelType === "note";
        })
        .map(normalizeFeed);
    } catch {
      console.log("[XHS] Non-JSON response:", text.slice(0, 300));
      return [];
    }
  } catch (err) {
    console.error("[XHS] Search error:", err);
    mcpClient = null;
    connectionPromise = null;
    return [];
  }
}

/**
 * Get full details for a specific feed post, including title, description and comments.
 * Uses the get_feed_detail MCP tool.
 * Returns structured data instead of raw text.
 */
export async function getFeedDetail(
  feedId: string,
  xsecToken: string,
  options?: { load_all_comments?: boolean; limit?: number }
): Promise<XhsFeedDetail | null> {
  try {
    const client = await getClient();

    const args: Record<string, unknown> = {
      feed_id: feedId,
      xsec_token: xsecToken,
    };
    if (options?.load_all_comments) {
      args.load_all_comments = true;
      if (options.limit) args.limit = options.limit;
    }

    const result = await client.callTool({
      name: "get_feed_detail",
      arguments: args,
    });

    const content = result.content;
    if (!content || !Array.isArray(content)) return null;

    const textContent = content.find((c: { type: string }) => c.type === "text");
    if (!textContent || !("text" in textContent)) return null;

    const text = textContent.text as string;

    try {
      const data = JSON.parse(text);

      // Actual MCP response: { feed_id, data: { note: { title, desc, ... }, comments: { list: [...] } } }
      const note = data?.data?.note || data?.note || data;
      if (!note) return null;

      const interactInfo = note.interactInfo || note.interact_info || {};
      const user = note.user || {};
      const imageList = note.imageList || note.image_list || [];
      const commentsList = data?.data?.comments?.list || data?.comments?.list || [];

      return {
        title: note.title || note.displayTitle || note.display_title || "",
        description: note.desc || note.description || "",
        likeCount: toNumber(interactInfo.likedCount || interactInfo.liked_count),
        collectCount: toNumber(interactInfo.collectedCount || interactInfo.collected_count),
        commentCount: toNumber(interactInfo.commentCount || interactInfo.comment_count),
        authorName: user.nickname || user.nickName || "Unknown",
        imageUrls: imageList.map((img: any) => img.urlDefault || img.url_default || img.url || "").filter(Boolean),
        comments: commentsList.map((c: any) => ({
          content: c.content || "",
          likeCount: c.likeCount || c.like_count || "0",
        })),
      };
    } catch {
      console.log("[XHS] Feed detail non-JSON:", text.slice(0, 300));
      return null;
    }
  } catch (err) {
    console.error("[XHS] Feed detail error:", err);
    return null;
  }
}

/**
 * Fetch details for multiple feeds concurrently (with concurrency limit).
 * Enriches each XhsFeed with the full description from feed detail.
 */
export async function enrichFeedsWithDetails(feeds: XhsFeed[]): Promise<XhsFeed[]> {
  const batchSize = 5;
  const enriched = [...feeds];

  for (let i = 0; i < feeds.length; i += batchSize) {
    const batch = feeds.slice(i, i + batchSize);
    const promises = batch.map(async (feed, batchIdx) => {
      const detail = await getFeedDetail(feed.feedId, feed.xsecToken);
      if (detail) {
        const idx = i + batchIdx;
        enriched[idx] = {
          ...enriched[idx],
          title: detail.title || enriched[idx].title,
          description: detail.description || enriched[idx].description,
          likeCount: detail.likeCount || enriched[idx].likeCount,
          collectCount: detail.collectCount || enriched[idx].collectCount,
          commentCount: detail.commentCount || enriched[idx].commentCount,
        };
      }
    });
    await Promise.all(promises);
  }

  return enriched;
}

function toNumber(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseInt(val, 10) || 0;
  return 0;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Normalize a feed from the XHS MCP search response.
 *
 * Actual structure from the MCP tool:
 * {
 *   xsecToken: "...",
 *   id: "...",
 *   modelType: "note",
 *   noteCard: {
 *     type: "normal",
 *     displayTitle: "...",
 *     user: { userId, nickname, nickName, avatar },
 *     interactInfo: { liked, likedCount: "79", collectedCount: "85", commentCount: "14" },
 *     cover: { width, height, url: "", urlPre: "...", urlDefault: "..." }
 *   }
 * }
 *
 * Note: likedCount/collectedCount/commentCount are STRINGS, not numbers.
 * Note: cover.url is often empty — use cover.urlDefault instead.
 * Note: description/desc is NOT available in search results — only displayTitle.
 */
function normalizeFeed(raw: any): XhsFeed {
  const noteCard = raw.noteCard || raw.note_card;

  // If nested noteCard structure (from search results)
  if (noteCard) {
    const interactInfo = noteCard.interactInfo || noteCard.interact_info || {};
    const user = noteCard.user || {};
    const cover = noteCard.cover || {};

    return {
      feedId: raw.id || raw.feedId || raw.feed_id || "",
      xsecToken: raw.xsecToken || raw.xsec_token || "",
      title: noteCard.displayTitle || noteCard.display_title || "",
      description: "", // Not available in search results, must fetch detail
      likeCount: toNumber(interactInfo.likedCount || interactInfo.liked_count),
      collectCount: toNumber(interactInfo.collectedCount || interactInfo.collected_count),
      commentCount: toNumber(interactInfo.commentCount || interactInfo.comment_count),
      imageUrl: cover.urlDefault || cover.url_default || cover.urlPre || cover.url || null,
      authorName: user.nickname || user.nickName || "Unknown",
    };
  }

  // Flat structure fallback
  return {
    feedId: raw.feed_id || raw.feedId || raw.id || raw.note_id || "",
    xsecToken: raw.xsec_token || raw.xsecToken || raw.xsec || "",
    title: raw.title || raw.displayTitle || raw.display_title || "",
    description: raw.description || raw.desc || "",
    likeCount: toNumber(raw.like_count || raw.likeCount || raw.liked_count),
    collectCount: toNumber(raw.collect_count || raw.collectCount || raw.collected_count),
    commentCount: toNumber(raw.comment_count || raw.commentCount),
    imageUrl: raw.cover?.urlDefault || raw.cover?.url || raw.cover_url || raw.image_url || null,
    authorName: raw.author?.name || raw.author_name || raw.nickname || "Unknown",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
