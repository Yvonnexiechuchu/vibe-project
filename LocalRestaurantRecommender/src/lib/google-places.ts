import type { GooglePlaceData } from "./types";
import { DMV_CENTER } from "./constants";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.currentOpeningHours",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.types",
  "places.location",
  "places.reservable",
  "places.photos",
].join(",");

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function searchPlace(restaurantName: string, neighborhood?: string | null): Promise<GooglePlaceData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn("[Google] No GOOGLE_PLACES_API_KEY set");
    return null;
  }

  const textQuery = neighborhood
    ? `${restaurantName}, ${neighborhood}, Washington DC area`
    : `${restaurantName}, Washington DC area`;

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery,
        locationBias: {
          circle: {
            center: {
              latitude: DMV_CENTER.latitude,
              longitude: DMV_CENTER.longitude,
            },
            radius: DMV_CENTER.radiusMeters,
          },
        },
        maxResultCount: 1,
      }),
    });

    if (!res.ok) {
      console.error("[Google] API error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    if (!data.places || data.places.length === 0) return null;

    return normalizePlace(data.places[0]);
  } catch (err) {
    console.error("[Google] Search error:", err);
    return null;
  }
}

export async function searchPlacesBatch(
  restaurants: { name: string; neighborhood?: string | null }[]
): Promise<Map<string, GooglePlaceData>> {
  const results = new Map<string, GooglePlaceData>();

  // Process in parallel with concurrency limit of 5
  const batchSize = 5;
  for (let i = 0; i < restaurants.length; i += batchSize) {
    const batch = restaurants.slice(i, i + batchSize);
    const promises = batch.map(async (r) => {
      const place = await searchPlace(r.name, r.neighborhood);
      if (place) {
        results.set(r.name, place);
      }
    });
    await Promise.all(promises);
  }

  return results;
}

function normalizePlace(raw: any): GooglePlaceData {
  // Map Google's price level enum to number
  const priceLevelMap: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };

  const priceLevel = raw.priceLevel ? (priceLevelMap[raw.priceLevel] ?? null) : null;

  // Extract photo URL (first photo reference)
  let photoUrl: string | null = null;
  if (raw.photos && raw.photos.length > 0) {
    const photoName = raw.photos[0].name;
    if (photoName && process.env.GOOGLE_PLACES_API_KEY) {
      photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=400&maxWidthPx=400&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    }
  }

  // Extract opening hours
  let openingHours: string[] | null = null;
  let openNow: boolean | null = null;
  if (raw.currentOpeningHours) {
    openNow = raw.currentOpeningHours.openNow ?? null;
    openingHours = raw.currentOpeningHours.weekdayDescriptions || null;
  }

  return {
    placeId: raw.id || "",
    name: raw.displayName?.text || "",
    address: raw.formattedAddress || "",
    lat: raw.location?.latitude || 0,
    lng: raw.location?.longitude || 0,
    rating: raw.rating || null,
    reviewCount: raw.userRatingCount || 0,
    priceLevel,
    openNow,
    openingHours,
    types: raw.types || [],
    websiteUrl: raw.websiteUri || null,
    mapsUrl: raw.googleMapsUri || "",
    reservationUrl: raw.reservable ? raw.websiteUri : null,
    photoUrl,
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */
