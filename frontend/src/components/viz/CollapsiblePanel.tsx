import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type CollapseDirection = "vertical" | "horizontal";

interface CollapsiblePanelProps {
  /** Visible header label */
  label?: React.ReactNode;
  /** Direction the panel collapses */
  direction?: CollapseDirection;
  /** Whether the panel is currently open */
  open: boolean;
  /** Called when the toggle button is clicked */
  onToggle: () => void;
  /** Icon to show before the label */
  icon?: React.ReactNode;
  /** Extra class names on the outer wrapper */
  className?: string;
  /** Extra class names on the body (content area) */
  bodyClassName?: string;
  /** Right-side actions placed in the header bar */
  headerActions?: React.ReactNode;
  /** When true, the collapse toggle button is hidden from the header */
  hideToggle?: boolean;
  children: React.ReactNode;
}

export function CollapsiblePanel({
  label,
  direction = "vertical",
  open,
  onToggle,
  icon,
  className,
  bodyClassName,
  headerActions,
  hideToggle = false,
  children,
}: CollapsiblePanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const isVertical = direction === "vertical";

  /* ── Chevron icon ─────────────────────────────────────────────────
     Vertical:   open → ChevronDown  (click to collapse ↓)
                 closed → ChevronUp  (click to expand ↑)
     Horizontal: open → ChevronRight (sidebar is open, click to hide →)
                 closed → ChevronLeft (sidebar hidden, click to show ←)
  ───────────────────────────────────────────────────────────────── */
  const ChevronIcon = isVertical
    ? open
      ? ChevronDown
      : ChevronUp
    : open
      ? ChevronRight
      : ChevronLeft;

  const isClickable = !hideToggle;

  return (
    <div
      className={cn(
        "panel flex min-h-0 flex-col overflow-hidden",
        !isVertical && !open && "!p-0",
        className,
      )}
    >
      {/* ── Header bar ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "panel-header flex shrink-0 items-center justify-between select-none",
          isClickable && "cursor-pointer",
          !open && "border-b-0",
        )}
        onClick={isClickable ? onToggle : undefined}
        role={isClickable ? "button" : undefined}
        aria-expanded={isClickable ? open : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={
          isClickable
            ? (e) => (e.key === "Enter" || e.key === " " ? onToggle() : undefined)
            : undefined
        }
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
          {label && (
            <span className="truncate font-mono text-[12px] text-surface-foreground">
              {label}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {headerActions && (
            <span
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1"
            >
              {headerActions}
            </span>
          )}
          {/* Collapse toggle — hidden when hideToggle=true */}
          {!hideToggle && (
            <button
              type="button"
              aria-label={open ? "Collapse panel" : "Expand panel"}
              tabIndex={-1}
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className={cn(
                "flex size-6 items-center justify-center rounded-md text-muted-foreground",
                "transition-colors hover:bg-muted hover:text-foreground",
              )}
            >
              <ChevronIcon className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Collapsible body ───────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            ref={contentRef}
            key="body"
            initial={isVertical ? { height: 0, opacity: 0 } : { width: 0, opacity: 0 }}
            animate={isVertical ? { height: "auto", opacity: 1 } : { width: "auto", opacity: 1 }}
            exit={isVertical ? { height: 0, opacity: 0 } : { width: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className={cn("min-h-0 flex-1 overflow-hidden", bodyClassName)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
