import { useState } from "react";
import { Outlet } from "react-router-dom";
import { PanelLeft } from "lucide-react";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar, MobileSidebar } from "@/components/layout/Sidebar";

/**
 * AppShell wraps all /learn routes with the TopNav + collapsible Sidebar layout.
 * The sidebar is collapsed by default to maximize the workspace area.
 */
export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
        <MobileSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {/* Mobile nav toggle */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex items-center gap-2 rounded-md border border-border bg-elevated px-3 py-1.5 text-[13px] text-surface-foreground"
            >
              <PanelLeft className="size-3.5" aria-hidden="true" />
              Algorithms
            </button>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
