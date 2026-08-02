import type { HighlightState } from "@/types/visualization";

export const DEFAULT_ARRAY = [34, 25, 12, 22, 11, 64, 90];

export function randomArray(size = 8, min = 5, max = 99): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * (max - min + 1)) + min);
}

export function sortedRandomArray(size = 8): number[] {
  return randomArray(size).sort((a, b) => a - b);
}

export function buildHighlights(
  n: number,
  sortedIndices: Set<number>,
  overrides: Record<number, HighlightState> = {},
  range?: { low: number; high: number }
): Record<number, HighlightState> {
  const highlights: Record<number, HighlightState> = {};
  for (let i = 0; i < n; i++) {
    if (overrides[i]) {
      highlights[i] = overrides[i];
    } else if (sortedIndices.has(i)) {
      highlights[i] = "sorted";
    } else if (range && (i < range.low || i > range.high)) {
      highlights[i] = "inactive";
    } else {
      highlights[i] = "idle";
    }
  }
  return highlights;
}
