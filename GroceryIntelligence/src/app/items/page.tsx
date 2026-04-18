"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
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
        const hasOrganic = prices.some((p) => p.organic);
        return { item, cheapest, count: prices.length, hasOrganic };
      })
      .sort((a, b) => a.item.canonicalName.localeCompare(b.item.canonicalName));
  }, [data, q, cat]);

  return (
    <Screen>
      <div className="px-6 pt-10 pb-2 safe-area-top">
        <h1 className="text-h1">Items</h1>
      </div>

      <div className="px-6 mt-3">
        <div className="relative">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search items"
            className="pl-11"
          />
          <SearchIcon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-30)]"
            size={18}
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

      <div className="px-6 mt-5 flex flex-col gap-2 stagger">
        {data === null && (
          <>
            <div className="skeleton h-[72px] rounded-[var(--radius-lg)]" />
            <div className="skeleton h-[72px] rounded-[var(--radius-lg)]" />
            <div className="skeleton h-[72px] rounded-[var(--radius-lg)]" />
          </>
        )}

        {data && rows.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-h2 text-[var(--ink-50)]">No items yet</p>
            <p className="text-body text-[var(--ink-30)] mt-2">
              Upload a receipt to start building your database.
            </p>
          </div>
        )}

        {rows.map(({ item, cheapest, count, hasOrganic }) => (
          <Link key={item.id} href={`/items/${item.id}`} className="block animate-fade-in-up opacity-0">
            <div className="rounded-[var(--radius-lg)] bg-white border border-[var(--ink-15)] shadow-[var(--shadow-sm)] p-4 flex items-center gap-3.5 transition-all duration-200 hover:shadow-[var(--shadow-md)] active:scale-[0.99]">
              <div className="w-11 h-11 rounded-[10px] bg-[var(--ink-04)] flex items-center justify-center shrink-0">
                <span className="text-h3 text-[var(--ink-50)]">
                  {item.canonicalName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-h3 truncate">{item.canonicalName}</p>
                  {hasOrganic && (
                    <LeafIcon size={14} className="text-[var(--sage)] shrink-0" />
                  )}
                </div>
                <p className="text-meta text-[var(--ink-50)] truncate mt-0.5">
                  {item.category} · {count} purchase{count === 1 ? "" : "s"}
                </p>
              </div>
              <div className="text-right shrink-0">
                {cheapest ? (
                  <>
                    <p className="text-h3">
                      {formatUnitPrice(cheapest.unitPrice, item.lockedUnit)}
                    </p>
                    <p className="text-caption text-[var(--ink-30)]">best</p>
                  </>
                ) : (
                  <p className="text-meta text-[var(--ink-30)]">no data</p>
                )}
              </div>
              <ChevronRightIcon size={18} className="text-[var(--ink-15)] shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      <div className="h-8" />
    </Screen>
  );
}
