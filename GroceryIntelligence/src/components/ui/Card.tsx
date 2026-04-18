import { HTMLAttributes, forwardRef } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  color?: "white" | "cream" | "dark" | "terracotta" | "sage" | "amber" | "muted";
  padded?: boolean;
  hoverable?: boolean;
};

const bg: Record<NonNullable<Props["color"]>, string> = {
  white: "bg-white text-[var(--ink)]",
  cream: "bg-[var(--ink-04)] text-[var(--ink)]",
  dark: "bg-[var(--ink)] text-white",
  terracotta: "bg-[var(--terracotta)] text-white",
  sage: "bg-[var(--sage-light)] text-[var(--ink)]",
  amber: "bg-[var(--amber-light)] text-[var(--ink)]",
  muted: "bg-[var(--ink-04)] text-[var(--ink)]",
};

export const Card = forwardRef<HTMLDivElement, Props>(function Card(
  { color = "white", padded = true, hoverable, className = "", children, ...rest },
  ref
) {
  const hover = hoverable
    ? "transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
    : "";
  return (
    <div
      ref={ref}
      className={`rounded-[var(--radius-xl)] border border-[var(--ink-15)] shadow-[var(--shadow-card)] ${bg[color]} ${
        padded ? "p-5" : ""
      } ${hover} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});
