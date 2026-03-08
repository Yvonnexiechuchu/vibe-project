"use client";

import { useState } from "react";
import { Transaction } from "@/lib/types";
import DashboardCard from "./DashboardCard";

function fmt(n: number): string {
  return `${n < 0 ? "-" : "+"}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function TransactionList({ data }: { data: Transaction[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? data : data.slice(0, 15);

  return (
    <DashboardCard title="Transactions" subtitle={`${data.length} total`}>
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sand/30">
              <th className="text-left py-2 text-slate-blue font-medium">Date</th>
              <th className="text-left py-2 text-slate-blue font-medium">Merchant</th>
              <th className="text-right py-2 text-slate-blue font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t, i) => (
              <tr key={i} className="border-b border-sand/10 hover:bg-cream/50 transition-colors">
                <td className="py-2 text-xs text-sand">{t["Transaction Date"]}</td>
                <td className="py-2">
                  <span className="font-medium">{t.merchant_normalized}</span>
                  {t.is_outlier && (
                    <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">outlier</span>
                  )}
                  {t.is_shared && (
                    <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">shared</span>
                  )}
                </td>
                <td className={`py-2 text-right font-mono font-medium ${t["Transaction Amount"] >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                  {fmt(t["Transaction Amount"])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 15 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-sm text-slate-blue hover:text-dark-blue transition-colors"
        >
          {showAll ? "Show less" : `Show all ${data.length} transactions`}
        </button>
      )}
    </DashboardCard>
  );
}
