import { Summary } from "@/lib/types";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Math.abs(n));
}

interface KPICardProps {
  label: string;
  value: string;
  sublabel?: string;
  color?: string;
}

function KPICard({ label, value, sublabel, color = "text-dark-blue" }: KPICardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand/30 flex flex-col gap-1">
      <span className="text-sm text-slate-blue font-medium">{label}</span>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      {sublabel && <span className="text-xs text-sand">{sublabel}</span>}
    </div>
  );
}

export default function KPIRow({ data }: { data: Summary }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <KPICard label="Total Income" value={fmt(data.total_income)} color="text-emerald-600" />
      <KPICard label="Total Expenses" value={fmt(data.total_expenses)} color="text-rose-500" />
      <KPICard label="Net" value={fmt(data.net)} color={data.net >= 0 ? "text-emerald-600" : "text-rose-500"} />
      <KPICard
        label="Adjusted Net"
        value={fmt(data.adjusted_net)}
        sublabel="After splits & refunds"
        color={data.adjusted_net >= 0 ? "text-emerald-600" : "text-rose-500"}
      />
      <KPICard label="Transactions" value={data.transaction_count.toString()} />
      <KPICard label="Date Range" value={`${data.date_range_start.slice(5)} — ${data.date_range_end.slice(5)}`} sublabel={data.data_source === "google_sheets" ? "Live data" : "Local CSV"} />
    </div>
  );
}
