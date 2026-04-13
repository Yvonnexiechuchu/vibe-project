import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  size?: "sm" | "md";
};

export function Chip({ active, size = "md", className = "", children, ...rest }: Props) {
  const sizeCls =
    size === "sm"
      ? "h-8 px-3 text-[12px] rounded-full"
      : "h-9 px-4 text-[13px] rounded-full";
  const color = active
    ? "bg-ink text-white"
    : "bg-white text-ink";
  return (
    <button
      className={`ink-border ink-press font-extrabold whitespace-nowrap ${sizeCls} ${color} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
