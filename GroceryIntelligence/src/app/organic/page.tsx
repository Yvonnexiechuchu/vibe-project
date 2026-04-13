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
        <Card color="green">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-[14px] ink-border bg-white flex items-center justify-center shrink-0">
              <LeafIcon />
            </div>
            <div>
              <p className="text-h3">Pick a food category</p>
              <p className="text-meta mt-1 text-[var(--ink-800)]">
                I&apos;ll pull real-source research. Cached quarterly to stay
                token-light.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 px-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Chip size="sm" key={c} active={cat === c} onClick={() => selectCategory(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="px-6 mt-6">
        {loading && (
          <div className="space-y-3">
            <div className="skeleton h-24 ink-border rounded-[16px]" />
            <div className="skeleton h-24 ink-border rounded-[16px]" />
          </div>
        )}
        {err && (
          <Card color="red" padded>
            <p className="text-h3">Can&apos;t load research</p>
            <p className="text-meta mt-1">{err}</p>
          </Card>
        )}
        {research && (
          <div className="space-y-4 animate-fade-in-up">
            <Card padded>
              <p className="text-caption text-[var(--ink-300)]">Takeaway</p>
              <p className="text-body mt-1">{research.summary}</p>
            </Card>

            {research.keyDifferences && (
              <Card padded>
                <p className="text-caption text-[var(--ink-300)]">
                  Key differences
                </p>
                <p className="text-meta mt-2 whitespace-pre-line">
                  {research.keyDifferences}
                </p>
              </Card>
            )}

            {research.pesticideImpact && (
              <Card padded>
                <p className="text-caption text-[var(--ink-300)]">Pesticides</p>
                <p className="text-meta mt-2">{research.pesticideImpact}</p>
              </Card>
            )}

            {sources.length > 0 && (
              <Card padded>
                <p className="text-caption text-[var(--ink-300)]">Sources</p>
                <ul className="mt-2 space-y-1">
                  {sources.map((s, i) => (
                    <li key={i} className="text-meta">
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
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
                <p className="text-caption text-[var(--ink-300)] mt-3">
                  Refreshed {research.refreshedAt.slice(0, 10)}
                </p>
              </Card>
            )}
          </div>
        )}
        {!loading && !research && !cat && (
          <p className="text-body text-[var(--ink-800)] text-center py-12">
            Tap a category to see the evidence.
          </p>
        )}
      </div>
      <div className="h-10" />
    </Screen>
  );
}
