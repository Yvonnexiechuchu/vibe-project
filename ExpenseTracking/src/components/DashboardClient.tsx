"use client";

import { useState, useMemo } from "react";
import type {
  DashboardProps,
  DateRange,
  Summary,
  Categories,
  MerchantData,
  Trends,
  RecurringData,
  IncomeData,
  PaymentMethodData,
} from "@/lib/types";

import DateRangeSelector from "@/components/DateRangeSelector";
import KPIRow from "@/components/KPIRow";
import SpendingChart from "@/components/SpendingChart";
import CashFlowTrends from "@/components/CashFlowTrends";
import CategoryBreakdown from "@/components/CategoryBreakdown";
import TransactionList from "@/components/TransactionList";
import TopMerchants from "@/components/TopMerchants";
import RecurringExpenses from "@/components/RecurringExpenses";
import IncomeBreakdown from "@/components/IncomeBreakdown";
import SharedExpenses from "@/components/SharedExpenses";
import PaymentMethods from "@/components/PaymentMethods";
import OutlierList from "@/components/OutlierList";
import CleaningSummary from "@/components/CleaningSummary";
import FloatingAIPanel from "@/components/FloatingAIPanel";

const HOUSING_CATEGORIES = new Set([
  "Housing: Mortgage/Rent",
  "Housing: Utilities",
  "Mortgage",
  "HOA",
]);

function isHousing(t: { Category?: string; "Report Category"?: string }) {
  return HOUSING_CATEGORIES.has(t.Category ?? "") || HOUSING_CATEGORIES.has(t["Report Category"] ?? "");
}

