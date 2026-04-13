import { InputHTMLAttributes, forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  block?: boolean;
};

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className = "", block = true, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={`ink-border rounded-[14px] bg-white text-ink placeholder:text-[var(--ink-300)] h-[52px] px-4 text-[15px] font-bold ${
        block ? "w-full" : ""
      } ${className}`}
      {...rest}
    />
  );
});
