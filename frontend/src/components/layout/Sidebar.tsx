import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { navSections } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/animation";

/* Color palette per nav group — from Lovable's category system */
const GROUP_COLOR = [
  "text-cat-1",
  "text-cat-2",
  "text-cat-3",
  "text-cat-4",
  "text-cat-5",
  "text-cat-6",
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  // Initialize expanded state: expand the group that contains the current active route
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    navSections.forEach(group => {
      // Default to open if it contains the active item, or just set all to true initially if preferred.
      // We'll set the active one to true, others to false to match the accordion behavior requested.
      initialState[group.label] = group.items.some(item => item.href === location.pathname);
    });
    return initialState;
  });

  const toggleGroup = (label: string) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="px-4 pb-2 pt-5">
        <p className="eyebrow">Algorithms</p>
      </div>

      <nav aria-label="Algorithms" className="flex-1 space-y-2 overflow-y-auto px-2 pb-4">
        {navSections.map((group, gi) => (
          <div key={group.label} className="flex flex-col">
            <button
              onClick={() => toggleGroup(group.label)}
              className="mb-1 flex w-full items-center justify-between rounded px-2 py-1.5 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <group.icon
                  className={cn("size-3 shrink-0", GROUP_COLOR[gi % GROUP_COLOR.length])}
                  aria-hidden="true"
                />
                <span className="eyebrow tracking-wider">{group.label}</span>
              </div>
              {expanded[group.label]
                ? <ChevronUp className="size-3 text-muted-foreground transition-transform duration-200" />
                : <ChevronDown className="size-3 text-muted-foreground transition-transform duration-200" />
              }
            </button>
            <AnimatePresence initial={false}>
              {expanded[group.label] && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-0.5 overflow-hidden"
                >
                  {group.items.map((item) => {
                    const active = location.pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          to={item.status === "ready" ? item.href : "#"}
                          onClick={(e) => {
                            if (item.status !== "ready") {
                              e.preventDefault();
                              return;
                            }
                            onNavigate?.();
                          }}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "relative flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] transition-colors",
                            active
                              ? "text-primary"
                              : item.status === "ready"
                                ? "text-secondary-foreground hover:bg-muted hover:text-foreground"
                                : "text-muted-foreground/50 cursor-default",
                          )}
                        >
                          {active && (
                            <motion.span
                              layoutId="sidebar-active"
                              transition={springs.snappy}
                              className="absolute inset-0 rounded-md border border-primary/30 bg-primary/10"
                            />
                          )}
                          <span className="relative truncate">{item.title}</span>
                          {item.status === "soon" && (
                            <span className="relative ml-auto rounded bg-muted px-1.5 py-0.5 text-[0.6rem] font-medium tracking-wide text-muted-foreground uppercase">
                              Soon
                            </span>
                          )}
                          {active && (
                            <span className="relative ml-auto size-1.5 rounded-full bg-accent" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </div>
  );
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar — collapsible */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 224, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="hidden shrink-0 overflow-hidden border-r border-sidebar-border lg:block"
          >
            <div className="w-56">
              <SidebarContent />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop toggle button — pill on the edge */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        className={cn(
          "relative z-10 my-auto hidden lg:flex h-12 w-4 shrink-0 items-center justify-center",
          "rounded-full border border-border bg-elevated shadow-md",
          "text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground",
        )}
      >
        {open ? <ChevronLeft className="size-3" /> : <ChevronRight className="size-3" />}
      </button>
    </>
  );
}

/** Mobile sidebar — slides in as overlay */
export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={springs.snappy}
            onClick={(e) => e.stopPropagation()}
            className="h-full w-64 border-r border-sidebar-border bg-sidebar"
          >
            <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
              <span className="text-[13px] font-medium text-foreground">Browse</span>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={onClose}
                className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <SidebarContent onNavigate={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
