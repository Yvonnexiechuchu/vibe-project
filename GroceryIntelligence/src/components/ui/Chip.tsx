import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  size?: "sm" | "md";
};

export function Chip({ active, size = "md", className = "", children, ...rest }: Props) {
  const sizeCls =
    size === "sm"
      ? "h-8 px-3.5 text-[12px] rounded-full"
      : "h-9 px-4 text-[13px] rounded-full";
  const color = active
    ? "bg-[var(--ink)] text-white border-[var(--ink)]"
    : "bg-white text-[var(--ink-80)] border-[var(--ink-30)] hover:border-[var(--ink-50)]";
  return (
    <button
      className={`border font-medium whitespace-nowrap transition-all duration-200 ${sizeCls} ${color} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
