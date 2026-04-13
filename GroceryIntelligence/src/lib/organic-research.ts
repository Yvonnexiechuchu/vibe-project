import { getAnthropic, MODEL } from "./anthropic";
import {
  getResearch,
  upsertResearch,
} from "./google-sheets";
import type { Category, OrganicResearch } from "./types";

const QUARTER_MS = 92 * 86_400_000;

const SYSTEM = `You research whether buying organic is worth it for a given food category.

Return grounded information citing real, reputable sources (EWG, USDA, peer-reviewed journals, major health authorities). NEVER invent sources. NEVER hallucinate URLs — if you are not sure the URL is correct, omit it and cite only the source title + publication year.

Return STRICT JSON:
{
  "summary": string,   // 2-3 sentence plain-language takeaway
  "keyDifferences": string,  // bullet points separated by "\\n• " — nutrition, pesticides, labeling
  "pesticideImpact": string, // EWG Dirty Dozen / Clean Fifteen relevance if applicable
  "sources": Array<{ "title": string, "publisher": string, "year": number, "url": string | null }>
}
No markdown fences. No commentary.`;

export async function getOrFetchResearch(
  category: Category,
  force = false
): Promise<OrganicResearch> {
  const existing = await getResearch(category);
  if (!force && existing) {
    const age = Date.now() - new Date(existing.refreshedAt).getTime();
    if (age < QUARTER_MS) return existing;
  }

  const client = getAnthropic();
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Category: ${category}\n\nIs buying organic worth it for this category? Return the JSON described.`,
      },
    ],
  });

  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("No research text");
  const start = block.text.indexOf("{");
  const end = block.text.lastIndexOf("}");
  const parsed = JSON.parse(block.text.slice(start, end + 1));

  const record: OrganicResearch = {
    category,
    summary: parsed.summary,
    keyDifferences: parsed.keyDifferences,
    pesticideImpact: parsed.pesticideImpact,
    sources: JSON.stringify(parsed.sources ?? []),
    refreshedAt: new Date().toISOString(),
  };
  await upsertResearch(record);
  return record;
}
