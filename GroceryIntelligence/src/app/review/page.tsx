"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { Toggle } from "@/components/ui/Toggle";
import { TopBar } from "@/components/ui/TopBar";
import { ChevronDownIcon } from "@/components/Icon";
import {
  CATEGORIES,
  PACKAGE_UNITS,
  VOLUME_UNITS,
  WEIGHT_UNITS,
  type Category,
  type ChecklistItem,
  type Unit,
} from "@/lib/types";
import { loadSession, saveSession } from "@/lib/receipt-session";
import { formatUsd } from "@/lib/units";

export default function ReviewPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [rows, setRows] = useState<ChecklistItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const parsed = loadSession();
    if (!parsed) {
      router.replace("/upload");
      return;
    }
    setStoreName(parsed.storeName);
    setPurchaseDate(parsed.purchaseDate);
    setRows(
      parsed.items.map((p, i) => ({
        ...p,
        packageSize: p.packageSize ?? 1,
        packageSizeUnit: p.packageSizeUnit ?? "each",
        packageSizeRaw: p.packageSizeRaw ?? `1 ${p.packageSizeUnit ?? "each"}`,
        key: `${i}-${p.rawText}`,
        include: true,
      }))
    );
    setLoaded(true);
  }, [router]);

  function updateRow(key: string, patch: Partial<ChecklistItem>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  const includedCount = rows.filter((r) => r.include).length;
  const total = useMemo(
    () =>
      rows
        .filter((r) => r.include)
        .reduce((a, b) => a + (b.totalPrice || 0), 0),
    [rows]
  );

  function onContinue() {
    const parsed = loadSession();
    if (!parsed) return;
    saveSession({
      ...parsed,
      storeName,
      purchaseDate,
      items: rows,
    });
    router.push("/review/summary");
  }

  if (!loaded) {
    return (
      <Screen nav={false}>
        <TopBar showBack title="Review" />
        <div className="px-6 mt-4 space-y-3">
          <div className="skeleton h-[80px] rounded-[var(--radius-xl)]" />
          <div className="skeleton h-[80px] rounded-[var(--radius-xl)]" />
          <div className="skeleton h-[80px] rounded-[var(--radius-xl)]" />
        </div>
      </Screen>
    );
  }

  return (
    <Screen nav={false}>
      <TopBar showBack title="Checklist" />

      <div className="px-6 space-y-3">
        <div className="rounded-[var(--radius-lg)] bg-white border border-[var(--ink-15)] p-4">
          <p className="text-caption text-[var(--ink-30)] mb-2">Store</p>
          <Input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="!h-10"
          />
        </div>

        <div className="rounded-[var(--radius-lg)] bg-white border border-[var(--ink-15)] p-4">
          <p className="text-caption text-[var(--ink-30)] mb-2">Purchase date</p>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="border border-[var(--ink-15)] rounded-[var(--radius-md)] bg-white h-10 px-3 text-[14px] font-medium"
          />
        </div>
      </div>

      <div className="px-6 mt-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-h1">Items</h2>
          <span className="text-meta text-[var(--ink-30)]">
            {includedCount} of {rows.length}
          </span>
        </div>

        <div className="flex flex-col gap-3 stagger">
          {rows.map((row) => (
            <ChecklistRow
              key={row.key}
              row={row}
              expanded={expanded === row.key}
              onToggleExpand={() =>
                setExpanded(expanded === row.key ? null : row.key)
              }
              onChange={(patch) => updateRow(row.key, patch)}
            />
          ))}
        </div>
      </div>

      <div className="h-[140px]" />

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-[var(--cream)]/95 backdrop-blur-md border-t border-[var(--ink-15)] safe-area-bottom z-20">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-caption text-[var(--ink-30)]">Subtotal</p>
            <p className="text-h1">{formatUsd(total)}</p>
          </div>
          <Button size="lg" onClick={onContinue} disabled={includedCount === 0}>
            Review
          </Button>
        </div>
      </footer>
    </Screen>
  );
}

