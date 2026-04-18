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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-[var(--cream)]/95 backdrop-blur-md border-t border-[var(--ink-15)] safe-area-bottom z-30">
      <div className="flex items-center justify-around px-2 py-2.5">
        {tabs.map(({ href, label, Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-[12px] transition-colors duration-200 ${
                active
                  ? "text-[var(--terracotta)]"
                  : "text-[var(--ink-50)] hover:text-[var(--ink-80)]"
              }`}
            >
              <Icon size={22} />
              <span className="text-[11px] font-semibold tracking-[0.02em]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
