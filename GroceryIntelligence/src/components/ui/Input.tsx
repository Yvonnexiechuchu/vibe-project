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
      className={`border-2 border-[var(--ink-15)] rounded-[var(--radius-md)] bg-white text-[var(--ink)] placeholder:text-[var(--ink-30)] h-[48px] px-4 text-[15px] font-normal tracking-[-0.01em] transition-colors duration-200 focus:border-[var(--ink-50)] focus:ring-1 focus:ring-[var(--ink-08)] ${
        block ? "w-full" : ""
      } ${className}`}
      {...rest}
    />
  );
});
