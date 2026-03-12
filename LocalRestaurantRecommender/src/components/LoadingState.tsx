"use client";

import type { LoadingStep } from "@/lib/types";

interface LoadingStateProps {
  steps: LoadingStep[];
}

export default function LoadingState({ steps }: LoadingStateProps) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-8 py-8">
      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              step.status === "active"
                ? "bg-accent-light text-accent"
                : step.status === "done"
                ? "bg-surface text-success"
                : "text-text-tertiary"
            }`}
          >
            {step.status === "active" ? (
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "200ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "400ms" }} />
              </div>
            ) : step.status === "done" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <div className="w-4 h-4 rounded-full border border-border-light" />
            )}
            <span className="text-sm font-medium">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Skeleton cards */}
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-border-light p-5 space-y-3" style={{ opacity: 0.4 + (i * 0.1) }}>
            <div className="skeleton h-5 w-2/3" />
            <div className="skeleton h-3 w-1/3" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
