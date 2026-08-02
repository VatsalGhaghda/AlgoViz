import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { navSections } from "@/lib/nav";

export function CategoryPage() {
  const { category } = useParams();
  
  // Find the category in our nav structure
  const section = navSections.find((s) => s.id === category);

  if (!section) {
    return <Navigate to="/learn" replace />;
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-16">
      <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
        <Link to="/learn" className="hover:text-primary transition-colors">Catalog</Link> / {section.label}
      </div>
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4 flex items-center gap-4">
        <section.icon className="size-10 text-cat-1" />
        {section.label}
      </h1>
      {section.description && (
        <p className="text-sm text-muted-foreground max-w-2xl mb-12">
          {section.description}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-lg overflow-hidden">
        {section.items.map((item) => {
          const ready = item.status === "ready";
          const inner = (
            <div
              className={`bg-background p-6 h-full flex flex-col gap-3 transition-colors ${
                ready ? "hover:bg-secondary cursor-pointer" : "opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {ready ? "Ready" : "Coming soon"}
                </span>
                {ready ? (
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div className="text-base font-medium">{item.title}</div>
            </div>
          );
          return ready ? (
            <Link key={item.href} to={item.href}>
              {inner}
            </Link>
          ) : (
            <div key={item.href}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
