import { HomePage } from "../components/home/homepage";
import { MobileHomePage } from "../components/mobile/mobile-home";
import { useIsMobile } from "../components/ui/use-mobile";

export function LandingPage() {
  const isMobile = useIsMobile();

  return isMobile ? <MobileHomePage /> : <HomePage />;
}
