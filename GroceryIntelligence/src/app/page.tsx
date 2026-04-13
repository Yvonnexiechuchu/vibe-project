"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import {
  AlertIcon,
  CameraIcon,
  LeafIcon,
  MessageIcon,
  SparkleIcon,
  StoreIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "@/components/Icon";
import { fetchSnapshot, type DataSnapshot } from "@/lib/client-api";
import { generateInsights, type Insight } from "@/lib/insights";
import { formatUsd } from "@/lib/units";

export default function HomePage() {
  const [data, setData] = useState<DataSnapshot | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetchSnapshot()
      .then(setData)
      .catch((e) => setErr(e.message ?? "Failed to load"));
  }, []);

  const insights: Insight[] = data ? generateInsights(data) : [];
  const totalSpend = data?.prices.reduce((a, b) => a + b.totalPrice, 0) ?? 0;
  const itemCount = data?.items.length ?? 0;
  const storeCount = data?.stores.length ?? 0;

  return (
    <Screen>
      <div className="px-6 pt-10 pb-6 safe-area-top">
        <p className="text-caption text-[var(--ink-300)] mb-2">Grocery Intelligence</p>
        <h1 className="text-display">
          Hi there<span className="text-[var(--accent-red)]">.</span>
        </h1>
        <p className="text-body text-[var(--ink-800)] mt-2">
          Smart price tracking for real food.
        </p>
      </div>

      <div className="px-6">
        <Link href="/upload" className="block">
          <Card color="yellow" className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[14px] ink-border bg-white flex items-center justify-center">
              <CameraIcon />
            </div>
            <div className="flex-1">
              <p className="text-h3">Scan a receipt</p>
              <p className="text-meta text-[var(--ink-800)]">
                Snap or upload. I&apos;ll do the rest.
              </p>
            </div>
            <div className="text-2xl">→</div>
          </Card>
        </Link>
      </div>

      {err && (
        <div className="px-6 mt-4">
          <Card color="red" padded>
            <div className="flex items-start gap-3">
              <AlertIcon className="shrink-0 mt-0.5" />
              <div>
                <p className="text-h3">Can&apos;t reach your data</p>
                <p className="text-meta mt-1">{err}</p>
                <p className="text-meta mt-2 opacity-90">
                  Check .env.local: ANTHROPIC_API_KEY, GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* KPI row */}
      <section className="px-6 mt-6 grid grid-cols-3 gap-3">
        <KpiTile label="Spend" value={formatUsd(totalSpend)} />
        <KpiTile label="Items" value={String(itemCount)} />
        <KpiTile label="Stores" value={String(storeCount)} />
      </section>

      {/* Insights */}
      <section className="px-6 mt-8">
        <SectionHeader
          icon={<SparkleIcon />}
          title="For you"
          right={<span className="text-meta text-[var(--ink-300)]">{insights.length}</span>}
        />
        <div className="mt-4 flex flex-col gap-3">
          {data === null && !err && <SkeletonInsights />}
          {insights.map((ins, i) => (
            <InsightCard key={i} insight={ins} />
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="px-6 mt-8">
        <SectionHeader title="Jump to" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <ActionTile
            href="/chat"
            color="blue"
            title="Ask anything"
            subtitle="Where&apos;s the best price?"
            Icon={MessageIcon}
          />
          <ActionTile
            href="/items"
            color="green"
            title="Browse items"
            subtitle="Compare stores"
            Icon={StoreIcon}
          />
          <ActionTile
            href="/organic"
            color="white"
            title="Is organic worth it?"
            subtitle="Category research"
            Icon={LeafIcon}
          />
          <ActionTile
            href="/upload"
            color="white"
            title="New receipt"
            subtitle="Upload or photo"
            Icon={CameraIcon}
          />
        </div>
      </section>

      <div className="h-10" />
    </Screen>
  );
}

function KpiTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="ink-border ink-shadow rounded-[16px] bg-white p-4">
      <p className="text-caption text-[var(--ink-300)]">{label}</p>
      <p className="text-h2 mt-1 truncate">{value}</p>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  right,
}: {
  icon?: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-h2">{title}</h2>
      </div>
      {right}
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const color =
    insight.emphasis === "negative"
      ? "red"
      : insight.emphasis === "positive"
      ? "green"
      : "white";
  const Icon =
    insight.emphasis === "negative" ? TrendingUpIcon : TrendingDownIcon;
  return (
    <Card color={color as "red" | "green" | "white"}>
      <div className="flex items-start gap-3">
        {insight.kind === "welcome" ? (
          <div className="w-10 h-10 rounded-full ink-border bg-[var(--accent-yellow)] flex items-center justify-center shrink-0">
            <SparkleIcon size={20} />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full ink-border bg-white flex items-center justify-center shrink-0">
            <Icon size={20} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-h3">{insight.title}</p>
          <p className="text-meta mt-1 opacity-90">{insight.detail}</p>
        </div>
      </div>
    </Card>
  );
}

function SkeletonInsights() {
  return (
    <>
      <div className="skeleton h-[92px] ink-border rounded-[16px]" />
      <div className="skeleton h-[92px] ink-border rounded-[16px]" />
    </>
  );
}

function ActionTile({
  href,
  color,
  title,
  subtitle,
  Icon,
}: {
  href: string;
  color: "white" | "yellow" | "red" | "blue" | "green";
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string; size?: number }>;
}) {
  const bg: Record<string, string> = {
    white: "bg-white text-ink",
    yellow: "bg-[var(--accent-yellow)] text-ink",
    red: "bg-[var(--accent-red)] text-white",
    blue: "bg-[var(--accent-blue)] text-white",
    green: "bg-[var(--accent-green)] text-ink",
  };
  return (
    <Link href={href} className="block">
      <div
        className={`ink-border ink-shadow rounded-[16px] p-4 h-full ink-press ${bg[color]}`}
      >
        <Icon size={28} />
        <p className="text-h3 mt-4">{title}</p>
        <p className="text-meta mt-1 opacity-80">{subtitle}</p>
      </div>
    </Link>
  );
}
