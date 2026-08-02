import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { LandingPage } from "@/pages/LandingPage";
import { AboutPage } from "@/pages/AboutPage";
import { CatalogPage } from "@/pages/CatalogPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { WorkspacePage } from "@/pages/WorkspacePage";
import { PythonWorkspacePage } from "@/pages/PythonWorkspacePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing — standalone layout (no sidebar) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Learn routes — wrapped in AppShell (TopNav + Sidebar) */}
        <Route element={<AppShell />}>
          <Route path="/learn" element={<CatalogPage />} />
          <Route path="/learn/:category" element={<CategoryPage />} />
          <Route path="/learn/:category/:operation" element={<WorkspacePage />} />
          {/* Phase 9.2: Python Code Visualizer */}
          <Route path="/python" element={<PythonWorkspacePage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
