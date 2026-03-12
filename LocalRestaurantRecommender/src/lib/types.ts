// ============================================================
// Restaurant Decision Copilot — Core Type Definitions
// ============================================================

// --- Query Layer ---

export interface ParsedQuery {
  rawText: string;
  cuisine: string | null;
  location: string | null;
  partySize: number | null;
  occasion: string | null;
  budget: "low" | "medium" | "high" | null;
  vibe: string[];
  timing: string | null;
  reservationPreferred: boolean;
  specialConstraints: string[];
}

// --- Xiaohongshu Source Layer ---

export interface XhsMention {
  feedId: string;
  xsecToken: string;
  title: string;
  restaurantName: string;
  neighborhood: string | null;
  cuisineTags: string[];
  vibeTags: string[];
  sentimentThemes: string[];
  likeCount: number;
  collectCount: number;
  commentCount: number;
  imageUrl: string | null;
  authorName: string;
  feedUrl: string;
}

// --- Google Source Layer ---

export interface GooglePlaceData {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviewCount: number;
  priceLevel: number | null;
  openNow: boolean | null;
  openingHours: string[] | null;
  types: string[];
  websiteUrl: string | null;
  mapsUrl: string;
  reservationUrl: string | null;
  photoUrl: string | null;
}

// --- Candidate Layer ---

export interface ScoreBreakdown {
  queryMatch: number;
  vibeMatch: number;
  cuisineMatch: number;
  locationFit: number;
  budgetFit: number;
  reviewQuality: number;
  reviewVolume: number;
  xhsPopularity: number;
  reservationFriendliness: number;
}

export interface RestaurantCandidate {
  id: string;
  canonicalName: string;
  aliasNames: string[];
  xhsMentions: XhsMention[];
  googlePlace: GooglePlaceData | null;
  cuisineTags: string[];
  vibeTags: string[];
  neighborhood: string | null;
  scoreBreakdown: ScoreBreakdown;
  totalScore: number;
}

// --- Output Layer ---

export interface Recommendation {
  rank: number;
  restaurant: RestaurantCandidate;
  whyItFits: string;
  pros: string[];
  caveats: string[];
  xhsSummary: string;
  googleSummary: string;
}

export interface RecommendationResponse {
  query: ParsedQuery;
  recommendations: Recommendation[];
  searchMetadata: {
    xhsFeedsSearched: number;
    googlePlacesQueried: number;
    candidatesBeforeMerge: number;
    candidatesAfterMerge: number;
    processingTimeMs: number;
  };
}

// --- UI State ---

export type AppView = "idle" | "loading" | "results" | "detail";

export interface LoadingStep {
  label: string;
  status: "pending" | "active" | "done";
}
