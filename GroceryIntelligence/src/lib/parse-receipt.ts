import { getAnthropic, MODEL } from "./anthropic";
import type { Category, Item, ParsedReceipt, Store, Unit } from "./types";
import { CATEGORIES } from "./types";

const PARSE_SYSTEM = `You are a receipt-parsing assistant for a grocery price tracker.

Given a photo of a grocery store receipt, extract every line item and the store/date header. Normalize cryptic product abbreviations into canonical English names.

Rules:
- "ORG SPNCH 5OZ" -> canonicalName: "Spinach", organic: true, packageSize: 5, packageSizeUnit: "oz".
- If the line says "organic" or "ORG", set organic=true.
- If the line says "frozen" or "FRZ" or "FZN", set frozen=true.
- If the item is a bulk/club pack (large pack sizes typical of Costco), set bulk=true.
- Read package size from the line AND from the unit price on the same line when possible.
- If a unit price is printed on the receipt, use it. Otherwise leave unitPrice null (we'll compute it).
- totalPrice is the price actually charged for that line in USD, as a number.
- Guess the store name from the header/logo text.
- Extract purchaseDate as YYYY-MM-DD.
- Assign a category from this list exactly: ${CATEGORIES.join(", ")}.
- Skip tax, subtotal, total, deposit, discount, and non-food lines (unless under Household).

Return STRICT JSON matching this TypeScript type:
{
  "storeName": string,
  "purchaseDate": string,
  "total": number | null,
  "items": Array<{
    "rawText": string,
    "suggestedName": string,
    "suggestedCategory": string,
    "organic": boolean,
    "frozen": boolean,
    "brand": string | null,
    "packageSize": number | null,
    "packageSizeUnit": "g"|"oz"|"lb"|"kg"|"ml"|"L"|"fl_oz"|"count"|null,
    "packageSizeRaw": string | null,
    "totalPrice": number,
    "unitPrice": number | null,
    "bulk": boolean
  }>
}

Output only JSON. No markdown fences. No commentary.`;

type RawParsed = {
  storeName: string;
  purchaseDate: string;
  total: number | null;
  items: Array<{
    rawText: string;
    suggestedName: string;
    suggestedCategory: string;
    organic: boolean;
    frozen: boolean;
    brand: string | null;
    packageSize: number | null;
    packageSizeUnit: string | null;
    packageSizeRaw: string | null;
    totalPrice: number;
    unitPrice: number | null;
    bulk: boolean;
  }>;
};

export async function parseReceiptImage(
  base64Image: string,
  mimeType: string,
  existingItems: Item[],
  existingStores: Store[]
): Promise<ParsedReceipt> {
  const client = getAnthropic();

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: PARSE_SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: `Parse this receipt. Return JSON only.`,
          },
        ],
      },
    ],
  });

  const block = msg.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("No text response from Claude");
  }
  const text = block.text.trim();
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  const parsed: RawParsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

  const storeName = parsed.storeName?.trim() || "Unknown store";
  const storeMatch = existingStores.find(
    (s) => s.name.toLowerCase() === storeName.toLowerCase()
  );

  return {
    storeName,
    storeId: storeMatch?.id ?? null,
    purchaseDate: parsed.purchaseDate,
    total: parsed.total,
    items: parsed.items.map((i) => {
      const cat = (CATEGORIES as readonly string[]).includes(i.suggestedCategory)
        ? (i.suggestedCategory as Category)
        : "Other";
      const match = matchExistingItem(i.suggestedName, existingItems);
      return {
        rawText: i.rawText,
        suggestedName: i.suggestedName,
        suggestedCategory: match?.category ?? cat,
        organic: i.organic,
        frozen: i.frozen,
        brand: i.brand,
        packageSize: i.packageSize,
        packageSizeUnit: (i.packageSizeUnit as Unit | null) ?? null,
        packageSizeRaw: i.packageSizeRaw,
        totalPrice: i.totalPrice,
        unitPrice: i.unitPrice,
        bulk: i.bulk,
        matchedItemId: match?.id ?? null,
      };
    }),
  };
}

function matchExistingItem(name: string, items: Item[]): Item | null {
  const n = name.toLowerCase().trim();
  let best: { item: Item; score: number } | null = null;
  for (const item of items) {
    const c = item.canonicalName.toLowerCase().trim();
    let score = 0;
    if (c === n) score = 100;
    else if (c.includes(n) || n.includes(c)) score = 70;
    else {
      const nTokens = new Set(n.split(/\s+/));
      const cTokens = new Set(c.split(/\s+/));
      const shared = [...nTokens].filter((t) => cTokens.has(t)).length;
      if (shared) score = 30 + shared * 10;
    }
    if (score > 0 && (!best || score > best.score)) best = { item, score };
  }
  return best && best.score >= 50 ? best.item : null;
}
