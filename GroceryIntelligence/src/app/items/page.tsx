"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { TopBar } from "@/components/ui/TopBar";
import { ChevronRightIcon, LeafIcon, SearchIcon } from "@/components/Icon";
import { fetchSnapshot, type DataSnapshot } from "@/lib/client-api";
import type { Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { formatUnitPrice } from "@/lib/units";

export default function ItemsPage() {
  const [data, setData] = useState<DataSnapshot | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "All">("All");

  useEffect(() => {
    fetchSnapshot().then(setData).catch(() => setData({ items: [], stores: [], prices: [], research: [] }));
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    return data.items
      .filter((i) => cat === "All" || i.category === cat)
      .filter((i) => !needle || i.canonicalName.toLowerCase().includes(needle))
      .map((item) => {
        const prices = data.prices.filter((p) => p.itemId === item.id);
        const cheapest = prices.length
          ? prices.reduce((a, b) => (a.unitPrice < b.unitPrice ? a : b))
          : null;
        const mostRecent = prices.length
          ? [...prices].sort((a, b) =>
              b.purchaseDate.localeCompare(a.purchaseDate)
            )[0]
          : null;
        const hasOrganic = prices.some((p) => p.organic);
        return { item, cheapest, mostRecent, count: prices.length, hasOrganic };
      })
      .sort((a, b) => a.item.canonicalName.localeCompare(b.item.canonicalName));
  }, [data, q, cat]);

  return (
    <Screen>
      <TopBar title="Items" />

      <div className="px-6">
        <div className="relative">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items"
            className="pl-12"
          />
          <SearchIcon
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-300)]"
            size={20}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar px-6 pb-1">
        <Chip size="sm" active={cat === "All"} onClick={() => setCat("All")}>
          All
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} size="sm" active={cat === c} onClick={() => setCat(c)}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="px-6 mt-4 flex flex-col gap-2">
        {data === null && (
          <>
            <div className="skeleton h-[72px] ink-border rounded-[16px]" />
            <div className="skeleton h-[72px] ink-border rounded-[16px]" />
            <div className="skeleton h-[72px] ink-border rounded-[16px]" />
          </>
        )}

        {data && rows.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-h3">No items yet</p>
            <p className="text-meta text-[var(--ink-800)] mt-2">
              Upload a receipt to start building your database.
            </p>
          </div>
        )}

        {rows.map(({ item, cheapest, count, hasOrganic }) => (
          <Link key={item.id} href={`/items/${item.id}`} className="block">
            <div className="ink-border ink-shadow rounded-[16px] bg-white p-4 flex items-center gap-3 ink-press">
              <div className="w-12 h-12 rounded-[12px] ink-border bg-[var(--ink-100)] flex items-center justify-center shrink-0 text-h3">
                {item.canonicalName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-h3 truncate">{item.canonicalName}</p>
                  {hasOrganic && (
                    <LeafIcon size={16} className="text-[var(--accent-green)] shrink-0" />
                  )}
                </div>
                <p className="text-meta text-[var(--ink-800)] truncate">
                  {item.category} · {count} purchase{count === 1 ? "" : "s"}
                </p>
              </div>
              <div className="text-right shrink-0">
                {cheapest ? (
                  <>
                    <p className="text-h3">
                      {formatUnitPrice(cheapest.unitPrice, item.lockedUnit)}
                    </p>
                    <p className="text-caption text-[var(--ink-300)]">best</p>
                  </>
                ) : (
                  <p className="text-meta text-[var(--ink-300)]">no data</p>
                )}
              </div>
              <ChevronRightIcon size={20} className="text-[var(--ink-300)] shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      <div className="h-10" />
    </Screen>
  );
}
