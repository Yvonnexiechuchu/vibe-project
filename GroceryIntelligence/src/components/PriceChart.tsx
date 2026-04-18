"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = {
  date: string;
  unitPrice: number;
  storeName: string;
};

export function PriceChart({
  data,
  unit,
}: {
  data: Point[];
  unit: string;
}) {
  if (data.length === 0) {
    return (
      <div className="h-[200px] rounded-[var(--radius-lg)] bg-white border border-[var(--ink-15)] flex items-center justify-center">
        <p className="text-meta text-[var(--ink-30)]">Not enough data yet.</p>
      </div>
    );
  }

  return (
    <div className="h-[220px] rounded-[var(--radius-lg)] bg-white border border-[var(--ink-15)] shadow-[var(--shadow-sm)] p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="#EEEAE4" strokeDasharray="3 6" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#8A837B", fontSize: 11, fontWeight: 500 }}
            tickFormatter={(d: string) => d.slice(5)}
            stroke="#DDD8D2"
            strokeWidth={1}
          />
          <YAxis
            tick={{ fill: "#8A837B", fontSize: 11, fontWeight: 500 }}
            stroke="#DDD8D2"
            strokeWidth={1}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            width={46}
          />
          <Tooltip
            contentStyle={{
              background: "white",
              border: "1px solid #DDD8D2",
              borderRadius: 12,
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(26,26,26,0.06)",
              fontSize: 13,
            }}
            labelStyle={{ color: "#1A1A1A", fontWeight: 600 }}
            formatter={(v, _n, p) => {
              const storeName = (p.payload as Point).storeName;
              const num = typeof v === "number" ? v : Number(v);
              return [`$${num.toFixed(3)}/${unit}`, storeName];
            }}
          />
          <Line
            type="monotone"
            dataKey="unitPrice"
            stroke="#C84B31"
            strokeWidth={2}
            dot={{ r: 3.5, fill: "white", stroke: "#C84B31", strokeWidth: 2 }}
            activeDot={{ r: 5, stroke: "#C84B31", strokeWidth: 2, fill: "#FFF0EC" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