function ChecklistRow({
  row,
  expanded,
  onToggleExpand,
  onChange,
}: {
  row: ChecklistItem;
  expanded: boolean;
  onToggleExpand: () => void;
  onChange: (patch: Partial<ChecklistItem>) => void;
}) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] bg-white border border-[var(--ink-15)] shadow-[var(--shadow-sm)] transition-opacity duration-200 ${
        row.include ? "" : "opacity-40"
      } animate-fade-in-up opacity-0`}
    >
      <div className="p-4 flex items-center gap-3">
        <Toggle
          checked={row.include}
          onChange={(v) => onChange({ include: v })}
          ariaLabel="Include"
        />
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-h3 truncate">{row.suggestedName}</p>
            {row.organic && (
              <span className="shrink-0 text-[10px] font-semibold px-2 py-[2px] rounded-full bg-[var(--sage-light)] text-[var(--sage)]">
                ORG
              </span>
            )}
            {row.frozen && (
              <span className="shrink-0 text-[10px] font-semibold px-2 py-[2px] rounded-full bg-blue-50 text-blue-600">
                FRZ
              </span>
            )}
            {row.canned && (
              <span className="shrink-0 text-[10px] font-semibold px-2 py-[2px] rounded-full bg-[var(--amber-light)] text-[var(--amber)]">
                CAN
              </span>
            )}
            {row.bulk && (
              <span className="shrink-0 text-[10px] font-semibold px-2 py-[2px] rounded-full bg-[var(--ink-04)] text-[var(--ink-50)]">
                BULK
              </span>
            )}
          </div>
          <p className="text-meta text-[var(--ink-50)] truncate mt-0.5">
            {row.packageSizeRaw ?? "—"} · {row.suggestedCategory}
          </p>
        </button>
        <div className="text-right shrink-0">
          <p className="text-h3">{formatUsd(row.totalPrice)}</p>
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label="Edit details"
            className="mt-0.5 inline-flex items-center gap-1 text-meta text-[var(--terracotta)]"
          >
            edit <ChevronDownIcon size={14} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--ink-15)] p-4 space-y-4 animate-fade-in">
          <FieldLabel>Item name</FieldLabel>
          <Input
            value={row.suggestedName}
            onChange={(e) => onChange({ suggestedName: e.target.value })}
          />

          <FieldLabel>Category</FieldLabel>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                size="sm"
                active={row.suggestedCategory === c}
                onClick={() => onChange({ suggestedCategory: c as Category })}
              >
                {c}
              </Chip>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="flex items-center justify-between">
              <FieldLabel>Organic</FieldLabel>
              <Toggle
                checked={row.organic}
                onChange={(v) => onChange({ organic: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <FieldLabel>Frozen</FieldLabel>
              <Toggle
                checked={row.frozen}
                onChange={(v) => onChange({ frozen: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <FieldLabel>Canned</FieldLabel>
              <Toggle
                checked={row.canned}
                onChange={(v) => onChange({ canned: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <FieldLabel>Bulk</FieldLabel>
              <Toggle
                checked={row.bulk}
                onChange={(v) => onChange({ bulk: v })}
              />
            </div>
          </div>

          <FieldLabel>Brand (optional)</FieldLabel>
          <Input
            value={row.brand ?? ""}
            placeholder="e.g. 365 Whole Foods"
            onChange={(e) => onChange({ brand: e.target.value || null })}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Package size</FieldLabel>
              <Input
                type="number"
                step="0.01"
                value={row.packageSize ?? ""}
                onChange={(e) =>
                  onChange({
                    packageSize: e.target.value
                      ? parseFloat(e.target.value)
                      : null,
                    packageSizeRaw: `${e.target.value}${row.packageSizeUnit ?? ""}`,
                  })
                }
              />
            </div>
            <div>
              <FieldLabel>Unit</FieldLabel>
              <UnitSelector
                value={row.packageSizeUnit ?? "oz"}
                onChange={(u) =>
                  onChange({
                    packageSizeUnit: u,
                    packageSizeRaw: `${row.packageSize ?? ""}${u}`,
                  })
                }
              />
            </div>
          </div>

          <FieldLabel>Total paid</FieldLabel>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-medium text-[var(--ink-50)]">$</span>
            <Input
              type="number"
              step="0.01"
              value={row.totalPrice}
              className="!pl-8"
              onChange={(e) =>
                onChange({ totalPrice: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-caption text-[var(--ink-30)] mb-1.5">{children}</p>;
}

function UnitSelector({ value, onChange }: { value: Unit; onChange: (u: Unit) => void }) {
  const all: Unit[] = [...WEIGHT_UNITS, ...VOLUME_UNITS, ...PACKAGE_UNITS];
  return (
    <div className="flex flex-wrap gap-1.5">
      {all.map((u) => (
        <Chip key={u} size="sm" active={value === u} onClick={() => onChange(u)}>
          {u}
        </Chip>
      ))}
    </div>
  );
}
