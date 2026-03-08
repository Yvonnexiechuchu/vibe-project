"use client";

import { Categories } from "@/lib/types";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardCard from "./DashboardCard";

const COLORS = ["#7B92AD", "#A8C4D8", "#C4B69C", "#5A7394", "#8FADE0", "#D4C5A9", "#6B8CAD", "#B8D4E8", "#9CA886", "#E0D5C0"];

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function CategoryBreakdown({ data }: { data: Categories }) {
  const donutTotal = data.by_category.reduce((s, c) => s + c.Total, 0);
  const donutData = data.by_category.map((c) => ({
    name: c.Category || "",
    value: c.Total,
  }));

  const barTotal = data.by_report_category.reduce((s, c) => s + c.Total, 0);
  const barData = data.by_report_category
    .sort((a, b) => b.Total - a.Total)
    .slice(0, 12)
    .map((c) => ({
      name: c["Report Category"] || "",
      total: c.Total,
    }));

  return (
    <DashboardCard title="Top Expense Categories" subtitle="By category and subcategory (excl. housing)">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Donut chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                label={({ name, percent }) => `${String(name).slice(0, 10)} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {donutData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => {
                  const v = Number(value);
                  const pct = donutTotal > 0 ? ((v / donutTotal) * 100).toFixed(1) : "0";
                  return [`${fmt(v)} (${pct}%)`];
                }}
                contentStyle={{ background: "#fff", border: "1px solid #C4B69C", borderRadius: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Horizontal bar chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 40 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "#5A6B7F" }} tickFormatter={(v) => fmt(v)} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#5A6B7F" }}
                width={130}
              />
              <Tooltip
                formatter={(value) => {
                  const v = Number(value);
                  const pct = barTotal > 0 ? ((v / barTotal) * 100).toFixed(1) : "0";
                  return [`${fmt(v)} (${pct}%)`, "Spending"];
                }}
                contentStyle={{ background: "#fff", border: "1px solid #C4B69C", borderRadius: 12 }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} label={{ position: "right", fontSize: 10, fill: "#5A6B7F", formatter: (v: unknown) => `${barTotal > 0 ? ((Number(v) / barTotal) * 100).toFixed(0) : 0}%` }}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardCard>
  );
}
