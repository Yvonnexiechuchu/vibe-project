"use client";

import {
  CartesianGrid,
  Dot,
  DotProps,
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
      <div className="h-[200px] ink-border rounded-[14px] bg-[var(--ink-100)] flex items-center justify-center">
        <p className="text-meta text-[var(--ink-800)]">Not enough data yet.</p>
      </div>
    );
  }

  return (
    <div className="h-[220px] ink-border rounded-[14px] bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke="#EEEFF4" strokeDasharray="2 4" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#474A57", fontSize: 11, fontWeight: 700 }}
            tickFormatter={(d: string) => d.slice(5)}
            stroke="#18191F"
            strokeWidth={2}
          />
          <YAxis
            tick={{ fill: "#474A57", fontSize: 11, fontWeight: 700 }}
            stroke="#18191F"
            strokeWidth={2}
            tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            width={46}
          />
          <Tooltip
            contentStyle={{
              background: "white",
              border: "2px solid #18191F",
              borderRadius: 12,
              fontWeight: 700,
              boxShadow: "0 2px 0 #18191F",
            }}
            labelStyle={{ color: "#18191F", fontWeight: 800 }}
            formatter={(v, _n, p) => {
              const storeName = (p.payload as Point).storeName;
              const num = typeof v === "number" ? v : Number(v);
              return [`$${num.toFixed(3)}/${unit}`, storeName];
            }}
          />
          <Line
            type="monotone"
            dataKey="unitPrice"
            stroke="#18191F"
            strokeWidth={2.5}
            dot={<InkDot />}
            activeDot={{ r: 6, stroke: "#18191F", strokeWidth: 2, fill: "#FFBD12" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function InkDot(props: DotProps) {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="white"
      stroke="#18191F"
      strokeWidth={2}
    />
  );
}
