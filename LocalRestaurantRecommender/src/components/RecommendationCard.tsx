"use client";

import type { Recommendation } from "@/lib/types";

interface RecommendationCardProps {
  rec: Recommendation;
  onViewDetail: () => void;
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  return (
    <span className="flex items-center gap-0.5 text-star-gold">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="text-xs font-semibold text-foreground">{rating.toFixed(1)}</span>
    </span>
  );
}

function PriceLevel({ level }: { level: number | null }) {
  if (level === null) return null;
  const symbols = "$".repeat(Math.max(1, level));
  return <span className="text-xs text-text-secondary font-medium">{symbols}</span>;
}

export default function RecommendationCard({ rec, onViewDetail }: RecommendationCardProps) {
  const { restaurant } = rec;
  const place = restaurant.googlePlace;

  return (
    <div
      className="animate-fade-in-up rounded-2xl border border-border bg-surface p-5 space-y-3.5 hover:shadow-md hover:border-accent/20 transition-all cursor-pointer active:scale-[0.99]"
      onClick={onViewDetail}
      style={{ animationDelay: `${rec.rank * 100}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
              {rec.rank}
            </span>
            <h3 className="text-lg font-semibold text-foreground truncate">{restaurant.canonicalName}</h3>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {restaurant.neighborhood && (
              <span className="text-xs text-text-secondary">{restaurant.neighborhood}</span>
            )}
            {place && <PriceLevel level={place.priceLevel} />}
            {place && <StarRating rating={place.rating} />}
            {place && place.reviewCount > 0 && (
              <span className="text-xs text-text-tertiary">({place.reviewCount})</span>
            )}
          </div>
        </div>
        {/* Source badges */}
        <div className="flex gap-1.5 flex-shrink-0">
          {restaurant.xhsMentions.length > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-xhs-red/10 text-xhs-red">XHS</span>
          )}
          {place && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-google-blue/10 text-google-blue">G</span>
          )}
        </div>
      </div>

      {/* Why it fits */}
      <p className="text-sm text-text-secondary leading-relaxed">{rec.whyItFits}</p>

      {/* Pros & Caveats */}
      <div className="flex flex-wrap gap-1.5">
        {rec.pros.slice(0, 3).map((pro, i) => (
          <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-success/10 text-success font-medium">
            {pro}
          </span>
        ))}
        {rec.caveats.slice(0, 2).map((caveat, i) => (
          <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-star-gold/10 text-star-gold font-medium">
            {caveat}
          </span>
        ))}
      </div>

      {/* Vibe & cuisine tags */}
      {(restaurant.cuisineTags.length > 0 || restaurant.vibeTags.length > 0) && (
        <div className="flex flex-wrap gap-1">
          {restaurant.cuisineTags.slice(0, 3).map((tag, i) => (
            <span key={`c-${i}`} className="px-2 py-0.5 text-[11px] rounded-full border border-border-light text-text-tertiary">
              {tag}
            </span>
          ))}
          {restaurant.vibeTags.slice(0, 3).map((tag, i) => (
            <span key={`v-${i}`} className="px-2 py-0.5 text-[11px] rounded-full border border-border-light text-text-tertiary">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2 pt-1">
        {place?.mapsUrl && (
          <a
            href={place.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-background text-text-secondary hover:text-accent hover:bg-accent-light transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Map
          </a>
        )}
        {place?.reservationUrl && (
          <a
            href={place.reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            Reserve
          </a>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onViewDetail(); }}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-background text-text-secondary hover:text-accent hover:bg-accent-light transition-colors ml-auto"
        >
          Details
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
