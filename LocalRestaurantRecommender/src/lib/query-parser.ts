import { callClaudeJSON } from "./claude";
import type { ParsedQuery } from "./types";

const SYSTEM_PROMPT = `You are a restaurant query parser for the DMV (DC, Maryland, Virginia) area.

Given a user's natural language restaurant request, extract structured dining preferences.

Return a JSON object with these fields:
{
  "cuisine": string or null — the type of food requested (e.g., "Korean", "Italian", "Brunch"),
  "location": string or null — neighborhood or area (e.g., "Georgetown", "Annandale", "DC"),
  "partySize": number or null — number of diners,
  "occasion": string or null — dining occasion (e.g., "girls dinner", "date night", "birthday", "casual dinner"),
  "budget": "low" | "medium" | "high" | null — where $ = low, $$ = medium, $$$ = high,
  "vibe": string[] — atmosphere/ambiance descriptors (e.g., ["trendy", "cozy", "quiet", "photogenic"]),
  "timing": string or null — when they want to dine (e.g., "this Friday", "tonight", "lunch"),
  "reservationPreferred": boolean — whether they want/need a reservation,
  "specialConstraints": string[] — any other specific requirements (e.g., ["parking", "vegetarian", "outdoor seating", "kid-friendly"])
}

Guidelines:
- If something is not mentioned, set it to null (or empty array for arrays).
- For budget: "$" or "cheap" or "affordable" → "low", "$$" or "mid-range" → "medium", "$$$" or "upscale" or "fancy" → "high".
- For vibe: extract adjectives about atmosphere. Common ones: trendy, cozy, romantic, casual, upscale, lively, quiet, photogenic, hidden-gem, instagrammable.
- Be generous in extraction — if "not too loud" is mentioned, add "quiet" to vibe.
- DMV neighborhoods include Georgetown, Dupont Circle, Adams Morgan, Capitol Hill, Navy Yard, Arlington, Bethesda, Annandale, Old Town Alexandria, Tysons, etc.`;

export async function parseQuery(rawText: string): Promise<ParsedQuery> {
  const parsed = await callClaudeJSON<Omit<ParsedQuery, "rawText">>(
    SYSTEM_PROMPT,
    rawText
  );

  return {
    rawText,
    cuisine: parsed.cuisine || null,
    location: parsed.location || null,
    partySize: parsed.partySize || null,
    occasion: parsed.occasion || null,
    budget: parsed.budget || null,
    vibe: parsed.vibe || [],
    timing: parsed.timing || null,
    reservationPreferred: parsed.reservationPreferred || false,
    specialConstraints: parsed.specialConstraints || [],
  };
}
