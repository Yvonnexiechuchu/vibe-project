import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "fill" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
};

const sizeCls: Record<Size, string> = {
  sm: "h-10 px-5 text-[13px] rounded-[10px]",
  md: "h-12 px-6 text-[14px] rounded-[12px]",
  lg: "h-[54px] px-7 text-[15px] rounded-[14px]",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "fill", size = "lg", block, className = "", children, disabled, ...rest },
  ref
) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold tracking-[-0.01em] select-none transition-all duration-200";
  const color =
    variant === "fill"
      ? "bg-[var(--ink)] text-white hover:bg-[var(--ink-80)] active:scale-[0.98]"
      : variant === "outline"
      ? "bg-white text-[var(--ink)] border-2 border-[var(--ink-15)] hover:border-[var(--ink-30)] hover:bg-[var(--ink-04)] active:scale-[0.98]"
      : "bg-transparent text-[var(--ink-80)] hover:text-[var(--ink)] hover:bg-[var(--ink-04)]";
  const width = block ? "w-full" : "";
  const dis = disabled ? "opacity-35 pointer-events-none" : "";
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
