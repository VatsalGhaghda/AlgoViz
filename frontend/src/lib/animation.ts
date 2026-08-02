/**
 * Shared animation configurations for consistent motion across the app.
 * All components should import from here instead of defining inline springs.
 */

export const springs = {
  /** Fast, responsive — for sidebar active indicators, small UI elements */
  snappy: { type: "spring", stiffness: 500, damping: 40 } as const,
  /** Balanced — for bar height animations, panel transitions */
  smooth: { type: "spring", stiffness: 380, damping: 30 } as const,
  /** Slightly bouncy — for layout shifts, card hover lifts */
  bouncy: { type: "spring", stiffness: 420, damping: 34 } as const,
  /** Gentle — for page-level fades, hero animations */
  gentle: { type: "spring", stiffness: 200, damping: 22 } as const,
} as const;

export const transitions = {
  /** Fade-in from below — for staggered content entry */
  fadeInUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
  /** Scale-in — for cards and panels */
  scaleIn: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6 },
  },
  /** Quick fade — for variable value changes */
  valuePop: {
    initial: { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 6 },
    transition: { duration: 0.14 },
  },
} as const;

/** Stagger delay calculator for sequential item animations */
export function staggerDelay(index: number, base = 0.05): number {
  return index * base;
}
