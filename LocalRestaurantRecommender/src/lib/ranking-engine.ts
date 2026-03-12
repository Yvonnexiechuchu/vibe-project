import type { ParsedQuery, RestaurantCandidate, ScoreBreakdown } from "./types";
import { RANKING_WEIGHTS } from "./constants";

/**
 * Deterministic ranking engine.
 * Scores each candidate based on how well it matches the parsed query.
 * LLM is NOT involved in scoring — only in generating the final summary.
 */
export function rankCandidates(
  candidates: RestaurantCandidate[],
  query: ParsedQuery,
  topN: number = 5
): RestaurantCandidate[] {
  for (const candidate of candidates) {
    candidate.scoreBreakdown = computeScore(candidate, query);
    candidate.totalScore = weightedTotal(candidate.scoreBreakdown);
  }

  // Sort by total score descending
  candidates.sort((a, b) => b.totalScore - a.totalScore);

  return candidates.slice(0, topN);
}

function computeScore(candidate: RestaurantCandidate, query: ParsedQuery): ScoreBreakdown {
  return {
    queryMatch: scoreQueryMatch(candidate, query),
    vibeMatch: scoreVibeMatch(candidate, query),
    cuisineMatch: scoreCuisineMatch(candidate, query),
    locationFit: scoreLocationFit(candidate, query),
    budgetFit: scoreBudgetFit(candidate, query),
    reviewQuality: scoreReviewQuality(candidate),
    reviewVolume: scoreReviewVolume(candidate),
    xhsPopularity: scoreXhsPopularity(candidate),
    reservationFriendliness: scoreReservation(candidate, query),
  };
}

function weightedTotal(breakdown: ScoreBreakdown): number {
  let total = 0;
  for (const [key, weight] of Object.entries(RANKING_WEIGHTS)) {
    total += (breakdown[key as keyof ScoreBreakdown] || 0) * weight;
  }
  return total;
}

// --- Individual scoring functions ---

function scoreQueryMatch(candidate: RestaurantCandidate, query: ParsedQuery): number {
  let matched = 0;
  let total = 0;

  if (query.cuisine) {
    total++;
    const qCuisine = query.cuisine.toLowerCase();
    if (candidate.cuisineTags.some(t => t.toLowerCase().includes(qCuisine) || qCuisine.includes(t.toLowerCase()))) {
      matched++;
    }
  }

  if (query.location) {
    total++;
    const qLoc = query.location.toLowerCase();
    if (candidate.neighborhood?.toLowerCase().includes(qLoc) || qLoc.includes(candidate.neighborhood?.toLowerCase() || "---")) {
      matched++;
    } else if (candidate.googlePlace?.address.toLowerCase().includes(qLoc)) {
      matched += 0.5;
    }
  }

  if (query.vibe.length > 0) {
    total++;
    const vibeOverlap = query.vibe.filter(v =>
      candidate.vibeTags.some(t => t.toLowerCase().includes(v.toLowerCase()) || v.toLowerCase().includes(t.toLowerCase()))
    ).length;
    matched += vibeOverlap / query.vibe.length;
  }

  if (query.occasion) {
    total++;
    const qOccasion = query.occasion.toLowerCase();
    if (candidate.vibeTags.some(t => t.toLowerCase().includes(qOccasion) || qOccasion.includes(t.toLowerCase()))) {
      matched++;
    }
    // Check sentiment themes
    const sentiments = candidate.xhsMentions.flatMap(m => m.sentimentThemes);
    if (sentiments.some(s => s.toLowerCase().includes(qOccasion))) {
      matched += 0.5;
    }
  }

  return total > 0 ? Math.min(1, matched / total) : 0.5;
}

function scoreVibeMatch(candidate: RestaurantCandidate, query: ParsedQuery): number {
  if (query.vibe.length === 0) return 0.5;

  const candidateVibes = [
    ...candidate.vibeTags,
    ...candidate.xhsMentions.flatMap(m => m.vibeTags),
    ...candidate.xhsMentions.flatMap(m => m.sentimentThemes),
  ].map(v => v.toLowerCase());

  let matchCount = 0;
  for (const qVibe of query.vibe) {
    if (candidateVibes.some(v => v.includes(qVibe.toLowerCase()) || qVibe.toLowerCase().includes(v))) {
      matchCount++;
    }
  }

  return matchCount / query.vibe.length;
}

function scoreCuisineMatch(candidate: RestaurantCandidate, query: ParsedQuery): number {
  if (!query.cuisine) return 0.5;

  const qCuisine = query.cuisine.toLowerCase();
  const candidateCuisines = candidate.cuisineTags.map(c => c.toLowerCase());

  // Also check Google place types
  const googleTypes = candidate.googlePlace?.types.map(t => t.toLowerCase().replace(/_/g, " ")) || [];
  const allCuisines = [...candidateCuisines, ...googleTypes];

  if (allCuisines.some(c => c.includes(qCuisine) || qCuisine.includes(c))) {
    return 1.0;
  }

  return 0;
}

function scoreLocationFit(candidate: RestaurantCandidate, query: ParsedQuery): number {
  if (!query.location) return 0.5;

  const qLoc = query.location.toLowerCase();

  // Check neighborhood
  if (candidate.neighborhood?.toLowerCase().includes(qLoc)) return 1.0;

  // Check address
  if (candidate.googlePlace?.address.toLowerCase().includes(qLoc)) return 0.8;

  // In DMV but different neighborhood
  if (candidate.googlePlace) return 0.3;

  return 0.2;
}

function scoreBudgetFit(candidate: RestaurantCandidate, query: ParsedQuery): number {
  if (!query.budget) return 0.5;

  const priceLevel = candidate.googlePlace?.priceLevel;
  if (priceLevel === null || priceLevel === undefined) return 0.4;

  const budgetMap = { low: 1, medium: 2, high: 3 };
  const target = budgetMap[query.budget];
  const diff = Math.abs(priceLevel - target);

  if (diff === 0) return 1.0;
  if (diff === 1) return 0.6;
  return 0.2;
}

function scoreReviewQuality(candidate: RestaurantCandidate): number {
  const rating = candidate.googlePlace?.rating;
  if (!rating) return 0.3;

  // Normalize: 3.0 = 0, 5.0 = 1.0
  return Math.max(0, Math.min(1, (rating - 3.0) / 2.0));
}

function scoreReviewVolume(candidate: RestaurantCandidate): number {
  const count = candidate.googlePlace?.reviewCount || 0;
  if (count === 0) return 0.1;

  // Log scale: 10 reviews = ~0.33, 100 = ~0.67, 1000 = ~1.0
  return Math.min(1, Math.log10(count) / 3);
}

function scoreXhsPopularity(candidate: RestaurantCandidate): number {
  if (candidate.xhsMentions.length === 0) return 0;

  // Combine engagement signals
  const totalEngagement = candidate.xhsMentions.reduce(
    (sum, m) => sum + m.likeCount + m.collectCount * 2 + m.commentCount,
    0
  );

  // Mention frequency also matters
  const mentionBonus = Math.min(1, candidate.xhsMentions.length / 3);

  // Log scale engagement
  const engagementScore = totalEngagement > 0
    ? Math.min(1, Math.log10(totalEngagement) / 4)
    : 0;

  return (engagementScore + mentionBonus) / 2;
}

function scoreReservation(candidate: RestaurantCandidate, query: ParsedQuery): number {
  if (!query.reservationPreferred) return 0.5;

  if (candidate.googlePlace?.reservationUrl) return 1.0;
  if (candidate.googlePlace?.websiteUrl) return 0.5;
  return 0;
}
