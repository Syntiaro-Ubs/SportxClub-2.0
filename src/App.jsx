import { useState, useEffect } from "react";
import { RouterProvider } from "react-router";
import { ThemeProvider } from "./app/providers/theme-provider";
import { AuthProvider } from "./app/providers/auth-provider";
import { router } from "./routes";

import { Toaster } from "sonner";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let fadeTimer = null;
    let removeTimer = null;

    const hideSplash = () => {
      setIsFading(true);
      removeTimer = setTimeout(() => setShowSplash(false), 500);
    };

    const startTime = Date.now();
    const minDisplayTime = 500; // Graceful 500ms intro branding animation

    const onFullyLoaded = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayTime - elapsed);
      fadeTimer = setTimeout(hideSplash, remaining);
    };

    if (document.readyState === "complete") {
      onFullyLoaded();
    } else {
      window.addEventListener("load", onFullyLoaded, { once: true });
    }

    // Safety fallback: Never trap the user longer than 6s even on ultra-slow 2G
    const maxSafetyTimer = setTimeout(hideSplash, 6000);

    return () => {
      window.removeEventListener("load", onFullyLoaded);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      clearTimeout(maxSafetyTimer);
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        {showSplash && (
          <div className={`fixed inset-0 z-[99999] bg-white dark:bg-[#0A0C10] flex items-center justify-center transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <img
              src="/assets/icons/SportXClub.png"
              alt="SportXClub Logo"
              className="w-56 md:w-72 animate-zoom-in-out block dark:hidden"
            />
            <img
              src="/assets/icons/SportXClub-light.png"
              alt="SportXClub Logo"
              className="w-56 md:w-72 animate-zoom-in-out hidden dark:block drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            />
          </div>
        )}
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </AuthProvider>
    </ThemeProvider>
  );
}
