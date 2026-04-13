"use client";

/**
 * Short-lived session storage for a parsed receipt as the user navigates
 * upload → checklist → summary. sessionStorage because it's per-tab and
 * avoids shipping the full parsed blob through URL params.
 */

import type { ParsedReceipt } from "./types";

const KEY = "gi:parsed-receipt";

export function saveSession(parsed: ParsedReceipt) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(parsed));
}

export function loadSession(): ParsedReceipt | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ParsedReceipt;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
