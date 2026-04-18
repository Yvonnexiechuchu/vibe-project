"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { TopBar } from "@/components/ui/TopBar";
import { LeafIcon } from "@/components/Icon";
import { fetchOrganicResearch } from "@/lib/client-api";
import { CATEGORIES, type Category, type OrganicResearch } from "@/lib/types";

export default function OrganicPage() {
  const [cat, setCat] = useState<Category | null>(null);
  const [research, setResearch] = useState<OrganicResearch | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function selectCategory(c: Category) {
    setCat(c);
    setResearch(null);
    setLoading(true);
    setErr(null);
    try {
      const r = await fetchOrganicResearch(c);
      setResearch(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  let sources: { title: string; publisher?: string; year?: number; url?: string | null }[] = [];
  try {
    sources = research ? JSON.parse(research.sources) : [];
  } catch {
    sources = [];
  }

  return (
    <Screen>
      <TopBar showBack title="Is organic worth it?" />

      <div className="px-6">
        <div className="rounded-[var(--radius-2xl)] bg-[var(--sage-light)] border border-[var(--sage)]/15 p-5">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-[12px] bg-white flex items-center justify-center shrink-0">
              <LeafIcon size={20} className="text-[var(--sage)]" />
            </div>
            <div>
              <p className="text-h3">Pick a food category</p>
              <p className="text-meta text-[var(--ink-50)] mt-1">
                Real-source research, cached quarterly.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 px-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Chip size="sm" key={c} active={cat === c} onClick={() => selectCategory(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="px-6 mt-6">
        {loading && (
          <div className="space-y-3">
            <div className="skeleton h-24 rounded-[var(--radius-xl)]" />
            <div className="skeleton h-24 rounded-[var(--radius-xl)]" />
          </div>
        )}
        {err && (
          <Card color="cream" padded>
            <p className="text-h3 text-[var(--terracotta)]">Can&apos;t load research</p>
            <p className="text-meta text-[var(--ink-50)] mt-1">{err}</p>
          </Card>
        )}
        {research && (
          <div className="space-y-3 animate-fade-in-up stagger">
            <Card padded className="animate-fade-in-up opacity-0">
              <p className="text-caption text-[var(--ink-30)] mb-2">Takeaway</p>
              <p className="text-body leading-relaxed">{research.summary}</p>
            </Card>

            {research.keyDifferences && (
              <Card padded className="animate-fade-in-up opacity-0">
                <p className="text-caption text-[var(--ink-30)] mb-2">Key differences</p>
                <p className="text-meta text-[var(--ink-80)] whitespace-pre-line leading-relaxed">
                  {research.keyDifferences}
                </p>
              </Card>
            )}

            {research.pesticideImpact && (
              <Card padded className="animate-fade-in-up opacity-0">
                <p className="text-caption text-[var(--ink-30)] mb-2">Pesticides</p>
                <p className="text-meta text-[var(--ink-80)] leading-relaxed">{research.pesticideImpact}</p>
              </Card>
            )}

            {sources.length > 0 && (
              <Card padded className="animate-fade-in-up opacity-0">
                <p className="text-caption text-[var(--ink-30)] mb-2">Sources</p>
                <ul className="space-y-1">
                  {sources.map((s, i) => (
                    <li key={i} className="text-meta text-[var(--ink-50)]">
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-[var(--ink)]">
                          {s.title}
                        </a>
                      ) : (
                        <span>{s.title}</span>
                      )}
                      {s.publisher ? ` · ${s.publisher}` : ""}
                      {s.year ? ` (${s.year})` : ""}
                    </li>
                  ))}
                </ul>
                <p className="text-caption text-[var(--ink-30)] mt-3">
                  Refreshed {research.refreshedAt.slice(0, 10)}
                </p>
              </Card>
            )}
          </div>
        )}
        {!loading && !research && !cat && (
          <p className="text-body text-[var(--ink-30)] text-center py-16">
            Tap a category to see the evidence.
          </p>
        )}
      </div>
      <div className="h-8" />
    </Screen>
  );
}
