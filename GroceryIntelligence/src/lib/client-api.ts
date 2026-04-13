"use client";

import type {
  Item,
  OrganicResearch,
  ParsedReceipt,
  PriceEntry,
  Store,
} from "./types";

export type DataSnapshot = {
  items: Item[];
  stores: Store[];
  prices: PriceEntry[];
  research: OrganicResearch[];
};

export async function fetchSnapshot(): Promise<DataSnapshot> {
  const res = await fetch("/api/data", { cache: "no-store" });
  if (!res.ok) throw new Error(`Data fetch failed: ${res.status}`);
  return res.json();
}

export async function parseReceipt(
  base64: string,
  mimeType: string
): Promise<ParsedReceipt> {
  const res = await fetch("/api/parse-receipt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ base64, mimeType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Parse failed: ${res.status}`);
  }
  const data = await res.json();
  return data.parsed;
}

export async function saveReceipt(payload: object): Promise<{
  ok: boolean;
  savedCount: number;
}> {
  const res = await fetch("/api/save-receipt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Save failed: ${res.status}`);
  }
  return res.json();
}

export async function askQuestion(question: string): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Chat failed: ${res.status}`);
  }
  const data = await res.json();
  return data.answer;
}

export async function fetchOrganicResearch(
  category: string,
  force = false
): Promise<OrganicResearch> {
  const res = await fetch("/api/organic", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ category, force }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Research failed: ${res.status}`);
  }
  const data = await res.json();
  return data.research;
}
