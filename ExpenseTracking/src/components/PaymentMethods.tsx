"use client";

import { PaymentMethodData } from "@/lib/types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import DashboardCard from "./DashboardCard";

const COLORS = ["#7B92AD", "#A8C4D8", "#C4B69C", "#5A7394", "#8FADE0", "#D4C5A9"];

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function PaymentMethods({ data }: { data: PaymentMethodData[] }) {
  const chartData = data.map((d) => ({
    name: d["Payment Method"],
    value: d.Total,
  }));

  return (
    <DashboardCard title="Payment Methods" subtitle="Spend by card/account">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              paddingAngle={2}
              label={({ name, percent }) => { const n = String(name ?? ""); return `${n.slice(0, 12)}${n.length > 12 ? "…" : ""} ${((percent ?? 0) * 100).toFixed(0)}%`; }}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [fmt(Number(value))]}
              contentStyle={{ background: "#fff", border: "1px solid #C4B69C", borderRadius: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
