import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Network, Search, Sun, UserCircle } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "@/hooks/use-theme";
import { SearchModal } from "./SearchModal";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Visualizer", href: "/learn" },
  { label: "Playground", href: "/python" },
  { label: "About", href: "/about" },
];

export function TopNav() {
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);



  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-4 sm:gap-6">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5 drop-shadow-[0_0_10px_color-mix(in_oklab,var(--color-primary)_50%,transparent)] transition-all hover:drop-shadow-[0_0_16px_color-mix(in_oklab,var(--color-primary)_75%,transparent)]">
          <Network className="size-[22px] text-primary" aria-hidden="true" />
          <span className="text-lg font-bold tracking-tight text-gradient-brand sm:text-xl">
            AlgoViz
          </span>
        </Link>

        <span className="hidden h-4 w-px bg-border sm:block" />

        {/* Primary nav */}
        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {NAV_LINKS.map((item) => {
            const active = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "rounded-md border border-primary/25 bg-primary/10 px-3 py-1.5 text-[13px] font-medium text-primary"
                    : "rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Search Modal overlay */}
        <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Search button */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden items-center gap-2 rounded-md border border-border bg-muted/60 py-1.5 pl-3 pr-3 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground lg:flex"
        >
          <Search className="size-3.5" aria-hidden="true" />
          <span>Search algorithms…</span>
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
          className="relative grid size-9 place-items-center overflow-hidden rounded-md border border-border bg-elevated text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
        >
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className={cn(
              "grid place-items-center",
              theme === "dark" ? "text-warning" : "text-primary",
            )}
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </motion.span>
        </button>

        {/* Avatar */}
        <button
          type="button"
          aria-label="User profile"
          className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-elevated text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
        >
          <UserCircle className="size-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
