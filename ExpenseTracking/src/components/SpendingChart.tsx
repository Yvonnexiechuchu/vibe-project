"use client";

import { TrendData } from "@/lib/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardCard from "./DashboardCard";

function formatPeriod(p: string): string {
  const d = new Date(p);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function fmt(n: number): string {
  return `$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function SpendingChart({ data }: { data: TrendData[] }) {
  const chartData = data.map((d) => ({
    name: formatPeriod(d.Period),
    total: d.Total,
    change: d["Change (%)"],
  }));

  return (
    <DashboardCard title="Spending" subtitle="Monthly spending trends">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7B92AD" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7B92AD" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#C4B69C40" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5A6B7F" }} />
            <YAxis tick={{ fontSize: 12, fill: "#5A6B7F" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(value) => [fmt(Number(value)), "Spending"]}
              contentStyle={{ background: "#fff", border: "1px solid #C4B69C", borderRadius: 12 }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#7B92AD"
              strokeWidth={2.5}
              fill="url(#spendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Change annotations */}
      <div className="flex gap-3 mt-3 flex-wrap">
        {chartData.map((d, i) =>
          d.change != null && !isNaN(d.change) ? (
            <span
              key={i}
              className={`text-xs px-2 py-1 rounded-full ${
                d.change > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {d.name}: {d.change > 0 ? "+" : ""}{d.change.toFixed(0)}%
            </span>
          ) : null
        )}
      </div>
    </DashboardCard>
  );
}
