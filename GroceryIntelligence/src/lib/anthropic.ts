import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  cached = new Anthropic({ apiKey });
  return cached;
}

export const MODEL = "claude-opus-4-6";
export const MODEL_FAST = "claude-haiku-4-5-20251001";