export default function DashboardClient(props: DashboardProps) {
  const { summary, transactions, trends, shared, outliers, cleaning } = props;

  const [dateRange, setDateRange] = useState<DateRange>({
    start: summary.date_range_start,
    end: summary.date_range_end,
  });

  const filtered = useMemo(() => {
    const txns = transactions.filter((t) => {
      const d = t["Transaction Date"];
      return d >= dateRange.start && d <= dateRange.end;
    });

    // Recompute summary KPIs
    const totalIncome = txns
      .filter((t) => t["Transaction Amount"] > 0)
      .reduce((s, t) => s + t["Transaction Amount"], 0);
    const totalExpenses = txns
      .filter((t) => t["Transaction Amount"] < 0)
      .reduce((s, t) => s + t["Transaction Amount"], 0);
    const adjustedExpenses = txns
      .filter((t) => t["Transaction Amount"] < 0)
      .reduce((s, t) => s + t.net_amount, 0);

    const filteredSummary: Summary = {
      ...summary,
      total_income: totalIncome,
      total_expenses: totalExpenses,
      net: totalIncome + totalExpenses,
      adjusted_expenses: adjustedExpenses,
      adjusted_net: totalIncome + adjustedExpenses,
      transaction_count: txns.length,
      date_range_start: dateRange.start,
      date_range_end: dateRange.end,
    };

    // Recompute categories (excluding housing/mortgage)
    const catMap: Record<string, { total: number; count: number }> = {};
    const rcatMap: Record<string, { total: number; count: number }> = {};
    txns.forEach((t) => {
      if (t["Transaction Amount"] >= 0 || isHousing(t)) return;
      const amt = Math.abs(t["Transaction Amount"]);
      const cat = t.Category;
      if (!catMap[cat]) catMap[cat] = { total: 0, count: 0 };
      catMap[cat].total += amt;
      catMap[cat].count++;
      const rcat = t["Report Category"];
      if (!rcatMap[rcat]) rcatMap[rcat] = { total: 0, count: 0 };
      rcatMap[rcat].total += amt;
      rcatMap[rcat].count++;
    });
    const filteredCategories: Categories = {
      by_category: Object.entries(catMap).map(([c, v]) => ({
        Category: c,
        Total: v.total,
        Count: v.count,
      })),
      by_report_category: Object.entries(rcatMap).map(([c, v]) => ({
        "Report Category": c,
        Total: v.total,
        Count: v.count,
      })),
    };

    // Recompute merchants (excluding housing/mortgage)
    const merchMap: Record<string, { total: number; count: number }> = {};
    txns.forEach((t) => {
      if (t["Transaction Amount"] >= 0 || isHousing(t)) return;
      const m = t.merchant_normalized;
      if (!merchMap[m]) merchMap[m] = { total: 0, count: 0 };
      merchMap[m].total += Math.abs(t["Transaction Amount"]);
      merchMap[m].count++;
    });
    const filteredMerchants: MerchantData[] = Object.entries(merchMap).map(
      ([m, v]) => ({ Merchant: m, Total: v.total, Count: v.count })
    );

    // Recompute income
    const incMap: Record<string, { total: number; count: number }> = {};
    txns.forEach((t) => {
      if (t["Transaction Amount"] <= 0) return;
      const src = t.merchant_normalized;
      if (!incMap[src]) incMap[src] = { total: 0, count: 0 };
      incMap[src].total += t["Transaction Amount"];
      incMap[src].count++;
    });
    const filteredIncome: IncomeData[] = Object.entries(incMap).map(
      ([s, v]) => ({ Source: s, Total: v.total, Count: v.count })
    );

    // Recompute payment methods
    const pmMap: Record<string, number> = {};
    txns.forEach((t) => {
      if (t["Transaction Amount"] >= 0) return;
      const pm = t.payment_normalized;
      pmMap[pm] = (pmMap[pm] || 0) + Math.abs(t["Transaction Amount"]);
    });
    const filteredPaymentMethods: PaymentMethodData[] = Object.entries(pmMap).map(
      ([pm, total]) => ({ "Payment Method": pm, Total: total })
    );

    // Recompute recurring (merchants in 2+ distinct months)
    const recMap: Record<string, { months: Set<string>; total: number; count: number }> = {};
    txns.forEach((t) => {
      if (t["Transaction Amount"] >= 0) return;
      const m = t.merchant_normalized;
      const month = t["Transaction Date"].slice(0, 7);
      if (!recMap[m]) recMap[m] = { months: new Set(), total: 0, count: 0 };
      recMap[m].months.add(month);
      recMap[m].total += Math.abs(t["Transaction Amount"]);
      recMap[m].count++;
    });
    const filteredRecurring: RecurringData[] = Object.entries(recMap)
      .filter(([, v]) => v.months.size >= 2)
      .map(([m, v]) => ({
        Merchant: m,
        Months: v.months.size,
        Total: v.total,
        Count: v.count,
        "Monthly Avg": v.total / v.months.size,
      }));

    // Filter trends by month
    const startMonth = dateRange.start.slice(0, 7);
    const endMonth = dateRange.end.slice(0, 7);
    const filteredTrends: Trends = {
      overall: trends.overall.filter((t) => {
        const p = t.Period.slice(0, 7);
        return p >= startMonth && p <= endMonth;
      }),
      by_category: trends.by_category.filter((t) => {
        const p = t.Period.slice(0, 7);
        return p >= startMonth && p <= endMonth;
      }),
    };

    // Filter shared and outliers by date
    const filteredShared = shared.filter((s) => {
      const d = s["Transaction Date"];
      return d >= dateRange.start && d <= dateRange.end;
    });
    const filteredOutliers = outliers.filter((o) => {
      const d = o["Transaction Date"];
      return d >= dateRange.start && d <= dateRange.end;
    });

    return {
      summary: filteredSummary,
      transactions: txns,
      categories: filteredCategories,
      merchants: filteredMerchants,
      trends: filteredTrends,
      recurring: filteredRecurring,
      income: filteredIncome,
      shared: filteredShared,
      paymentMethods: filteredPaymentMethods,
      outliers: filteredOutliers,
    };
  }, [dateRange, transactions, trends, shared, outliers, summary]);

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="text-3xl font-bold text-dark-blue">Expense Tracker</h1>
            <p className="text-slate-blue mt-1">{summary.persona}</p>
          </div>
          <DateRangeSelector
            minDate={summary.date_range_start}
            maxDate={summary.date_range_end}
            activeRange={dateRange}
            onRangeChange={setDateRange}
          />
        </div>
      </div>

      {/* KPI Row */}
      <div className="mb-6">
        <KPIRow data={filtered.summary} />
      </div>

      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SpendingChart data={filtered.trends.overall} />
        <CashFlowTrends transactions={filtered.transactions} />
      </div>

      {/* Categories */}
      <div className="mb-6">
        <CategoryBreakdown data={filtered.categories} />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TopMerchants data={filtered.merchants} />
        <IncomeBreakdown data={filtered.income} />
      </div>

      {/* Transactions + Recurring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TransactionList data={filtered.transactions} />
        <RecurringExpenses data={filtered.recurring} />
      </div>

      {/* Secondary sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <PaymentMethods data={filtered.paymentMethods} />
        <SharedExpenses data={filtered.shared} />
        <CleaningSummary data={cleaning} />
      </div>

      {/* Outliers */}
      <div className="mb-6">
        <OutlierList data={filtered.outliers} />
      </div>

      {/* Floating AI buttons */}
      <FloatingAIPanel />
    </div>
  );
}
