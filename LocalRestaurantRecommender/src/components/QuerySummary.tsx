"use client";

import type { ParsedQuery } from "@/lib/types";

interface QuerySummaryProps {
  query: ParsedQuery;
}

export default function QuerySummary({ query }: QuerySummaryProps) {
  const tags: string[] = [];
  if (query.cuisine) tags.push(query.cuisine);
  if (query.location) tags.push(query.location);
  if (query.partySize) tags.push(`${query.partySize} people`);
  if (query.budget) tags.push(query.budget === "low" ? "$" : query.budget === "medium" ? "$$" : "$$$");
  if (query.occasion) tags.push(query.occasion);
  if (query.timing) tags.push(query.timing);
  query.vibe.forEach(v => tags.push(v));
  query.specialConstraints.forEach(c => tags.push(c));

  return (
    <div className="space-y-2">
      <p className="text-sm text-text-secondary italic">&ldquo;{query.rawText}&rdquo;</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs rounded-full bg-accent-light text-accent font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
