"use client";

import { useState } from "react";
import { CleaningSummary as CleaningSummaryType } from "@/lib/types";
import DashboardCard from "./DashboardCard";

export default function CleaningSummary({ data }: { data: CleaningSummaryType }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const sections = [
    { key: "merchant_normalizations", label: "Merchant normalizations", items: data.merchant_normalizations },
    { key: "category_corrections", label: "Category corrections", items: data.category_corrections },
    { key: "report_category_corrections", label: "Report category corrections", items: data.report_category_corrections },
    { key: "refund_pairs", label: "Refund pairs netted", items: data.refund_pairs },
    { key: "shared_expenses", label: "Shared expenses identified", items: data.shared_expenses },
    { key: "outlier_details", label: "Outliers flagged", items: data.outlier_details },
  ];

  return (
    <DashboardCard title="Data Cleaning Summary" subtitle={`${data.total_actions} actions taken`}>
      <div className="space-y-2">
        {sections.map((s) => (
          <div key={s.key}>
            <button
              onClick={() => setExpanded(expanded === s.key ? null : s.key)}
              className="w-full flex justify-between items-center py-2 px-3 rounded-lg hover:bg-cream/80 transition-colors text-sm"
            >
              <span className="font-medium">{s.label}</span>
              <span className="text-xs bg-light-blue/30 text-dark-blue px-2 py-0.5 rounded-full">
                {s.items.length}
              </span>
            </button>
            {expanded === s.key && (
              <div className="pl-4 pr-2 pb-2 space-y-1 max-h-40 overflow-auto">
                {s.items.map((item, i) => (
                  <p key={i} className="text-xs text-slate-blue font-mono">{item}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
