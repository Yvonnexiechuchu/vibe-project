import type { Item, PriceEntry, Store } from "./types";
import { formatUnitPrice, formatUsd } from "./units";

export type Insight = {
  kind: "inflation" | "best-price" | "stale" | "spending" | "welcome";
  title: string;
  detail: string;
  emphasis?: "positive" | "negative" | "neutral";
};

type Ctx = {
  items: Item[];
  stores: Store[];
  prices: PriceEntry[];
};

const MS_DAY = 86_400_000;

export function generateInsights(ctx: Ctx): Insight[] {
  const { items, prices } = ctx;
  if (prices.length === 0) {
    return [
      {
        kind: "welcome",
        title: "Start by uploading a receipt",
        detail:
          "I'll parse every line, auto-categorize it, and start tracking your unit prices across stores. Insights unlock once you have a few purchases.",
        emphasis: "neutral",
      },
    ];
  }

  const out: Insight[] = [];
  const byItem = groupBy(prices, (p) => p.itemId);

  // Inflation — items with ≥3 entries and ≥15% increase from first purchase.
  for (const [itemId, entries] of byItem) {
    if (entries.length < 3) continue;
    const item = items.find((i) => i.id === itemId);
    if (!item) continue;
    const sorted = [...entries].sort((a, b) =>
      a.purchaseDate.localeCompare(b.purchaseDate)
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!first.unitPrice || !last.unitPrice) continue;
    const pct = ((last.unitPrice - first.unitPrice) / first.unitPrice) * 100;
    if (pct >= 15) {
      out.push({
        kind: "inflation",
        title: `${item.canonicalName} is up ${pct.toFixed(0)}% since you started tracking`,
        detail: `${formatUnitPrice(first.unitPrice, item.lockedUnit)} → ${formatUnitPrice(
          last.unitPrice,
          item.lockedUnit
        )}`,
        emphasis: "negative",
      });
    }
  }

  // Best price — items with a new all-time low in the last 30 days.
  const now = Date.now();
  for (const [itemId, entries] of byItem) {
    if (entries.length < 2) continue;
    const item = items.find((i) => i.id === itemId);
    if (!item) continue;
    const cheapest = entries.reduce((a, b) =>
      a.unitPrice < b.unitPrice ? a : b
    );
    const ageDays =
      (now - new Date(cheapest.purchaseDate).getTime()) / MS_DAY;
    if (ageDays <= 30) {
      const store = ctx.stores.find((s) => s.id === cheapest.storeId);
      out.push({
        kind: "best-price",
        title: `${store?.name ?? "A store"} has your best price for ${item.canonicalName}`,
        detail: formatUnitPrice(cheapest.unitPrice, item.lockedUnit),
        emphasis: "positive",
      });
    }
  }

  // Monthly spend vs. prior month.
  const thisMonth = monthKey(new Date());
  const prevMonth = monthKey(new Date(Date.now() - 30 * MS_DAY));
  const thisTotal = prices
    .filter((p) => monthKey(new Date(p.purchaseDate)) === thisMonth)
    .reduce((a, b) => a + b.totalPrice, 0);
  const prevTotal = prices
    .filter((p) => monthKey(new Date(p.purchaseDate)) === prevMonth)
    .reduce((a, b) => a + b.totalPrice, 0);
  if (prevTotal > 0 && thisTotal > 0) {
    const pct = ((thisTotal - prevTotal) / prevTotal) * 100;
    if (Math.abs(pct) >= 10) {
      out.push({
        kind: "spending",
        title: `Spend ${pct > 0 ? "up" : "down"} ${Math.abs(pct).toFixed(0)}% vs. last month`,
        detail: `${formatUsd(thisTotal)} this month vs. ${formatUsd(prevTotal)} last month.`,
        emphasis: pct > 0 ? "negative" : "positive",
      });
    }
  }

  return out.slice(0, 4);
}

function groupBy<T, K>(arr: T[], key: (t: T) => K): Map<K, T[]> {
  const m = new Map<K, T[]>();
  for (const v of arr) {
    const k = key(v);
    const list = m.get(k) ?? [];
    list.push(v);
    m.set(k, list);
  }
  return m;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
