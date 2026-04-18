"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { TopBar } from "@/components/ui/TopBar";
import { CheckIcon, StoreIcon } from "@/components/Icon";
import { clearSession, loadSession } from "@/lib/receipt-session";
import { saveReceipt } from "@/lib/client-api";
import { formatUsd } from "@/lib/units";
import type { ParsedReceipt } from "@/lib/types";

type Status = "idle" | "saving" | "done" | "error";

export default function SummaryPage() {
  const router = useRouter();
  const [parsed, setParsed] = useState<ParsedReceipt | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const p = loadSession();
    if (!p) {
      router.replace("/upload");
      return;
    }
    setParsed(p);
  }, [router]);

  const included = useMemo(
    () => parsed?.items.filter((i) => (i as { include?: boolean }).include !== false) ?? [],
    [parsed]
  );
  const total = included.reduce((a, b) => a + b.totalPrice, 0);
  const canSave = parsed && included.length > 0 && status === "idle";

  async function onConfirm() {
    if (!parsed) return;
    setStatus("saving");
    setErr(null);
    try {
      const res = await saveReceipt({
        storeName: parsed.storeName,
        purchaseDate: parsed.purchaseDate,
        items: parsed.items.map((i) => ({
          ...i,
          confirmedName: i.suggestedName,
          confirmedCategory: i.suggestedCategory,
          lockedUnit: i.packageSizeUnit ?? undefined,
        })),
      });
      setSavedCount(res.savedCount);
      setStatus("done");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      setErr(msg);
      setStatus("error");
    }
  }

  if (!parsed) return null;

  if (status === "done") {
    return (
      <Screen nav={false}>
        <TopBar title="Saved" />
        <div className="px-6 mt-10 animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="inline-flex w-20 h-20 rounded-full bg-[var(--sage-light)] items-center justify-center mb-4">
              <CheckIcon size={32} className="text-[var(--sage)]" />
            </div>
            <h2 className="text-h1">All set.</h2>
            <p className="text-body text-[var(--ink-50)] mt-2">
              {savedCount} item{savedCount === 1 ? "" : "s"} logged to your database.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              block
              onClick={() => {
                clearSession();
                router.push("/");
              }}
            >
              Done
            </Button>
            <Button
              variant="outline"
              size="lg"
              block
              onClick={() => {
                clearSession();
                router.push("/upload");
              }}
            >
              Scan another
            </Button>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen nav={false}>
      <TopBar showBack title="Confirm" />

      <div className="px-6">
        <div className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--ink)] p-6">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[var(--amber)] opacity-15" />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-white/10 flex items-center justify-center shrink-0">
              <StoreIcon className="text-white" />
            </div>
            <div className="flex-1 text-white">
              <p className="text-caption text-white/50">{parsed.purchaseDate}</p>
              <p className="text-h1 text-white mt-1">{parsed.storeName}</p>
              <p className="text-meta text-white/60 mt-1">
                {included.length} items · {formatUsd(total)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-6">
        <h2 className="text-h2 mb-3">Items to save</h2>
        <div className="flex flex-col gap-2 stagger">
          {included.map((i, idx) => (
            <div
              key={idx}
              className="rounded-[var(--radius-lg)] bg-white border border-[var(--ink-15)] px-4 py-3.5 flex items-center gap-3 animate-fade-in-up opacity-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-h3 truncate">{i.suggestedName}</p>
                <p className="text-meta text-[var(--ink-50)] truncate">
                  {i.packageSizeRaw ?? "—"} · {i.suggestedCategory}
                </p>
              </div>
              <p className="text-h3 shrink-0">{formatUsd(i.totalPrice)}</p>
            </div>
          ))}
        </div>
      </div>

      {err && (
        <div className="px-6 mt-4">
          <Card color="cream" padded>
            <p className="text-h3 text-[var(--terracotta)]">Save failed</p>
            <p className="text-meta text-[var(--ink-50)] mt-1">{err}</p>
          </Card>
        </div>
      )}

      <div className="h-[100px]" />

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-[var(--cream)]/95 backdrop-blur-md border-t border-[var(--ink-15)] safe-area-bottom z-20">
        <div className="px-6 py-4">
          <Button size="lg" block disabled={!canSave} onClick={onConfirm}>
            {status === "saving" ? "Saving…" : "Save to database"}
          </Button>
        </div>
      </footer>
    </Screen>
  );
}
