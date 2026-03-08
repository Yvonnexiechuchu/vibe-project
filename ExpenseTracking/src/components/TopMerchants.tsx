"use client";

import { MerchantData } from "@/lib/types";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardCard from "./DashboardCard";

const COLORS = ["#5A7394", "#7B92AD", "#A8C4D8", "#C4B69C", "#8FADE0", "#D4C5A9", "#6B8CAD", "#B8D4E8", "#9CA886", "#E0D5C0"];

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function TopMerchants({ data }: { data: MerchantData[] }) {
  const grandTotal = data.reduce((s, m) => s + m.Total, 0);
  const top = data.sort((a, b) => b.Total - a.Total).slice(0, 10).map((m) => ({
    name: m.Merchant,
    total: m.Total,
    count: m.Count,
    pct: grandTotal > 0 ? (m.Total / grandTotal) * 100 : 0,
  }));

  return (
    <DashboardCard title="Top Merchants" subtitle="By total spend (excl. housing)">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={top} layout="vertical" margin={{ left: 10, right: 50 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: "#5A6B7F" }} tickFormatter={(v) => fmt(v)} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#5A6B7F" }} width={140} />
            <Tooltip
              formatter={(value, _name, entry) => {
                const pct = (entry.payload as { pct: number }).pct;
                return [`${fmt(Number(value))} (${pct.toFixed(1)}%)`, "Spending"];
              }}
              contentStyle={{ background: "#fff", border: "1px solid #C4B69C", borderRadius: 12 }}
            />
            <Bar dataKey="total" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 10, fill: "#5A6B7F", formatter: (v: unknown) => `${grandTotal > 0 ? ((Number(v) / grandTotal) * 100).toFixed(0) : 0}%` }}>
              {top.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
