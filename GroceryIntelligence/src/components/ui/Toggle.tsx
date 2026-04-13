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
      className="ink-border ink-shadow rounded-full bg-white relative w-[52px] h-[30px] shrink-0 transition-colors"
      style={{ backgroundColor: checked ? "var(--ink)" : "white" }}
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white ink-border transition-[left] duration-150"
        style={{
          width: 18,
          height: 18,
          left: checked ? 28 : 4,
          backgroundColor: checked ? "white" : "var(--ink)",
        }}
      />
    </button>
  );
}
