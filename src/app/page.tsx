"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TripLength, Season, DestinationVibe } from "@/data/packingData";

const tripLengths: { value: TripLength; label: string; desc: string }[] = [
  { value: "weekend", label: "Weekend", desc: "1–3 days" },
  { value: "short", label: "Short Trip", desc: "4–7 days" },
  { value: "long", label: "Long Trip", desc: "8–14 days" },
  { value: "extended", label: "Extended", desc: "15+ days" },
];

const seasons: { value: Season; label: string; icon: string }[] = [
  { value: "spring", label: "Spring", icon: "🌱" },
  { value: "summer", label: "Summer", icon: "☀️" },
  { value: "fall", label: "Fall", icon: "🍂" },
  { value: "winter", label: "Winter", icon: "❄️" },
];

const vibes: { value: DestinationVibe; label: string; icon: string }[] = [
  { value: "city", label: "City", icon: "🏙️" },
  { value: "outdoor", label: "Outdoor", icon: "⛰️" },
  { value: "camping", label: "Camping", icon: "⛺" },
  { value: "beach", label: "Beach", icon: "🏖️" },
  { value: "business", label: "Business", icon: "💼" },
];

export default function Home() {
  const router = useRouter();
  const [selectedLength, setSelectedLength] = useState<TripLength | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedVibes, setSelectedVibes] = useState<DestinationVibe[]>([]);

  const toggleVibe = (vibe: DestinationVibe) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const canGenerate = selectedLength && selectedSeason && selectedVibes.length > 0;

  const handleGenerate = () => {
    if (!canGenerate) return;
    const params = new URLSearchParams({
      length: selectedLength,
      season: selectedSeason,
      vibes: selectedVibes.join(","),
    });
    router.push(`/packing-list?${params.toString()}`);
  };

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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left - Hero */}
          <div className="lg:w-5/12">
            <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80"
                  alt="Travel landscape"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Plan your perfect packing list
                </h2>
                <p className="text-muted text-sm leading-relaxed">
                  Tell us about your trip, and we&apos;ll generate a personalized packing
                  checklist so you never forget a thing.
                </p>
              </div>
            </div>
          </div>

          {/* Right - Trip Setup */}
          <div className="lg:w-7/12">
            <h2 className="text-2xl font-bold text-foreground mb-1">Set Up Your Trip</h2>
            <p className="text-muted mb-8">
              Select your travel details to generate a custom packing list.
            </p>

            {/* Trip Length */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-3">Trip Length</h3>
              <div className="grid grid-cols-2 gap-3">
                {tripLengths.map((tl) => (
                  <button
                    key={tl.value}
                    onClick={() => setSelectedLength(tl.value)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedLength === tl.value
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-border bg-card hover:border-accent/40"
                    }`}
                  >
                    <span className="text-lg">📅</span>
                    <div>
                      <div className="font-medium text-foreground text-sm">{tl.label}</div>
                      <div className="text-xs text-muted">{tl.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Season */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-3">Season</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {seasons.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSelectedSeason(s.value)}
                    className={`flex items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedSeason === s.value
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-border bg-card hover:border-accent/40"
                    }`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span className="font-medium text-sm text-foreground">{s.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Destination Vibe */}
            <section className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-3">Destination Vibe</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {vibes.map((v) => (
                  <button
                    key={v.value}
                    onClick={() => toggleVibe(v.value)}
                    className={`flex items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      selectedVibes.includes(v.value)
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-border bg-card hover:border-accent/40"
                    }`}
                  >
                    <span className="text-lg">{v.icon}</span>
                    <span className="font-medium text-sm text-foreground">{v.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">You can select multiple vibes</p>
            </section>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-white transition-all ${
                canGenerate
                  ? "bg-accent hover:bg-accent-hover shadow-md hover:shadow-lg cursor-pointer"
                  : "bg-muted cursor-not-allowed"
              }`}
            >
              Generate Packing List
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
