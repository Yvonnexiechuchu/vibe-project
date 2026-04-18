/**
 * Feather-style icons — 24px viewBox, 2px stroke, round caps/joins.
 * Matches the Contra wireframe kit iconography exactly.
 */

type IconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

const base = (size: number, strokeWidth: number = 1.75) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function HomeIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M3 9.5 12 3l9 6.5V20a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2V9.5Z" />
    </svg>
  );
}

export function CameraIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function BarChartIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export function MessageIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
    </svg>
  );
}

export function SearchIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function ChevronLeftIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export function ChevronRightIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function ChevronDownIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function PlusIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function CheckIcon({ className, size = 24, strokeWidth = 2.5 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function XIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function SendIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function TrendingUpIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export function TrendingDownIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  );
}

export function LeafIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M6 3a9 9 0 0 0 9 16c3 0 6-3 6-6V3s-4 0-7 3c-2 2-3 5-3 8" />
      <path d="M6 3c0 6 3 10 9 11" />
    </svg>
  );
}

export function StoreIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M3 9 5 3h14l2 6" />
      <path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    </svg>
  );
}

export function UploadIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function AlertIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function SparkleIcon({ className, size = 24, strokeWidth = 2 }: IconProps) {
  return (
    <svg {...base(size, strokeWidth)} className={className}>
      <path d="M12 3 L13.5 10.5 L21 12 L13.5 13.5 L12 21 L10.5 13.5 L3 12 L10.5 10.5 Z" />
    </svg>
  );
}
