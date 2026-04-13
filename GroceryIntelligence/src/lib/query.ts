/**
 * Natural-language query — Claude receives a compact JSON snapshot of the
 * user's full price database (single user, small data) and answers the
 * question directly. No tools, no retrieval — simpler and more accurate for
 * a dataset this size.
 */

import { getAnthropic, MODEL } from "./anthropic";
import type { Item, OrganicResearch, PriceEntry, Store } from "./types";

const SYSTEM = `You are the personal grocery-intelligence assistant for a single user.

You will receive:
- A JSON database of their items, stores, price entries, and cached organic research.
- A natural-language question.

Answer with grounded, specific numbers from their data. Always:
- Cite the store, date, and unit price.
- When comparing stores, show a sorted list with the cheapest unit price first.
- Note the number of purchases backing the answer (confidence signal).
- If the question touches organic vs. conventional and cached research exists for that category, include a short 2-line summary with the source titles.
- If data is thin (< 3 purchases), say so plainly.
- Never invent prices, dates, or sources. If the answer isn't in the data, say so.

Format: short, scannable. Use markdown with:
- A single-sentence headline answer.
- A bullet list of supporting facts.
- A final "Confidence" line.`;

export async function answerQuestion(
  question: string,
  ctx: {
    items: Item[];
    stores: Store[];
    prices: PriceEntry[];
    research: OrganicResearch[];
  }
): Promise<string> {
  const client = getAnthropic();

  const snapshot = {
    items: ctx.items,
    stores: ctx.stores,
    prices: ctx.prices,
    organic_research: ctx.research.map((r) => ({
      category: r.category,
      summary: r.summary,
      keyDifferences: r.keyDifferences,
      pesticideImpact: r.pesticideImpact,
      sources: r.sources,
      refreshedAt: r.refreshedAt,
    })),
  };

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Database (JSON):\n\`\`\`json\n${JSON.stringify(
          snapshot
        )}\n\`\`\`\n\nQuestion: ${question}`,
      },
    ],
  });
  const block = msg.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "";
}
