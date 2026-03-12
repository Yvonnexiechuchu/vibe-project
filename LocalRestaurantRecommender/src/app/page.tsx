"use client";

import { useState, useCallback } from "react";
import type { AppView, RecommendationResponse, LoadingStep, Recommendation } from "@/lib/types";
import ChatInput from "@/components/ChatInput";
import ExamplePrompts from "@/components/ExamplePrompts";
import FilterChips from "@/components/FilterChips";
import LoadingState from "@/components/LoadingState";
import QuerySummary from "@/components/QuerySummary";
import RecommendationCard from "@/components/RecommendationCard";
import RestaurantDetail from "@/components/RestaurantDetail";

const INITIAL_STEPS: LoadingStep[] = [
  { label: "Understanding your request", status: "pending" },
  { label: "Searching Xiaohongshu for trending spots", status: "pending" },
  { label: "Enriching with Google data", status: "pending" },
  { label: "Ranking and picking the best matches", status: "pending" },
  { label: "Preparing your recommendations", status: "pending" },
];

export default function Home() {
  const [view, setView] = useState<AppView>("idle");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>(INITIAL_STEPS);
  const [error, setError] = useState<string | null>(null);

  const updateStep = useCallback((index: number, status: "active" | "done") => {
    setLoadingSteps(prev =>
      prev.map((s, i) => {
        if (i === index) return { ...s, status };
        if (i < index) return { ...s, status: "done" };
        return s;
      })
    );
  }, []);

  const handleSubmit = useCallback(async (query: string) => {
    setView("loading");
    setError(null);
    setResult(null);
    setSelectedRec(null);
    setLoadingSteps(INITIAL_STEPS.map(s => ({ ...s, status: "pending" })));

    try {
      updateStep(0, "active");

      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed with status ${res.status}`);
      }

      // Stream SSE progress updates
      if (res.headers.get("content-type")?.includes("text/event-stream")) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let finalResult: RecommendationResponse | null = null;

        if (reader) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === "step") {
                    updateStep(data.step, data.status);
                  } else if (data.type === "result") {
                    finalResult = data.data;
                  } else if (data.type === "error") {
                    throw new Error(data.message);
                  }
                } catch (e) {
                  if (e instanceof SyntaxError) continue;
                  throw e;
                }
              }
            }
          }
        }

        if (finalResult) {
          setResult(finalResult);
          setView("results");
        }
      } else {
        // Non-streaming fallback
        const data: RecommendationResponse = await res.json();
        setLoadingSteps(prev => prev.map(s => ({ ...s, status: "done" as const })));
        setResult(data);
        setView("results");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setView("idle");
    }
  }, [updateStep]);

  const handleExampleSelect = (prompt: string) => {
    setInputValue(prompt);
  };

  const handleNewSearch = () => {
    setView("idle");
    setResult(null);
    setSelectedRec(null);
    setInputValue("");
  };

  // Detail view
  if (view === "detail" && selectedRec) {
    return (
      <main className="min-h-dvh px-4 py-6 max-w-lg mx-auto">
        <RestaurantDetail
          rec={selectedRec}
          onBack={() => { setView("results"); setSelectedRec(null); }}
        />
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col">
      {/* Header */}
      {view !== "idle" && (
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border-light px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <button onClick={handleNewSearch} className="flex items-center gap-2 text-accent font-semibold text-sm hover:opacity-80 transition-opacity">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              New search
            </button>
            <span className="text-xs text-text-tertiary">DMV Area</span>
          </div>
        </header>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Idle state — search UI */}
        {view === "idle" && (
          <div className="w-full max-w-lg mx-auto space-y-8 py-12">
            {/* Logo / title */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Where should we eat?</h1>
              <p className="text-sm text-text-secondary max-w-xs mx-auto">
                Describe your ideal dining experience and I&apos;ll find the best spots in the DMV area.
              </p>
            </div>

            {/* Chat input */}
            <ChatInput onSubmit={handleSubmit} initialValue={inputValue} />

            {/* Filters */}
            <div className="flex justify-center">
              <FilterChips onFiltersChange={() => {}} />
            </div>

            {/* Example prompts */}
            <div className="space-y-2">
              <p className="text-xs text-text-tertiary text-center">Try an example</p>
              <ExamplePrompts onSelect={handleExampleSelect} />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-xhs-red/10 border border-xhs-red/20 px-4 py-3 text-sm text-xhs-red text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {view === "loading" && (
          <LoadingState steps={loadingSteps} />
        )}

        {/* Results state */}
        {view === "results" && result && (
          <div className="w-full max-w-lg mx-auto py-6 space-y-6">
            <QuerySummary query={result.query} />

            <div className="space-y-4">
              {result.recommendations.map((rec) => (
                <RecommendationCard
                  key={rec.rank}
                  rec={rec}
                  onViewDetail={() => { setSelectedRec(rec); setView("detail"); }}
                />
              ))}
            </div>

            {/* Metadata */}
            <div className="text-center text-xs text-text-tertiary space-y-1 pt-4">
              <p>
                Searched {result.searchMetadata.xhsFeedsSearched} Xiaohongshu posts
                {" "}&bull;{" "}
                Queried {result.searchMetadata.googlePlacesQueried} Google places
              </p>
              <p>
                {result.searchMetadata.candidatesAfterMerge} candidates from {result.searchMetadata.candidatesBeforeMerge} mentions
                {" "}&bull;{" "}
                {(result.searchMetadata.processingTimeMs / 1000).toFixed(1)}s
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
