"use client";

import { useState, useMemo, useCallback } from "react";
import type { DateRange } from "@/lib/types";

interface DateRangeSelectorProps {
  minDate: string;
  maxDate: string;
  activeRange: DateRange;
  onRangeChange: (range: DateRange, selectedMonthCount: number) => void;
}

const MO = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const ym = (d: string) => d.slice(0, 7);
const moStart = (m: string) => m + "-01";
const moEnd = (m: string) => {
  const [y, mo] = m.split("-").map(Number);
  return `${m}-${String(new Date(y, mo, 0).getDate()).padStart(2, "0")}`;
};
const moLabel = (m: string) => `${MO[+m.slice(5) - 1]} '${m.slice(2, 4)}`;

function enumMonths(min: string, max: string) {
  const r: string[] = [];
  let [y, m] = min.split("-").map(Number);
  const [ey, em] = max.split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    r.push(`${y}-${String(m).padStart(2, "0")}`);
    if (++m > 12) { m = 1; y++; }
  }
  return r;
}

function weeksOf(m: string) {
  const last = new Date(+m.slice(0, 4), +m.slice(5), 0).getDate();
  return [1, 8, 15, 22].map((s, i) => ({
    s: `${m}-${String(s).padStart(2, "0")}`,
    e: `${m}-${String(i < 3 ? s + 6 : last).padStart(2, "0")}`,
    l: `W${i + 1}`,
  }));
}

export default function DateRangeSelector({
  minDate,
  maxDate,
  activeRange,
  onRangeChange,
}: DateRangeSelectorProps) {
  const months = useMemo(() => enumMonths(ym(minDate), ym(maxDate)), [minDate, maxDate]);

  // Last 3 complete months (excluding current partial month) for weekly view
  const recent3 = useMemo(() => {
    const maxM = ym(maxDate);
    const complete = maxDate < moEnd(maxM) ? months.filter(m => m < maxM) : months;
    return new Set(complete.slice(-3));
  }, [months, maxDate]);

  const [mode, setMode] = useState<"month" | "week">("month");
  const [selMonths, setSelMonths] = useState<Set<string>>(() => new Set(months));
  const [selWeeks, setSelWeeks] = useState<Set<string>>(new Set()); // set of week start keys

  const isAll = selMonths.size === months.length && mode === "month";

  const clamp = useCallback(
    (s: string, e: string): DateRange => ({
      start: s < minDate ? minDate : s,
      end: e > maxDate ? maxDate : e,
    }),
    [minDate, maxDate]
  );

  // Weekly view: recent 3 complete months
  const weekMonths = useMemo(() => months.filter(m => recent3.has(m)), [months, recent3]);
  const showWeekly = weekMonths.length > 0;
  const allWeeks = useMemo(() => weekMonths.flatMap(m => weeksOf(m)), [weekMonths]);

  function selectAll() {
    setMode("month");
    setSelWeeks(new Set());
    setSelMonths(new Set(months));
    onRangeChange(clamp(moStart(months[0]), moEnd(months[months.length - 1])), months.length);
  }

  function toggleMonth(m: string) {
    setMode("month");
    setSelWeeks(new Set());
    const next = new Set(selMonths);
    if (next.has(m) && next.size > 1) next.delete(m);
    else next.add(m);
    // Fill gaps between min and max selected
    const sorted = months.filter(mo => next.has(mo));
    const filled = new Set(months.filter(mo => mo >= sorted[0] && mo <= sorted[sorted.length - 1]));
    setSelMonths(filled);
    const arr = months.filter(mo => filled.has(mo));
    onRangeChange(clamp(moStart(arr[0]), moEnd(arr[arr.length - 1])), arr.length);
  }

  function toggleWeek(w: { s: string; e: string }) {
    setMode("week");
    const next = new Set(selWeeks);
    if (next.has(w.s) && next.size > 1) next.delete(w.s);
    else next.add(w.s);
    // Fill gaps between min and max selected week
    const sorted = allWeeks.filter(wk => next.has(wk.s));
    const minS = sorted[0].s;
    const maxS = sorted[sorted.length - 1].s;
    const filled = new Set(allWeeks.filter(wk => wk.s >= minS && wk.s <= maxS).map(wk => wk.s));
    setSelWeeks(filled);
    const selected = allWeeks.filter(wk => filled.has(wk.s));
    onRangeChange(clamp(selected[0].s, selected[selected.length - 1].e), 0);
  }

  const fmt = (s: string) =>
    new Date(s + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const B = "rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer";
  const on = "bg-[#7B92AD] text-white shadow-sm";
  const off = "bg-white text-[#7B92AD] border border-[#C4B69C]/50 hover:bg-[#F2E8D5]";

  return (
    <div className="flex flex-col gap-2 items-end">
      {/* Month pills (reverse chronological) */}
      <div className="flex flex-wrap gap-1.5 justify-end">
        <button onClick={selectAll} className={`${B} ${isAll ? on : off}`}>
          All
        </button>
        {[...months].reverse().map((m) => (
          <button
            key={m}
            onClick={() => toggleMonth(m)}
            className={`${B} ${selMonths.has(m) && mode === "month" ? on : off}`}
          >
            {moLabel(m)}
          </button>
        ))}
      </div>

      {/* Weekly pills for recent 3 complete months */}
      {showWeekly && (
        <div className="flex flex-wrap gap-1.5 items-center justify-end">
          <span className="text-xs text-[#C4B69C] mr-1">Weekly:</span>
          {weekMonths.map((m) =>
            weeksOf(m).map((w) => (
              <button
                key={w.s}
                onClick={() => toggleWeek(w)}
                className={`${B} ${mode === "week" && selWeeks.has(w.s) ? on : off}`}
              >
                {MO[+m.slice(5) - 1]} {w.l}
              </button>
            ))
          )}
        </div>
      )}

      {/* Active range display */}
      <span className="text-sm text-[#C4B69C]">
        {fmt(activeRange.start)} — {fmt(activeRange.end)}
      </span>
    </div>
  );
}
