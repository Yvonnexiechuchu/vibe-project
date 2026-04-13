"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { ChevronLeftIcon } from "@/components/Icon";
import { IconButton } from "./IconButton";

type Props = {
  title?: string;
  showBack?: boolean;
  right?: ReactNode;
};

export function TopBar({ title, showBack, right }: Props) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 bg-white safe-area-top">
      <div className="flex items-center gap-4 px-6 py-5">
        {showBack ? (
          <IconButton size="md" onClick={() => router.back()} aria-label="Back">
            <ChevronLeftIcon />
          </IconButton>
        ) : null}
        <h1 className="text-h2 flex-1 truncate">{title}</h1>
        {right}
      </div>
    </header>
  );
}
