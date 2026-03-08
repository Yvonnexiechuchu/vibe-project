import { OutlierData } from "@/lib/types";
import DashboardCard from "./DashboardCard";

function fmt(n: number): string {
  return `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function OutlierList({ data }: { data: OutlierData[] }) {
  if (data.length === 0) return null;

  return (
    <DashboardCard title="Outlier Transactions" subtitle={`${data.length} flagged (>3x category median)`}>
      <div className="overflow-auto max-h-64">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-sand/30">
              <th className="text-left py-2 text-slate-blue font-medium">Date</th>
              <th className="text-left py-2 text-slate-blue font-medium">Merchant</th>
              <th className="text-right py-2 text-slate-blue font-medium">Amount</th>
              <th className="text-left py-2 text-slate-blue font-medium">Category</th>
            </tr>
          </thead>
          <tbody>
            {data.map((o, i) => (
              <tr key={i} className="border-b border-sand/10">
                <td className="py-2 text-xs text-sand">{o["Transaction Date"]}</td>
                <td className="py-2 font-medium">{o.merchant_normalized}</td>
                <td className="py-2 text-right font-mono text-amber-600 font-medium">{fmt(o["Transaction Amount"])}</td>
                <td className="py-2 text-xs text-slate-blue">{o["Report Category"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
