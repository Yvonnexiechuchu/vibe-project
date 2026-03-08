interface DashboardCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export default function DashboardCard({ title, subtitle, children, className = "" }: DashboardCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-sand/30 ${className}`}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-dark-blue">{title}</h2>
        {subtitle && <p className="text-sm text-slate-blue mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
