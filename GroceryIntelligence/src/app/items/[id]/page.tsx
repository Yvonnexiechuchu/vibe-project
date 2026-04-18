"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { TopBar } from "@/components/ui/TopBar";
import { PriceChart } from "@/components/PriceChart";
import { ChevronDownIcon, LeafIcon } from "@/components/Icon";
import {
  fetchOrganicResearch,
  fetchSnapshot,
  type DataSnapshot,
} from "@/lib/client-api";
import type { OrganicResearch, PriceEntry } from "@/lib/types";
import { formatUnitPrice, formatUsd } from "@/lib/units";

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<DataSnapshot | null>(null);

  useEffect(() => {
    fetchSnapshot().then(setData).catch(() => setData(null));
  }, []);

  const item = data?.items.find((i) => i.id === id) ?? null;
  const itemPrices = useMemo(
    () => (data ? data.prices.filter((p) => p.itemId === id) : []),
    [data, id]
  );

  const byStore = useMemo(() => {
    const m = new Map<string, PriceEntry[]>();
    for (const p of itemPrices) {
      const list = m.get(p.storeId) ?? [];
      list.push(p);
      m.set(p.storeId, list);
    }
    return m;
  }, [itemPrices]);

  const chartData = useMemo(
    () =>
      itemPrices
        .slice()
        .sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate))
        .map((p) => ({
          date: p.purchaseDate,
          unitPrice: p.unitPrice,
          storeName:
            data?.stores.find((s) => s.id === p.storeId)?.name ?? "Store",
        })),
    [itemPrices, data?.stores]
  );

  const stats = useMemo(() => {
    if (!itemPrices.length) return null;
    const cheapest = itemPrices.reduce((a, b) =>
      a.unitPrice < b.unitPrice ? a : b
    );
    const sorted = [...itemPrices].sort((a, b) =>
      a.purchaseDate.localeCompare(b.purchaseDate)
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const pctChange =
      first.unitPrice > 0
        ? ((last.unitPrice - first.unitPrice) / first.unitPrice) * 100
        : 0;
    return { cheapest, first, last, pctChange };
  }, [itemPrices]);

  if (!data) {
    return (
      <Screen>
        <TopBar showBack title="Item" />
        <div className="px-6 mt-4 space-y-3">
          <div className="skeleton h-[120px] rounded-[var(--radius-xl)]" />
          <div className="skeleton h-[60px] rounded-[var(--radius-lg)]" />
          <div className="skeleton h-[220px] rounded-[var(--radius-lg)]" />
        </div>
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen>
        <TopBar showBack title="Not found" />
        <div className="px-6 mt-10 text-center">
          <p className="text-h2 text-[var(--ink-50)]">Item not found.</p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar showBack />

      <div className="px-6 space-y-5">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--ink)] p-6">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[var(--terracotta)] opacity-15" />
          <p className="text-caption text-white/40">{item.category}</p>
          <p className="text-display text-white mt-1">{item.canonicalName}</p>
          <p className="text-meta text-white/50 mt-3">
            Tracked in {item.lockedUnit} · {itemPrices.length} purchase
            {itemPrices.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[var(--radius-lg)] bg-white border border-[var(--ink-15)] shadow-[var(--shadow-sm)] p-4">
              <p className="text-caption text-[var(--ink-30)]">Best price</p>
              <p className="text-h1 mt-1">
                {formatUnitPrice(stats.cheapest.unitPrice, item.lockedUnit)}
              </p>
              <p className="text-meta text-[var(--ink-50)] truncate mt-0.5">
                {data.stores.find((s) => s.id === stats.cheapest.storeId)?.name}
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] bg-white border border-[var(--ink-15)] shadow-[var(--shadow-sm)] p-4">
              <p className="text-caption text-[var(--ink-30)]">Since first</p>
              <p
                className="text-h1 mt-1"
                style={{
                  color:
                    stats.pctChange > 0
                      ? "var(--terracotta)"
                      : stats.pctChange < 0
                      ? "var(--sage)"
                      : "var(--ink)",
                }}
              >
                {stats.pctChange >= 0 ? "+" : ""}
                {stats.pctChange.toFixed(1)}%
              </p>
              <p className="text-meta text-[var(--ink-50)] truncate mt-0.5">
                {formatUnitPrice(stats.first.unitPrice, item.lockedUnit)} →{" "}
                {formatUnitPrice(stats.last.unitPrice, item.lockedUnit)}
              </p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div>
          <h2 className="text-h2 mb-3">Price history</h2>
          <PriceChart data={chartData} unit={item.lockedUnit} />
        </div>

        {/* By store */}
        <div>
          <h2 className="text-h2 mb-3">By store</h2>
          <div className="flex flex-col gap-2">
            {[...byStore.entries()]
              .map(([storeId, entries]) => {
                const store = data.stores.find((s) => s.id === storeId);
                const cheapest = entries.reduce((a, b) =>
                  a.unitPrice < b.unitPrice ? a : b
                );
                const latest = [...entries].sort((a, b) =>
                  b.purchaseDate.localeCompare(a.purchaseDate)
                )[0];
                return { store, entries, cheapest, latest };
              })
              .sort((a, b) => a.cheapest.unitPrice - b.cheapest.unitPrice)
              .map(({ store, entries, cheapest, latest }) => (
                <div
                  key={store?.id}
                  className="rounded-[var(--radius-lg)] bg-white border border-[var(--ink-15)] p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-h3">{store?.name ?? "Unknown"}</p>
                    <p className="text-h3 text-[var(--terracotta)]">
                      {formatUnitPrice(cheapest.unitPrice, item.lockedUnit)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-meta text-[var(--ink-50)]">
                      {entries.length} visits · last{" "}
                      {latest.purchaseDate.slice(5)}
                    </p>
                    <p className="text-meta text-[var(--ink-30)]">
                      {formatUsd(latest.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Organic */}
        <OrganicPanel category={item.category} />
      </div>

      <div className="h-8" />
    </Screen>
  );
}

function OrganicPanel({ category }: { category: string }) {
  const [open, setOpen] = useState(false);
  const [research, setResearch] = useState<OrganicResearch | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onOpen() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (research) return;
    setLoading(true);
    setErr(null);
    try {
      const r = await fetchOrganicResearch(category);
      setResearch(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Research failed");
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
    <div className="rounded-[var(--radius-xl)] bg-white border border-[var(--ink-15)] shadow-[var(--shadow-sm)]">
      <button
        type="button"
        onClick={onOpen}
        className="w-full p-5 flex items-center gap-3.5"
      >
        <div className="w-11 h-11 rounded-[12px] bg-[var(--sage-light)] flex items-center justify-center shrink-0">
          <LeafIcon size={20} className="text-[var(--sage)]" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-h3">Is organic worth it?</p>
          <p className="text-meta text-[var(--ink-50)]">
            Evidence-based for {category}
          </p>
        </div>
        <ChevronDownIcon
          size={18}
          className={`text-[var(--ink-30)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t border-[var(--ink-15)] p-5 animate-fade-in">
          {loading && (
            <div className="space-y-2">
              <div className="skeleton h-5 rounded-md" />
              <div className="skeleton h-5 rounded-md w-3/4" />
              <div className="skeleton h-5 rounded-md w-2/3" />
            </div>
          )}
          {err && (
            <p className="text-body text-[var(--terracotta)]">{err}</p>
          )}
          {research && (
            <div className="space-y-4">
              <p className="text-body leading-relaxed">{research.summary}</p>
              {research.keyDifferences && (
                <div>
                  <p className="text-caption text-[var(--ink-30)] mb-1.5">Key differences</p>
                  <p className="text-meta text-[var(--ink-80)] whitespace-pre-line leading-relaxed">
                    {research.keyDifferences}
                  </p>
                </div>
              )}
              {research.pesticideImpact && (
                <div>
                  <p className="text-caption text-[var(--ink-30)] mb-1.5">Pesticides</p>
                  <p className="text-meta text-[var(--ink-80)] leading-relaxed">{research.pesticideImpact}</p>
                </div>
              )}
              {sources.length > 0 && (
                <div>
                  <p className="text-caption text-[var(--ink-30)] mb-1.5">Sources</p>
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
                </div>
              )}
              <p className="text-caption text-[var(--ink-30)]">
                Refreshed {research.refreshedAt.slice(0, 10)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
