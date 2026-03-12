"use client";

import type { Recommendation } from "@/lib/types";

interface RestaurantDetailProps {
  rec: Recommendation;
  onBack: () => void;
}

export default function RestaurantDetail({ rec, onBack }: RestaurantDetailProps) {
  const { restaurant } = rec;
  const place = restaurant.googlePlace;

  return (
    <div className="animate-fade-in-up w-full max-w-lg mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to results
      </button>

      {/* Name & ranking */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center">
            {rec.rank}
          </span>
          <h2 className="text-2xl font-bold text-foreground">{restaurant.canonicalName}</h2>
        </div>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {restaurant.neighborhood && (
            <span className="text-sm text-text-secondary">{restaurant.neighborhood}</span>
          )}
          {place?.priceLevel && (
            <span className="text-sm text-text-secondary font-medium">{"$".repeat(place.priceLevel)}</span>
          )}
          {place?.rating && (
            <span className="flex items-center gap-1 text-star-gold">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm font-semibold text-foreground">{place.rating.toFixed(1)}</span>
              <span className="text-xs text-text-tertiary">({place.reviewCount} reviews)</span>
            </span>
          )}
        </div>
      </div>

      {/* Why it fits */}
      <div className="rounded-xl bg-accent-light border border-accent/10 p-4">
        <h3 className="text-sm font-semibold text-accent mb-1">Why it fits your request</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{rec.whyItFits}</p>
      </div>

      {/* Pros & caveats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-success uppercase tracking-wider">Pros</h4>
          {rec.pros.map((pro, i) => (
            <div key={i} className="flex items-start gap-1.5 text-sm text-text-secondary">
              <svg className="w-4 h-4 text-success flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {pro}
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-star-gold uppercase tracking-wider">Watch out</h4>
          {rec.caveats.map((caveat, i) => (
            <div key={i} className="flex items-start gap-1.5 text-sm text-text-secondary">
              <svg className="w-4 h-4 text-star-gold flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {caveat}
            </div>
          ))}
        </div>
      </div>

      {/* Source insights */}
      <div className="space-y-3">
        {rec.xhsSummary && (
          <div className="rounded-xl border border-xhs-red/15 bg-xhs-red/5 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-xhs-red/15 text-xhs-red">XHS</span>
              <h4 className="text-sm font-semibold text-foreground">Xiaohongshu says</h4>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{rec.xhsSummary}</p>
            {restaurant.xhsMentions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {restaurant.xhsMentions.slice(0, 3).map((m, i) => (
                  <a
                    key={i}
                    href={m.feedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-xhs-red hover:underline"
                  >
                    View post by {m.authorName}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {rec.googleSummary && (
          <div className="rounded-xl border border-google-blue/15 bg-google-blue/5 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-google-blue/15 text-google-blue">G</span>
              <h4 className="text-sm font-semibold text-foreground">Google says</h4>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{rec.googleSummary}</p>
          </div>
        )}
      </div>

      {/* Practical info */}
      {place && (
        <div className="rounded-xl border border-border p-4 space-y-2.5">
          <h4 className="text-sm font-semibold text-foreground">Practical info</h4>
          {place.address && (
            <div className="flex items-start gap-2 text-sm text-text-secondary">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {place.address}
            </div>
          )}
          {place.openingHours && place.openingHours.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-text-secondary">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <div className="space-y-0.5">
                {place.openingHours.map((h, i) => (
                  <div key={i}>{h}</div>
                ))}
              </div>
            </div>
          )}
          {place.openNow !== null && (
            <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
              place.openNow ? "bg-success/10 text-success" : "bg-xhs-red/10 text-xhs-red"
            }`}>
              {place.openNow ? "Open now" : "Closed"}
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {place?.mapsUrl && (
          <a
            href={place.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm font-medium text-text-secondary hover:text-accent hover:border-accent/30 hover:bg-accent-light transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            View on Map
          </a>
        )}
        {place?.reservationUrl ? (
          <a
            href={place.reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-all"
          >
            Reserve a Table
          </a>
        ) : place?.websiteUrl ? (
          <a
            href={place.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-all"
          >
            Visit Website
          </a>
        ) : null}
      </div>

      {/* Score breakdown (debug) */}
      <details className="text-xs text-text-tertiary">
        <summary className="cursor-pointer hover:text-text-secondary transition-colors">Score breakdown</summary>
        <div className="mt-2 grid grid-cols-2 gap-1 p-3 rounded-lg bg-background">
          {Object.entries(restaurant.scoreBreakdown).map(([key, val]) => (
            <div key={key} className="flex justify-between">
              <span>{key}</span>
              <span className="font-mono">{(val as number).toFixed(2)}</span>
            </div>
          ))}
          <div className="col-span-2 border-t border-border-light mt-1 pt-1 flex justify-between font-semibold">
            <span>Total</span>
            <span className="font-mono">{restaurant.totalScore.toFixed(2)}</span>
          </div>
        </div>
      </details>
    </div>
  );
}
