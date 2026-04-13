"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChartIcon, HomeIcon, MessageIcon, UploadIcon } from "@/components/Icon";

const tabs = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/upload", label: "Upload", Icon: UploadIcon },
  { href: "/items", label: "Items", Icon: BarChartIcon },
  { href: "/chat", label: "Ask", Icon: MessageIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-white ink-shadow-top safe-area-bottom z-30">
      <div className="flex items-center justify-around px-4 py-3">
        {tabs.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-[14px] transition-colors ${
                active ? "bg-[var(--ink-100)]" : ""
              }`}
            >
              <Icon size={22} className="text-ink" />
              {active && (
                <span className="text-[13px] font-extrabold text-ink">{label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
