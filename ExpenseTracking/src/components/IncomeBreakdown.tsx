"use client";

import { IncomeData } from "@/lib/types";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DashboardCard from "./DashboardCard";

const COLORS = ["#7B92AD", "#A8C4D8", "#5A7394", "#C4B69C", "#8FADE0", "#D4C5A9"];

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function IncomeBreakdown({ data }: { data: IncomeData[] }) {
  const grandTotal = data.reduce((s, d) => s + d.Total, 0);
  const chartData = data.slice(0, 10).map((d) => ({
    name: d.Source,
    total: d.Total,
    count: d.Count,
  }));

  return (
    <DashboardCard title="Income Sources" subtitle="All income & credits">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 40 }}>
            <XAxis type="number" tick={{ fontSize: 11, fill: "#5A6B7F" }} tickFormatter={(v) => fmt(v)} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#5A6B7F" }} width={140} />
            <Tooltip
              formatter={(value) => {
                const v = Number(value);
                const pct = grandTotal > 0 ? ((v / grandTotal) * 100).toFixed(1) : "0";
                return [`${fmt(v)} (${pct}%)`, "Income"];
              }}
              contentStyle={{ background: "#fff", border: "1px solid #C4B69C", borderRadius: 12 }}
            />
            <Bar dataKey="total" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 10, fill: "#5A6B7F", formatter: (v: unknown) => `${grandTotal > 0 ? ((Number(v) / grandTotal) * 100).toFixed(0) : 0}%` }}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
