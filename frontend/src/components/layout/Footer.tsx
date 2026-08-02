import { Link } from "react-router-dom";
import { Network } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row justify-between gap-12 lg:gap-10">
        
        {/* Left brand & description block */}
        <div className="flex flex-col gap-4 max-w-sm shrink-0">
          <Link to="/" className="flex items-center gap-2.5 w-fit drop-shadow-[0_0_12px_color-mix(in_oklab,var(--color-primary)_50%,transparent)] transition-all hover:drop-shadow-[0_0_18px_color-mix(in_oklab,var(--color-primary)_75%,transparent)]">
            <Network className="size-7 text-primary" aria-hidden="true" />
            <span className="text-2xl font-extrabold tracking-tight text-gradient-brand">
              AlgoViz
            </span>
          </Link>

          <p className="text-sm text-muted-foreground leading-relaxed">
            An interactive algorithm &amp; data structure visualizer built for learning—focused on usability and real execution insights.
          </p>

          {/* Social / contact icons (Exact Outline SVGs matching screenshot) */}
          <div className="flex items-center gap-4 text-muted-foreground pt-2">
            <a href="mailto:ghaghdavatsal0@gmail.com" className="hover:text-foreground transition-colors" aria-label="Email">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </a>
            <a href="https://github.com/VatsalGhaghda" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="GitHub">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/vatsal-ghaghda" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors" aria-label="LinkedIn">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect width="4" height="12" x="2" y="9"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>


      </div>

      <div className="border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>
            &copy; {new Date().getFullYear()} AlgoViz - Developed by{" "}
            <span className="font-medium text-foreground">Vatsal Ghaghda</span>
          </span>
          <span className="flex items-center gap-1.5">
            Made with <span className="text-red-500 text-sm">❤</span> for algorithm lovers everywhere
          </span>
        </div>
      </div>
    </footer>
  );
}
