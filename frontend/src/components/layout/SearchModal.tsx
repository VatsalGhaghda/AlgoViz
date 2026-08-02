import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, ArrowRight } from "lucide-react";
import { navSections, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input on mount
  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  // Flatten and filter nav items
  const flatItems: (NavItem & { sectionLabel: string })[] = [];
  navSections.forEach((section) => {
    section.items.forEach((item) => {
      flatItems.push({ ...item, sectionLabel: section.label });
    });
  });

  const filteredItems = query.trim()
    ? flatItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.sectionLabel.toLowerCase().includes(query.toLowerCase())
      )
    : flatItems;

  const handleSelect = (item: NavItem) => {
    if (item.status === "ready") {
      navigate(item.href);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 p-4 pt-[10vh] backdrop-blur-sm sm:p-6 sm:pt-[20vh]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-sidebar shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input Header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="size-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search algorithms, data structures..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Results List */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-12 text-center text-[13px] text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredItems.map((item) => {
                  const isReady = item.status === "ready";
                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => handleSelect(item)}
                        disabled={!isReady}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors",
                          isReady
                            ? "hover:bg-muted"
                            : "cursor-not-allowed opacity-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="size-4 text-muted-foreground" />
                          <div>
                            <div className="text-[14px] font-medium text-foreground">
                              {item.title}
                            </div>
                            <div className="text-[12px] text-muted-foreground">
                              {item.sectionLabel}
                            </div>
                          </div>
                        </div>
                        {isReady ? (
                          <ArrowRight className="size-4 text-muted-foreground" />
                        ) : (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                            Soon
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
