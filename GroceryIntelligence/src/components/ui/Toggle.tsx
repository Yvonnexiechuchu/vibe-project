"use client";

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  ariaLabel?: string;
};

export function Toggle({ checked, onChange, label, ariaLabel }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      onClick={() => onChange(!checked)}
      className="relative w-[46px] h-[26px] shrink-0 rounded-full border-2 transition-colors duration-200"
      style={{
        backgroundColor: checked ? "var(--ink)" : "var(--ink-08)",
        borderColor: checked ? "var(--ink)" : "var(--ink-30)",
      }}
    >
      <span
        className="absolute top-[2px] rounded-full bg-white transition-[left] duration-200"
        style={{
          width: 18,
          height: 18,
          left: checked ? 23 : 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}
      />
    </button>
  );
}
