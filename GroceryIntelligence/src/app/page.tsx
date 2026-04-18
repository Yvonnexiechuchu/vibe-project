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
      {/* Hero */}
      <div className="px-6 pt-12 pb-8 safe-area-top">
        <p className="text-caption text-[var(--ink-50)] mb-3">Grocery Intelligence</p>
        <h1 className="text-display">
          Smart prices<span className="text-[var(--terracotta)]">,</span>
          <br />
          real food<span className="text-[var(--terracotta)]">.</span>
        </h1>
      </div>

      {/* Scan CTA */}
      <div className="px-6">
        <Link href="/upload" className="block group">
          <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--ink)] p-6 transition-transform duration-200 active:scale-[0.99]">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[var(--terracotta)] opacity-20" />
            <div className="absolute -right-4 -bottom-10 w-24 h-24 rounded-full bg-[var(--amber)] opacity-10" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-[14px] bg-white/10 backdrop-blur flex items-center justify-center">
                <CameraIcon className="text-white" />
              </div>
              <div className="flex-1 text-white">
                <p className="text-h3 text-white">Scan a receipt</p>
                <p className="text-meta text-white/60 mt-0.5">
                  Snap or upload. I&apos;ll do the rest.
                </p>
              </div>
              <span className="text-white/40 text-xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </Link>
      </div>

      {err && (
        <div className="px-6 mt-5">
          <Card color="cream" padded>
            <div className="flex items-start gap-3">
              <AlertIcon className="shrink-0 mt-0.5 text-[var(--terracotta)]" />
              <div>
                <p className="text-h3">Can&apos;t reach your data</p>
                <p className="text-meta text-[var(--ink-50)] mt-1">{err}</p>
                <p className="text-meta text-[var(--ink-50)] mt-2">
                  Check .env.local credentials.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* KPIs */}
      <section className="px-6 mt-8 grid grid-cols-3 gap-3">
        <KpiTile label="Spend" value={formatUsd(totalSpend)} />
        <KpiTile label="Items" value={String(itemCount)} />
        <KpiTile label="Stores" value={String(storeCount)} />
      </section>

      {/* Insights */}
      <section className="px-6 mt-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-h1">For you</h2>
          <span className="text-meta text-[var(--ink-30)]">{insights.length}</span>
        </div>
        <div className="flex flex-col gap-3 stagger">
          {data === null && !err && <SkeletonInsights />}
          {insights.map((ins, i) => (
            <InsightCard key={i} insight={ins} />
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="px-6 mt-10">
        <h2 className="text-h1 mb-5">Explore</h2>
        <div className="grid grid-cols-2 gap-3 stagger">
          <ActionTile
            href="/chat"
            title="Ask anything"
            subtitle="Where's the best price?"
            Icon={MessageIcon}
            accent="var(--terracotta)"
          />
          <ActionTile
            href="/items"
            title="Browse items"
            subtitle="Compare stores"
            Icon={StoreIcon}
            accent="var(--sage)"
          />
          <ActionTile
            href="/organic"
            title="Organic worth it?"
            subtitle="Evidence-based"
            Icon={LeafIcon}
            accent="var(--sage)"
          />
          <ActionTile
            href="/upload"
            title="New receipt"
            subtitle="Upload or snap"
            Icon={CameraIcon}
            accent="var(--amber)"
          />
        </div>
      </section>

      <div className="h-8" />
    </Screen>
  );
}

function KpiTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-white border border-[var(--ink-15)] p-4 shadow-[var(--shadow-sm)]">
      <p className="text-caption text-[var(--ink-30)]">{label}</p>
      <p className="text-h1 mt-1.5 truncate">{value}</p>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const isNeg = insight.emphasis === "negative";
  const isPos = insight.emphasis === "positive";
  const Icon =
    insight.kind === "welcome" ? SparkleIcon : isNeg ? TrendingUpIcon : TrendingDownIcon;
  const dotColor = isNeg
    ? "var(--terracotta)"
    : isPos
    ? "var(--sage)"
    : "var(--amber)";
  return (
    <Card color="white" hoverable className="animate-fade-in-up opacity-0">
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: dotColor + "18", color: dotColor }}
        >
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-h3 leading-snug">{insight.title}</p>
          <p className="text-meta text-[var(--ink-50)] mt-1.5">{insight.detail}</p>
        </div>
      </div>
    </Card>
  );
}

function SkeletonInsights() {
  return (
    <>
      <div className="skeleton h-[88px] rounded-[var(--radius-xl)]" />
      <div className="skeleton h-[88px] rounded-[var(--radius-xl)]" />
    </>
  );
}

function ActionTile({
  href,
  title,
  subtitle,
  Icon,
  accent,
}: {
  href: string;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<{ className?: string; size?: number }>;
  accent: string;
}) {
  return (
    <Link href={href} className="block animate-fade-in-up opacity-0">
      <Card color="white" hoverable className="h-full !p-5">
        <div
          className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4"
          style={{ backgroundColor: accent + "14", color: accent }}
        >
          <Icon size={20} />
        </div>
        <p className="text-h3">{title}</p>
        <p className="text-meta text-[var(--ink-50)] mt-1">{subtitle}</p>
      </Card>
    </Link>
  );
}
