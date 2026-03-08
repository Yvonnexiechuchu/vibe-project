"use client";

import type { DateRange } from "@/lib/types";

interface DateRangeSelectorProps {
  minDate: string;
  maxDate: string;
  activeRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

type PresetKey = "1M" | "3M" | "6M" | "1Y" | "ALL";

const PRESETS: { key: PresetKey; label: string; months: number | null }[] = [
  { key: "1M", label: "1M", months: 1 },
  { key: "3M", label: "3M", months: 3 },
  { key: "6M", label: "6M", months: 6 },
  { key: "1Y", label: "1Y", months: 12 },
  { key: "ALL", label: "All", months: null },
];

function subtractMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DateRangeSelector({
  minDate,
  maxDate,
  activeRange,
  onRangeChange,
}: DateRangeSelectorProps) {
  function getActivePreset(): PresetKey | null {
    if (activeRange.start === minDate && activeRange.end === maxDate) return "ALL";
    for (const p of PRESETS) {
      if (p.months === null) continue;
      const computed = subtractMonths(maxDate, p.months);
      const clamped = computed < minDate ? minDate : computed;
      if (activeRange.start === clamped && activeRange.end === maxDate) return p.key;
    }
    return null;
  }

  function handlePreset(preset: (typeof PRESETS)[number]) {
    if (preset.months === null) {
      onRangeChange({ start: minDate, end: maxDate });
    } else {
      const computed = subtractMonths(maxDate, preset.months);
      const clamped = computed < minDate ? minDate : computed;
      onRangeChange({ start: clamped, end: maxDate });
    }
  }

  const activePreset = getActivePreset();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePreset(p)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              activePreset === p.key
                ? "bg-[#7B92AD] text-white shadow-sm"
                : "bg-white text-[#7B92AD] border border-[#C4B69C]/50 hover:bg-[#F2E8D5]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <span className="text-sm text-[#C4B69C]">
        {formatDate(activeRange.start)} — {formatDate(activeRange.end)}
      </span>
    </div>
  );
}
