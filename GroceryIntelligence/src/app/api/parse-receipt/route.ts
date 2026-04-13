import { NextRequest, NextResponse } from "next/server";
import { listItems, listStores } from "@/lib/google-sheets";
import { parseReceiptImage } from "@/lib/parse-receipt";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { base64, mimeType } = body as { base64: string; mimeType: string };
    if (!base64 || !mimeType) {
      return NextResponse.json({ error: "Missing image" }, { status: 400 });
    }

    const [items, stores] = await Promise.all([listItems(), listStores()]);
    const parsed = await parseReceiptImage(base64, mimeType, items, stores);

    return NextResponse.json({ parsed });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
