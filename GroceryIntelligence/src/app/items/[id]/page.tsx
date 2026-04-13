"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { TopBar } from "@/components/ui/TopBar";
import { Button } from "@/components/ui/Button";
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
          <div className="skeleton h-[200px] ink-border rounded-[16px]" />
          <div className="skeleton h-[60px] ink-border rounded-[16px]" />
          <div className="skeleton h-[60px] ink-border rounded-[16px]" />
        </div>
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen>
        <TopBar showBack title="Not found" />
        <div className="px-6 mt-10 text-center">
          <p className="text-h3">Item not found.</p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar showBack title={item.canonicalName} />

      <div className="px-6 space-y-4">
        <Card color="ink" padded>
          <p className="text-caption text-[var(--ink-300)]">{item.category}</p>
          <p className="text-display mt-1">{item.canonicalName}</p>
          <p className="text-meta opacity-80 mt-2">
            Tracked in {item.lockedUnit} · {itemPrices.length} purchase
            {itemPrices.length === 1 ? "" : "s"}
          </p>
        </Card>

        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="ink-border ink-shadow rounded-[16px] bg-white p-4">
              <p className="text-caption text-[var(--ink-300)]">Best price</p>
              <p className="text-h2 mt-1">
                {formatUnitPrice(stats.cheapest.unitPrice, item.lockedUnit)}
              </p>
              <p className="text-meta text-[var(--ink-800)] truncate">
                {data.stores.find((s) => s.id === stats.cheapest.storeId)?.name}
              </p>
            </div>
            <div className="ink-border ink-shadow rounded-[16px] bg-white p-4">
              <p className="text-caption text-[var(--ink-300)]">Since first</p>
              <p
                className="text-h2 mt-1"
                style={{
                  color:
                    stats.pctChange > 0
                      ? "var(--accent-red)"
                      : stats.pctChange < 0
                      ? "var(--accent-green)"
                      : "var(--ink)",
                }}
              >
                {stats.pctChange >= 0 ? "+" : ""}
                {stats.pctChange.toFixed(1)}%
              </p>
              <p className="text-meta text-[var(--ink-800)] truncate">
                {formatUnitPrice(stats.first.unitPrice, item.lockedUnit)} →{" "}
                {formatUnitPrice(stats.last.unitPrice, item.lockedUnit)}
              </p>
            </div>
          </div>
        )}

        <div>
          <h2 className="text-h2 mb-3">Price history</h2>
          <PriceChart data={chartData} unit={item.lockedUnit} />
        </div>

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
                  className="ink-border rounded-[14px] bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-h3">{store?.name ?? "Unknown"}</p>
                    <p className="text-h3">
                      {formatUnitPrice(cheapest.unitPrice, item.lockedUnit)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-meta text-[var(--ink-800)]">
                      {entries.length} visits · last{" "}
                      {latest.purchaseDate.slice(5)}
                    </p>
                    <p className="text-meta text-[var(--ink-300)]">
                      {formatUsd(latest.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <OrganicPanel category={item.category} />
      </div>

      <div className="h-10" />
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
    <div className="ink-border ink-shadow rounded-[16px] bg-white">
      <button
        type="button"
        onClick={onOpen}
        className="w-full p-4 flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-[14px] ink-border bg-[var(--accent-green)] flex items-center justify-center shrink-0">
          <LeafIcon />
        </div>
        <div className="flex-1 text-left">
          <p className="text-h3">Is organic worth it?</p>
          <p className="text-meta text-[var(--ink-800)]">
            Evidence-based for {category}
          </p>
        </div>
        <ChevronDownIcon
          size={22}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="border-t-2 border-ink p-4 animate-fade-in-up">
          {loading && (
            <div className="space-y-2">
              <div className="skeleton h-5 rounded-md" />
              <div className="skeleton h-5 rounded-md w-3/4" />
              <div className="skeleton h-5 rounded-md w-2/3" />
            </div>
          )}
          {err && (
            <p className="text-body text-[var(--accent-red)]">{err}</p>
          )}
          {research && (
            <div className="space-y-4">
              <p className="text-body">{research.summary}</p>
              {research.keyDifferences && (
                <div>
                  <p className="text-caption text-[var(--ink-300)]">
                    Key differences
                  </p>
                  <p className="text-meta mt-1 whitespace-pre-line">
                    {research.keyDifferences}
                  </p>
                </div>
              )}
              {research.pesticideImpact && (
                <div>
                  <p className="text-caption text-[var(--ink-300)]">
                    Pesticides
                  </p>
                  <p className="text-meta mt-1">{research.pesticideImpact}</p>
                </div>
              )}
              {sources.length > 0 && (
                <div>
                  <p className="text-caption text-[var(--ink-300)]">Sources</p>
                  <ul className="mt-1 space-y-1">
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
                </div>
              )}
              <p className="text-caption text-[var(--ink-300)]">
                Refreshed {research.refreshedAt.slice(0, 10)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
