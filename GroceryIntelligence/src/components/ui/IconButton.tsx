import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  color?: "white" | "ink" | "yellow";
};

const sizeCls = {
  sm: "w-10 h-10 rounded-[12px]",
  md: "w-12 h-12 rounded-[14px]",
  lg: "w-[60px] h-[60px] rounded-[16px]",
};

const colorCls = {
  white: "bg-white text-ink",
  ink: "bg-ink text-white",
  yellow: "bg-[var(--accent-yellow)] text-ink",
};

export function IconButton({
  size = "md",
  color = "white",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      className={`ink-border ink-shadow ink-press inline-flex items-center justify-center ${sizeCls[size]} ${colorCls[color]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
