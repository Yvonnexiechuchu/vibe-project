import { NextRequest, NextResponse } from "next/server";
import {
  listItems,
  listPrices,
  listResearch,
  listStores,
} from "@/lib/google-sheets";
import { answerQuestion } from "@/lib/query";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { question } = (await req.json()) as { question: string };
    if (!question?.trim()) {
      return NextResponse.json({ error: "Empty question" }, { status: 400 });
    }

    const [items, stores, prices, research] = await Promise.all([
      listItems(),
      listStores(),
      listPrices(),
      listResearch(),
    ]);

    const answer = await answerQuestion(question, { items, stores, prices, research });
    return NextResponse.json({ answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
