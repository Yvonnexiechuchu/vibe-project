import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "fill" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
};

const sizeCls: Record<Size, string> = {
  sm: "h-10 px-4 text-[13px] rounded-[12px]",
  md: "h-12 px-5 text-[15px] rounded-[14px]",
  lg: "h-[60px] px-6 text-[17px] rounded-[16px]",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "fill", size = "lg", block, className = "", children, disabled, ...rest },
  ref
) {
  const base =
    "ink-border ink-shadow ink-press inline-flex items-center justify-center gap-2 font-extrabold select-none";
  const color =
    variant === "fill"
      ? "bg-ink text-white"
      : variant === "outline"
      ? "bg-white text-ink"
      : "bg-transparent text-ink border-transparent shadow-none";
  const width = block ? "w-full" : "";
  const dis = disabled ? "opacity-40 pointer-events-none" : "";
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`${base} ${sizeCls[size]} ${color} ${width} ${dis} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
});
