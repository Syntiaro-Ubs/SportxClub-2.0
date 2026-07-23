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
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => setShowSplash(false), 500);
    }, 2000);
    return () => clearTimeout(timer);
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
