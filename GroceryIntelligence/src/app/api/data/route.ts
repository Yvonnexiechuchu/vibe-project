import { NextResponse } from "next/server";
import {
  ensureHeaders,
  listItems,
  listPrices,
  listResearch,
  listStores,
} from "@/lib/google-sheets";

export const runtime = "nodejs";

export async function GET() {
  try {
    await ensureHeaders();
    const [items, stores, prices, research] = await Promise.all([
      listItems(),
      listStores(),
      listPrices(),
      listResearch(),
    ]);
    return NextResponse.json({ items, stores, prices, research });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
