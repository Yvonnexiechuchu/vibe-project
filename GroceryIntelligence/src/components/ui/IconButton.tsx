import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  color?: "white" | "dark" | "ghost";
};

const sizeCls = {
  sm: "w-9 h-9 rounded-[10px]",
  md: "w-11 h-11 rounded-[12px]",
  lg: "w-[52px] h-[52px] rounded-[14px]",
};

const colorCls = {
  white: "bg-white text-[var(--ink)] border border-[var(--ink-08)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]",
  dark: "bg-[var(--ink)] text-white hover:bg-[var(--ink-80)]",
  ghost: "bg-transparent text-[var(--ink-80)] hover:bg-[var(--ink-04)]",
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
      className={`inline-flex items-center justify-center transition-all duration-200 ${sizeCls[size]} ${colorCls[color]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
