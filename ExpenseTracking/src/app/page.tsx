import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type {
  Summary,
  Transaction,
  Categories,
  MerchantData,
  Trends,
  RecurringData,
  IncomeData,
  SharedData,
  PaymentMethodData,
  OutlierData,
  CleaningSummary as CleaningSummaryType,
} from "@/lib/types";

import DashboardClient from "@/components/DashboardClient";

function loadJson<T>(filename: string): T | null {
  const path = join(process.cwd(), "public", "data", filename);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const summary = loadJson<Summary>("summary.json");
  const transactions = loadJson<Transaction[]>("transactions.json") ?? [];
  const categories = loadJson<Categories>("categories.json");
  const merchants = loadJson<MerchantData[]>("merchants.json") ?? [];
  const trends = loadJson<Trends>("trends.json");
  const recurring = loadJson<RecurringData[]>("recurring.json") ?? [];
  const income = loadJson<IncomeData[]>("income.json") ?? [];
  const shared = loadJson<SharedData[]>("shared.json") ?? [];
  const paymentMethods = loadJson<PaymentMethodData[]>("payment_methods.json") ?? [];
  const outliers = loadJson<OutlierData[]>("outliers.json") ?? [];
  const cleaning = loadJson<CleaningSummaryType>("cleaning.json");

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-sand/30 max-w-md text-center">
          <h1 className="text-2xl font-bold text-dark-blue mb-4">No Data Found</h1>
          <p className="text-slate-blue mb-6">Run the data export script first:</p>
          <code className="block bg-cream rounded-xl p-4 text-sm font-mono text-dark-blue">
            python generate_data.py
          </code>
          <p className="text-sm text-sand mt-4">Then refresh this page.</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardClient
      summary={summary}
      transactions={transactions}
      categories={categories!}
      merchants={merchants}
      trends={trends!}
      recurring={recurring}
      income={income}
      shared={shared}
      paymentMethods={paymentMethods}
      outliers={outliers}
      cleaning={cleaning!}
    />
  );
}
