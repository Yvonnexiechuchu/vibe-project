"use client";

import { useMemo } from "react";
import { Categories, Transaction } from "@/lib/types";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardCard from "./DashboardCard";

const COLORS = ["#7B92AD", "#A8C4D8", "#C4B69C", "#5A7394", "#8FADE0", "#D4C5A9", "#6B8CAD", "#B8D4E8", "#9CA886", "#E0D5C0"];

const HOUSING = new Set(["Housing: Mortgage/Rent", "Housing: Utilities", "Mortgage", "HOA"]);

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

interface Props {
  data: Categories;
  transactions: Transaction[];
}

export default function CategoryBreakdown({ data, transactions }: Props) {
  const barTotal = data.by_report_category.reduce((s, c) => s + c.Total, 0);
  const barData = [...data.by_report_category]
    .sort((a, b) => b.Total - a.Total)
    .map((c) => ({
      name: c["Report Category"] || "",
      total: c.Total,
    }));

  // Build top-3 merchants per report category from transactions
  const catSubs = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    transactions.forEach((t) => {
      if (t["Transaction Amount"] >= 0) return;
      if (HOUSING.has(t.Category) || HOUSING.has(t["Report Category"])) return;
      const cat = t["Report Category"];
      const merchant = t.merchant_normalized;
      const amt = Math.abs(t["Transaction Amount"]);
      if (!map[cat]) map[cat] = {};
      map[cat][merchant] = (map[cat][merchant] || 0) + amt;
    });
    const result: Record<string, { name: string; total: number }[]> = {};
    for (const [cat, subs] of Object.entries(map)) {
      result[cat] = Object.entries(subs)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 3);
    }
    return result;
  }, [transactions]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null;
    const { name, total } = payload[0].payload;
    const pct = barTotal > 0 ? ((total / barTotal) * 100).toFixed(1) : "0";
    const subs = catSubs[name] || [];
    return (
      <div className="bg-white border border-[#C4B69C] rounded-xl p-3 shadow-lg text-xs max-w-[240px]">
        <div className="font-semibold text-[#2C3E50] mb-1">{name}</div>
        <div className="text-[#5A7394] mb-2">{fmt(total)} ({pct}% of total)</div>
        {subs.length > 0 && (
          <>
            <div className="text-[#C4B69C] text-[10px] uppercase tracking-wide mb-1">Top merchants</div>
            {subs.map((s) => (
              <div key={s.name} className="flex justify-between gap-2 text-[#5A6B7F] leading-5">
                <span className="truncate">{s.name}</span>
                <span className="whitespace-nowrap font-medium">
                  {fmt(s.total)} ({total > 0 ? ((s.total / total) * 100).toFixed(0) : 0}%)
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  const chartHeight = Math.max(300, barData.length * 32);

  return (
    <DashboardCard title="Top Expense Categories" subtitle="By report category (excl. housing)">
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 40 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: "#5A6B7F" }} tickFormatter={(v) => fmt(v)} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#5A6B7F" }}
              width={150}
              interval={0}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, fill: "#5A6B7F", formatter: (v: unknown) => `${barTotal > 0 ? ((Number(v) / barTotal) * 100).toFixed(0) : 0}%` }}>
              {barData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
