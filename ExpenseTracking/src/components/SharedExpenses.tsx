import { SharedData } from "@/lib/types";
import DashboardCard from "./DashboardCard";

function fmt(n: number): string {
  return `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function SharedExpenses({ data }: { data: SharedData[] }) {
  if (data.length === 0) return null;

  return (
    <DashboardCard title="Shared Expenses" subtitle="Venmo/Zelle splits — your true cost">
      <div className="overflow-auto max-h-64">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sand/30">
              <th className="text-left py-2 text-slate-blue font-medium">Date</th>
              <th className="text-left py-2 text-slate-blue font-medium">Merchant</th>
              <th className="text-right py-2 text-slate-blue font-medium">Original</th>
              <th className="text-right py-2 text-slate-blue font-medium">Your Cost</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <tr key={i} className="border-b border-sand/10">
                <td className="py-2 text-xs text-sand">{s["Transaction Date"]}</td>
                <td className="py-2 font-medium">{s.merchant_normalized}</td>
                <td className="py-2 text-right font-mono text-sand line-through">{fmt(s["Transaction Amount"])}</td>
                <td className="py-2 text-right font-mono font-medium text-dark-blue">{fmt(s.personal_cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
