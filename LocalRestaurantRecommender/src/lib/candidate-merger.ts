import { v4 as uuidv4 } from "uuid";
import type { XhsMention, GooglePlaceData, RestaurantCandidate } from "./types";

/**
 * Merge XHS mentions with Google Place data into unified restaurant candidates.
 * Deduplicates by normalized name + proximity.
 */
export function mergeCandidates(
  xhsMentions: XhsMention[],
  googlePlaces: Map<string, GooglePlaceData>
): RestaurantCandidate[] {
  // Group XHS mentions by normalized restaurant name
  const mentionGroups = new Map<string, XhsMention[]>();

  for (const mention of xhsMentions) {
    const key = normalizeName(mention.restaurantName);
    if (!key) continue;

    const existing = mentionGroups.get(key);
    if (existing) {
      existing.push(mention);
    } else {
      mentionGroups.set(key, [mention]);
    }
  }

  // Also try to merge groups that are likely the same restaurant
  const mergedGroups = deduplicateGroups(mentionGroups);

  // Build candidates
  const candidates: RestaurantCandidate[] = [];

  for (const [normalizedName, mentions] of mergedGroups) {
    // Find matching Google place
    let matchedPlace: GooglePlaceData | null = null;

    // Try exact match first
    for (const [searchName, place] of googlePlaces) {
      if (normalizeName(searchName) === normalizedName || normalizeName(place.name) === normalizedName) {
        matchedPlace = place;
        break;
      }
    }

    // Try fuzzy match
    if (!matchedPlace) {
      for (const [searchName, place] of googlePlaces) {
        if (fuzzyMatch(normalizedName, normalizeName(searchName)) || fuzzyMatch(normalizedName, normalizeName(place.name))) {
          matchedPlace = place;
          break;
        }
      }
    }

    // Collect all unique tags
    const allCuisineTags = [...new Set(mentions.flatMap(m => m.cuisineTags))];
    const allVibeTags = [...new Set(mentions.flatMap(m => m.vibeTags))];
    const allNames = [...new Set(mentions.map(m => m.restaurantName))];

    // Use the most common restaurant name as canonical
    const canonicalName = getMostCommon(mentions.map(m => m.restaurantName)) || allNames[0];
    const neighborhood = mentions.find(m => m.neighborhood)?.neighborhood ||
      (matchedPlace ? extractNeighborhood(matchedPlace.address) : null);

    candidates.push({
      id: uuidv4(),
      canonicalName,
      aliasNames: allNames.filter(n => n !== canonicalName),
      xhsMentions: mentions,
      googlePlace: matchedPlace,
      cuisineTags: allCuisineTags,
      vibeTags: allVibeTags,
      neighborhood,
      scoreBreakdown: {
        queryMatch: 0,
        vibeMatch: 0,
        cuisineMatch: 0,
        locationFit: 0,
        budgetFit: 0,
        reviewQuality: 0,
        reviewVolume: 0,
        xhsPopularity: 0,
        reservationFriendliness: 0,
      },
      totalScore: 0,
    });
  }

  return candidates;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/restaurant|cafe|café|bar|grill|kitchen|bistro|house|eatery/gi, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;

  // Token overlap: if >60% of tokens match
  const tokensA = new Set(a.split(" ").filter(t => t.length > 1));
  const tokensB = new Set(b.split(" ").filter(t => t.length > 1));

  if (tokensA.size === 0 || tokensB.size === 0) return false;

  let overlap = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap++;
  }

  const minSize = Math.min(tokensA.size, tokensB.size);
  return overlap / minSize >= 0.6;
}

function deduplicateGroups(groups: Map<string, XhsMention[]>): Map<string, XhsMention[]> {
  const keys = [...groups.keys()];
  const merged = new Map<string, XhsMention[]>();
  const mergedInto = new Map<string, string>();

  for (const key of keys) {
    // Check if this key has been merged into another
    if (mergedInto.has(key)) continue;

    const mentions = groups.get(key)!;
    let targetKey = key;

    // Check for fuzzy matches with existing merged groups
    for (const existingKey of merged.keys()) {
      if (fuzzyMatch(key, existingKey)) {
        targetKey = existingKey;
        mergedInto.set(key, existingKey);
        break;
      }
    }

    if (targetKey === key) {
      merged.set(key, [...mentions]);
    } else {
      merged.get(targetKey)!.push(...mentions);
    }
  }

  return merged;
}

function getMostCommon(arr: string[]): string | undefined {
  const counts = new Map<string, number>();
  for (const item of arr) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  let max = 0;
  let result: string | undefined;
  for (const [item, count] of counts) {
    if (count > max) {
      max = count;
      result = item;
    }
  }
  return result;
}

function extractNeighborhood(address: string): string | null {
  // Try to extract neighborhood from Google address
  const dmvAreas = [
    "Georgetown", "Dupont Circle", "Adams Morgan", "Capitol Hill",
    "Navy Yard", "U Street", "Penn Quarter", "Chinatown",
    "Logan Circle", "Shaw", "Columbia Heights", "Wharf",
    "Arlington", "Clarendon", "Ballston", "Old Town",
    "Bethesda", "Silver Spring", "Rockville", "Annandale",
    "Falls Church", "Tysons", "McLean", "Reston",
  ];

  for (const area of dmvAreas) {
    if (address.includes(area)) return area;
  }
  return null;
}
