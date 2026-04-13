import type { Unit } from "./types";

/**
 * Convert a measurement between compatible units so every price entry of a
 * given item is comparable regardless of the raw receipt label.
 *
 * Only weight↔weight and volume↔volume conversions are supported. Mixing
 * families (oz → ml) returns null — the caller must prompt the user.
 */
const WEIGHT_TO_G: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  L: 1000,
  fl_oz: 29.5735,
};

export function convert(value: number, from: Unit, to: Unit): number | null {
  if (from === to) return value;
  if (from in WEIGHT_TO_G && to in WEIGHT_TO_G) {
    return (value * WEIGHT_TO_G[from]) / WEIGHT_TO_G[to];
  }
  if (from in VOLUME_TO_ML && to in VOLUME_TO_ML) {
    return (value * VOLUME_TO_ML[from]) / VOLUME_TO_ML[to];
  }
  if (from === "count" && to === "count") return value;
  return null;
}

export function formatUnitPrice(pricePerLockedUnit: number, unit: Unit): string {
  if (pricePerLockedUnit < 0.01) {
    return `$${pricePerLockedUnit.toFixed(4)}/${unit}`;
  }
  return `$${pricePerLockedUnit.toFixed(2)}/${unit}`;
}

export function formatUsd(n: number): string {
  return `$${n.toFixed(2)}`;
}
