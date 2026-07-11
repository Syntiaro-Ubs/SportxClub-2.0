import { Link } from "react-router";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import { Button } from "../components/ui/button";
import { Logo } from "../components/brand/Logo";
import { AppDownloadSection } from "../components/brand/AppDownloadSection";

export function DownloadPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = !mounted || resolvedTheme !== "light";

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? "bg-[#020617] text-white" : "bg-[#f8faf9] text-slate-900"
    }`}>
      {/* Mini Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-3">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline" className="gap-2 rounded-full">
              <Home className="w-4 h-4" />
              Go to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 w-full max-w-6xl mx-auto z-10">
        <AppDownloadSection />
      </main>
    </div>
  );
}
