"use client";

import { useState } from "react";

const CUISINE_CHIPS = ["Korean", "Chinese", "Japanese", "Italian", "Mexican", "Brunch", "Seafood", "BBQ"];
const PRICE_CHIPS = ["$", "$$", "$$$"];
const AREA_CHIPS = ["DC", "Arlington", "Bethesda", "Old Town", "Annandale", "Tysons"];

interface FilterChipsProps {
  onFiltersChange: (filters: { cuisines: string[]; prices: string[]; areas: string[] }) => void;
}

export default function FilterChips({ onFiltersChange }: FilterChipsProps) {
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [prices, setPrices] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void, key: "cuisines" | "prices" | "areas") => {
    const next = arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
    setter(next);
    const all = { cuisines, prices, areas, [key]: next };
    onFiltersChange(all);
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-sm text-text-tertiary hover:text-accent transition-colors flex items-center gap-1"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        Add filters
      </button>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">Filters</span>
        <button onClick={() => setExpanded(false)} className="text-xs text-text-tertiary hover:text-accent transition-colors">
          Hide
        </button>
      </div>

      <div>
        <span className="text-xs text-text-tertiary mb-1.5 block">Cuisine</span>
        <div className="flex flex-wrap gap-1.5">
          {CUISINE_CHIPS.map(c => (
            <button
              key={c}
              onClick={() => toggle(cuisines, c, setCuisines, "cuisines")}
              className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                cuisines.includes(c)
                  ? "bg-accent text-white border-accent"
                  : "bg-surface border-border text-text-secondary hover:border-accent/30"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs text-text-tertiary mb-1.5 block">Price</span>
        <div className="flex flex-wrap gap-1.5">
          {PRICE_CHIPS.map(p => (
            <button
              key={p}
              onClick={() => toggle(prices, p, setPrices, "prices")}
              className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                prices.includes(p)
                  ? "bg-accent text-white border-accent"
                  : "bg-surface border-border text-text-secondary hover:border-accent/30"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs text-text-tertiary mb-1.5 block">Area</span>
        <div className="flex flex-wrap gap-1.5">
          {AREA_CHIPS.map(a => (
            <button
              key={a}
              onClick={() => toggle(areas, a, setAreas, "areas")}
              className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                areas.includes(a)
                  ? "bg-accent text-white border-accent"
                  : "bg-surface border-border text-text-secondary hover:border-accent/30"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
