"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { ChevronLeftIcon } from "@/components/Icon";

type Props = {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
};

export function TopBar({ title, showBack, right }: Props) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 bg-[var(--cream)]/95 backdrop-blur-md safe-area-top">
      <div className="flex items-center gap-3 px-6 py-4">
        {showBack ? (
          <button
            onClick={() => router.back()}
            aria-label="Back"
            className="w-9 h-9 -ml-1.5 rounded-full flex items-center justify-center text-[var(--ink-80)] hover:bg-[var(--ink-04)] transition-colors"
          >
            <ChevronLeftIcon size={22} />
          </button>
        ) : null}
        <h1 className="text-h2 flex-1 truncate">{title}</h1>
        {right}
      </div>
    </header>
  );
}
