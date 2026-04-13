import { HTMLAttributes, forwardRef } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  color?: "white" | "yellow" | "red" | "blue" | "green" | "ink" | "muted";
  padded?: boolean;
};

const bg: Record<NonNullable<Props["color"]>, string> = {
  white: "bg-white text-ink",
  yellow: "bg-[var(--accent-yellow)] text-ink",
  red: "bg-[var(--accent-red)] text-white",
  blue: "bg-[var(--accent-blue)] text-white",
  green: "bg-[var(--accent-green)] text-ink",
  ink: "bg-ink text-white",
  muted: "bg-[var(--ink-100)] text-ink",
};

export const Card = forwardRef<HTMLDivElement, Props>(function Card(
  { color = "white", padded = true, className = "", children, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={`ink-border ink-shadow rounded-[16px] ${bg[color]} ${
        padded ? "p-5" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});
