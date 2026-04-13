import { NextRequest, NextResponse } from "next/server";
import { getOrFetchResearch } from "@/lib/organic-research";
import { CATEGORIES } from "@/lib/types";
import type { Category } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { category, force } = (await req.json()) as {
      category: string;
      force?: boolean;
    };
    if (!CATEGORIES.includes(category as Category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    const record = await getOrFetchResearch(category as Category, !!force);
    return NextResponse.json({ research: record });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
