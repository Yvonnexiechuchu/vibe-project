"use client";

import { useState } from "react";
import { RecurringData } from "@/lib/types";
import DashboardCard from "./DashboardCard";

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function RecurringExpenses({ data }: { data: RecurringData[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? data : data.slice(0, 10);

  return (
    <DashboardCard title="Recurring Expenses" subtitle={`${data.length} merchants across 2+ months`}>
      <div className="overflow-auto max-h-80">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sand/30">
              <th className="text-left py-2 text-slate-blue font-medium">Merchant</th>
              <th className="text-right py-2 text-slate-blue font-medium">Monthly Avg</th>
              <th className="text-right py-2 text-slate-blue font-medium">Total</th>
              <th className="text-center py-2 text-slate-blue font-medium">Months</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr key={i} className="border-b border-sand/10 hover:bg-cream/50 transition-colors">
                <td className="py-2 font-medium">{r.Merchant}</td>
                <td className="py-2 text-right font-mono text-slate-blue">{fmt(r["Monthly Avg"])}</td>
                <td className="py-2 text-right font-mono">{fmt(r.Total)}</td>
                <td className="py-2 text-center">
                  <span className="bg-light-blue/30 text-dark-blue text-xs px-2 py-0.5 rounded-full">{r.Months}mo</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-slate-blue hover:text-dark-blue transition-colors"
        >
          {showAll ? "Show less" : `Show all ${data.length}`}
        </button>
      )}
    </DashboardCard>
  );
}
