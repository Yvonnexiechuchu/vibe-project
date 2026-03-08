"use client";

import { Transaction } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import DashboardCard from "./DashboardCard";

function fmt(n: number): string {
  return `$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export default function CashFlowTrends({ transactions }: { transactions: Transaction[] }) {
  // Group by month
  const monthly: Record<string, { income: number; expenses: number }> = {};
  transactions.forEach((t) => {
    const month = t["Transaction Date"].slice(0, 7);
    if (!monthly[month]) monthly[month] = { income: 0, expenses: 0 };
    if (t["Transaction Amount"] > 0) {
      monthly[month].income += t["Transaction Amount"];
    } else {
      monthly[month].expenses += Math.abs(t["Transaction Amount"]);
    }
  });

  const totalIncome = Object.values(monthly).reduce((s, v) => s + v.income, 0);
  const totalExpenses = Object.values(monthly).reduce((s, v) => s + v.expenses, 0);
  const chartData = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      name: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      income: Math.round(v.income),
      expenses: Math.round(v.expenses),
      net: Math.round(v.income - v.expenses),
      incomePct: totalIncome > 0 ? ((v.income / totalIncome) * 100) : 0,
      expensePct: totalExpenses > 0 ? ((v.expenses / totalExpenses) * 100) : 0,
    }));

  return (
    <DashboardCard title="Cash Flow Trends" subtitle="Income vs expenses by month">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#C4B69C40" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#5A6B7F" }} />
            <YAxis tick={{ fontSize: 12, fill: "#5A6B7F" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(value, name, entry) => {
                const v = Number(value);
                const p = entry.payload as { incomePct: number; expensePct: number };
                const pct = String(name) === "Income" ? p.incomePct : String(name) === "Expenses" ? p.expensePct : null;
                const label = pct !== null ? `${fmt(v)} (${pct.toFixed(0)}%)` : fmt(v);
                return [label, String(name)];
              }}
              contentStyle={{ background: "#fff", border: "1px solid #C4B69C", borderRadius: 12 }}
            />
            <Legend />
            <Bar dataKey="income" fill="#7B92AD" radius={[4, 4, 0, 0]} name="Income" />
            <Bar dataKey="expenses" fill="#C4B69C" radius={[4, 4, 0, 0]} name="Expenses" />
            <Line type="monotone" dataKey="net" stroke="#5A7394" strokeWidth={2} dot={{ r: 4 }} name="Net" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}
