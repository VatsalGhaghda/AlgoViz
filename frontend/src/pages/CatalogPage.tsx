import { Link } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { navSections } from "@/lib/nav";

export function CatalogPage() {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-16">
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-4">Catalog</div>
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4">All visualizations</h1>
      <p className="text-sm text-muted-foreground max-w-2xl mb-12">
        Choose a data structure or algorithm. Every visualization ships with step-by-step playback, code
        synchronization, and variable tracking.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden">
        {navSections.map((section, idx) => {
          // For now, consider a section "ready" if it has at least one ready item
          const readyCount = section.items.filter(i => i.status === "ready").length;
          const isReady = readyCount > 0;
          
          const inner = (
            <div
              className={`bg-background p-6 h-full flex flex-col gap-3 transition-colors ${
                isReady ? "hover:bg-secondary cursor-pointer" : "opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {readyCount} Operations
                </span>
                {isReady ? (
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <section.icon className="size-5 text-muted-foreground" />
                <div className="text-base font-medium">{section.label}</div>
              </div>
              {section.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {section.description}
                </p>
              )}
            </div>
          );

          return isReady ? (
            <Link key={section.id} to={`/learn/${section.id}`}>
              {inner}
            </Link>
          ) : (
            <div key={section.id}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
