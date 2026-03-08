"use client";

import { useState } from "react";
import AIReport from "./AIReport";
import ChatAgent from "./ChatAgent";

type PanelMode = null | "chat" | "report";

export default function FloatingAIPanel() {
  const [active, setActive] = useState<PanelMode>(null);

  return (
    <>
      {/* Overlay panel */}
      {active && (
        <div className="fixed inset-0 z-40 flex items-end justify-end p-4 sm:p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20" onClick={() => setActive(null)} />
          {/* Panel */}
          <div className="relative z-50 w-full max-w-lg mb-16">
            {active === "chat" && <ChatAgent />}
            {active === "report" && <AIReport />}
          </div>
        </div>
      )}

      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end group">
        {/* Labels appear on hover */}
        <button
          onClick={() => setActive(active === "report" ? null : "report")}
          className={`flex items-center gap-2 rounded-full shadow-lg px-4 py-3 text-sm font-medium transition-all ${
            active === "report"
              ? "bg-[#5A7394] text-white"
              : "bg-white text-[#5A7394] border border-[#C4B69C]/40 hover:bg-[#F2E8D5]"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="hidden group-hover:inline">AI Report</span>
        </button>
        <button
          onClick={() => setActive(active === "chat" ? null : "chat")}
          className={`flex items-center gap-2 rounded-full shadow-lg px-4 py-3 text-sm font-medium transition-all ${
            active === "chat"
              ? "bg-[#5A7394] text-white"
              : "bg-white text-[#5A7394] border border-[#C4B69C]/40 hover:bg-[#F2E8D5]"
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="hidden group-hover:inline">Q&A</span>
        </button>
      </div>
    </>
  );
}
