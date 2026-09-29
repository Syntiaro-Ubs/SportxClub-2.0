import React, { Suspense, lazy } from "react";
import { useIsMobile } from "../components/ui/use-mobile";

const HomePage = lazy(() =>
  import("../components/home/homepage").then((m) => ({ default: m.HomePage }))
);

const MobileHomePage = lazy(() =>
  import("../components/mobile/mobile-home").then((m) => ({ default: m.MobileHomePage }))
);

const FallbackLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
  </div>
);

export function LandingPage() {
  const isMobile = useIsMobile();

  return (
    <Suspense fallback={<FallbackLoader />}>
      {isMobile ? <MobileHomePage /> : <HomePage />}
    </Suspense>
  );
}
