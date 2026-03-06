"use client";

import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  generatePackingList,
  categoryIcons,
  type PackingItem,
  type Category,
  type TripLength,
  type Season,
  type DestinationVibe,
} from "@/data/packingData";

function CircularProgress({ percentage, total, packed }: { percentage: number; total: number; packed: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="var(--progress-bg)" strokeWidth="8" />
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring-circle"
        />
        <text x="65" y="58" textAnchor="middle" className="text-2xl font-bold" fill="var(--foreground)">
          {percentage}%
        </text>
        <text x="65" y="78" textAnchor="middle" className="text-xs" fill="var(--text-muted)">
          {packed}/{total}
        </text>
      </svg>
    </div>
  );
}

function CategoryProgressBar({ label, percentage }: { label: string; percentage: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground w-28 truncate">{label}</span>
      <div className="flex-1 h-2 bg-progress-bg rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted w-8 text-right">{percentage}%</span>
    </div>
  );
}

export default function PackingListPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted">Loading your packing list...</p>
        </div>
      }
    >
      <PackingListContent />
    </Suspense>
  );
}

function PackingListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<PackingItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("Essentials");
  const [newItemName, setNewItemName] = useState("");
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    const length = searchParams.get("length") as TripLength;
    const season = searchParams.get("season") as Season;
    const vibesParam = searchParams.get("vibes");
    const vibes = (vibesParam?.split(",") || []) as DestinationVibe[];

    if (length && season && vibes.length > 0) {
      setItems(generatePackingList(length, season, vibes));
    }
  }, [searchParams]);

  const categories = useMemo(() => {
    const cats: Category[] = [
      "Essentials",
      "Clothes",
      "Personal Hygiene",
      "Electronics",
      "Makeup Bag",
      "Camera Gear",
      "Other",
    ];
    return cats.filter((cat) => items.some((item) => item.category === cat));
  }, [items]);

  const getCategoryItems = useCallback(
    (cat: Category) => items.filter((item) => item.category === cat),
    [items]
  );

  const getCategoryStats = useCallback(
    (cat: Category) => {
      const catItems = getCategoryItems(cat);
      const packed = catItems.filter((i) => i.packed).length;
      return { total: catItems.length, packed, percentage: catItems.length ? Math.round((packed / catItems.length) * 100) : 0 };
    },
    [getCategoryItems]
  );

  const totalStats = useMemo(() => {
    const packed = items.filter((i) => i.packed).length;
    const total = items.length;
    return { packed, total, percentage: total ? Math.round((packed / total) * 100) : 0 };
  }, [items]);

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, packed: !item.packed } : item)));
  };

  const addCustomItem = () => {
    const name = newItemName.trim();
    if (!name) return;
    const newItem: PackingItem = {
      id: `custom-${Date.now()}`,
      name,
      category: activeCategory,
      packed: false,
      isCustom: true,
    };
    setItems((prev) => [...prev, newItem]);
    setNewItemName("");
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleAllPacked = () => {
    const allDone = items.every((i) => i.packed);
    setItems((prev) => prev.map((item) => ({ ...item, packed: !allDone })));
  };

  const toggleCategoryPacked = () => {
    const catItems = getCategoryItems(activeCategory);
    const allDone = catItems.length > 0 && catItems.every((i) => i.packed);
    setItems((prev) =>
      prev.map((item) => (item.category === activeCategory ? { ...item, packed: !allDone } : item))
    );
    // Auto-advance to next category when packing (not unpacking)
    if (!allDone) {
      const currentIndex = categories.indexOf(activeCategory);
      if (currentIndex < categories.length - 1) {
        setActiveCategory(categories[currentIndex + 1]);
      }
    }
  };

  const downloadList = () => {
    let text = "PackMate - Packing List\n========================\n\n";
    categories.forEach((cat) => {
      const catItems = getCategoryItems(cat);
      text += `${cat}\n${"-".repeat(cat.length)}\n`;
      catItems.forEach((item) => {
        text += `${item.packed ? "[x]" : "[ ]"} ${item.name}\n`;
      });
      text += "\n";
    });
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "packing-list.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeCategoryItems = getCategoryItems(activeCategory);
  const allPacked = items.length > 0 && items.every((i) => i.packed);
  const categoryAllPacked =
    activeCategoryItems.length > 0 && activeCategoryItems.every((i) => i.packed);

  useEffect(() => {
    if (allPacked) {
      setShowCompletionModal(true);
    }
  }, [allPacked]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted mb-4">No packing list generated yet.</p>
          <button onClick={() => router.push("/")} className="text-accent hover:underline cursor-pointer">
            Go to Trip Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <span className="text-2xl">🧳</span>
          <h1 className="text-xl font-bold text-foreground">PackMate</h1>
          <span className="text-sm text-muted hidden sm:inline">Smart travel packing</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6 cursor-pointer"
        >
          <span>←</span>
          <span className="text-sm">Back to Trip Setup</span>
        </button>

        {/* Mobile Category Toggle */}
        <button
          onClick={() => setShowMobileCategories(!showMobileCategories)}
          className="lg:hidden w-full mb-4 p-3 bg-card rounded-xl border border-border flex items-center justify-between cursor-pointer"
        >
          <span className="font-medium text-sm">
            {categoryIcons[activeCategory]} {activeCategory}
          </span>
          <span className="text-muted">{showMobileCategories ? "▲" : "▼"}</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Categories */}
          <aside
            className={`lg:w-56 shrink-0 ${showMobileCategories ? "block" : "hidden"} lg:block`}
          >
            <div className="bg-card rounded-2xl border border-border p-4 sticky top-24">
              <h3 className="font-semibold text-foreground mb-3">Categories</h3>
              <nav className="space-y-1">
                {categories.map((cat) => {
                  const stats = getCategoryStats(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setShowMobileCategories(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-all cursor-pointer ${
                        activeCategory === cat
                          ? "bg-accent/10 text-accent font-medium"
                          : "text-foreground hover:bg-accent-light/50"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span>{categoryIcons[cat]}</span>
                        <span className="truncate">{cat}</span>
                      </span>
                      <span className="text-xs text-muted whitespace-nowrap ml-2">
                        {stats.packed}/{stats.total}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Center - Items Checklist */}
          <section className="flex-1 min-w-0">
            <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
              <h2 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
                <span>{categoryIcons[activeCategory]}</span>
                {activeCategory}
              </h2>

              <div className="space-y-2">
                {activeCategoryItems.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl transition-all cursor-pointer group ${
                      item.packed
                        ? "bg-accent/5 line-through text-muted"
                        : "bg-accent-light/30 hover:bg-accent-light/60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => toggleItem(item.id)}
                      className="w-5 h-5 rounded-full border-2 border-border text-accent focus:ring-accent accent-[var(--accent)] cursor-pointer"
                    />
                    <span className="flex-1 text-sm">{item.name}</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeItem(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-500 transition-all text-lg cursor-pointer"
                      title="Remove item"
                    >
                      ×
                    </button>
                  </label>
                ))}
              </div>

              {/* Add Custom Item */}
              <div className="mt-5 flex gap-2">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomItem()}
                  placeholder={`Add item to ${activeCategory}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
                />
                <button
                  onClick={addCustomItem}
                  disabled={!newItemName.trim()}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    newItemName.trim()
                      ? "bg-accent text-white hover:bg-accent-hover cursor-pointer"
                      : "bg-border text-muted cursor-not-allowed"
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
          </section>

          {/* Right Sidebar - Progress */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-24">
              <h3 className="font-semibold text-foreground mb-4">Packing Progress</h3>

              <div className="flex justify-center mb-6">
                <CircularProgress
                  percentage={totalStats.percentage}
                  total={totalStats.total}
                  packed={totalStats.packed}
                />
              </div>

              <div className="space-y-3">
                {categories.map((cat) => {
                  const stats = getCategoryStats(cat);
                  return (
                    <CategoryProgressBar key={cat} label={cat} percentage={stats.percentage} />
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2.5">
                <button
                  onClick={toggleCategoryPacked}
                  className="w-full py-3 rounded-xl bg-accent/80 text-white font-medium hover:bg-accent transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{categoryAllPacked ? "↩" : "✓"}</span>
                  {categoryAllPacked ? `Unpack ${activeCategory}` : `Pack All ${activeCategory}`}
                </button>
                <button
                  onClick={toggleAllPacked}
                  className="w-full py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{allPacked ? "↩" : "✓✓"}</span>
                  {allPacked ? "Unpack Everything" : "Pack Everything"}
                </button>
                <button
                  onClick={downloadList}
                  className="w-full py-3 rounded-xl bg-accent-light text-foreground font-medium hover:bg-border transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>↓</span> Download List
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* All Packed Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-xl max-w-sm w-full p-8 relative text-center">
            <button
              onClick={() => setShowCompletionModal(false)}
              className="absolute top-4 right-4 text-muted hover:text-foreground text-xl cursor-pointer"
            >
              ×
            </button>
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-accent-light flex items-center justify-center">
              <span className="text-4xl">🎉</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">All Packed!</h3>
            <p className="text-muted text-sm mb-6">
              You&apos;ve checked off everything on your packing list. Have a wonderful trip!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors cursor-pointer text-sm"
              >
                New List
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-accent-light transition-colors cursor-pointer text-sm"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
