import { useMemo, useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  MapPin,
  Trophy,
  Users,
  UserCircle,
  MessageSquare,
  ChevronDown,
  Check,
  Activity,
} from "lucide-react";

import { Button } from "../ui/button";
import { Logo } from "../brand/Logo";
import { MobileAppBar, MobileBottomNav } from "../mobile/mobile-chrome";
import { ThemeToggleButton } from "../ui/theme-toggle-button";
import { useAuth } from "../../providers/auth-provider";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

const navigation = [
  { name: "Player Details", href: "/player-dashboard", icon: Activity },
  { name: "Turfs", href: "/venues", icon: MapPin },
  { name: "Tournaments", href: "/tournaments", icon: Trophy },
  { name: "Community", href: "/community", icon: MessageSquare },
];

function getMobileTab(pathname) {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/venues")) return "explore";
  if (pathname.startsWith("/bookings") || pathname.startsWith("/payment"))
    return "bookings";
  if (pathname.startsWith("/tournaments")) return "tournaments";
  return "profile";
}

function CitySelector() {
  const [city, setCity] = useState(
    () => localStorage.getItem("preferred-city") || "All",
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleCityChange = (e) => {
      const customEvent = e;
      setCity(customEvent.detail);
    };
    window.addEventListener("preferredCityChanged", handleCityChange);
    return () =>
      window.removeEventListener("preferredCityChanged", handleCityChange);
  }, []);

  const handleCitySelect = (selected) => {
    localStorage.setItem("preferred-city", selected);
    setCity(selected);
    setIsOpen(false);
    window.dispatchEvent(
      new CustomEvent("preferredCityChanged", { detail: selected }),
    );
  };

  const cities = ["All", "Mumbai", "Thane", "Navi Mumbai"];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3.5 py-2 text-xs  transition hover:bg-accent hover:text-foreground text-foreground cursor-pointer"
      >
        <MapPin className="h-4 w-4 text-primary shrink-0" />
        <span>{city === "All" ? "All Cities" : city}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 mt-2 w-48 rounded-2xl border border-border bg-card p-2 shadow-xl z-50 backdrop-blur-xl"
            >
              <p className="px-3 py-1.5 text-[0.68rem]  uppercase tracking-wider text-muted-foreground">
                Select Region
              </p>
              <div className="space-y-0.5 mt-1">
                {cities.map((c) => {
                  const isSelected = city === c;
                  return (
                    <button
                      key={c}
                      onClick={() => handleCitySelect(c)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs  transition cursor-pointer ${
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-accent"
                      }`}
                    >
                      <span>{c === "All" ? "All Cities" : c}</span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Layout() {
  const location = useLocation();
  const mobileTab = useMemo(
    () => getMobileTab(location.pathname),
    [location.pathname],
  );
  const { currentUser } = useAuth();
  const displayName = currentUser?.fullName || "John Doe";

  const hideMobileNav = useMemo(() => {
    const path = location.pathname;
    const isVenueDetails = /^\/venues\/\w+/.test(path);
    return (
      isVenueDetails ||
      path.startsWith("/payment") ||
      path.startsWith("/booking-success") ||
      path.startsWith("/squad-booking")
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      {/* Desktop Top Navbar */}
      <header className="hidden md:flex h-16 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-6 sticky top-0 z-50 w-full">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 h-[58px] translate-y-[4px]">
            <Logo className="h-full" />
          </Link>
          <CitySelector />
        </div>

        <nav className="flex items-center gap-2">
          {navigation
            .filter((item) => {
              if (
                !currentUser &&
                ["Player Details", "Community"].includes(item.name)
              ) {
                return false;
              }
              return true;
            })
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/dashboard" &&
                  location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <Link to={currentUser.role === 'owner' ? '/owner-dashboard' : '/profile'}>
              <Button
                variant="ghost"
                className="rounded-full gap-2.5 text-muted-foreground hover:text-foreground px-2.5 h-10 cursor-pointer"
              >
                <Avatar className="h-6 w-6 border border-border/80">
                  {currentUser?.profilePicture && (
                    <AvatarImage src={currentUser.profilePicture} className="object-cover" />
                  )}
                  <AvatarFallback className="bg-primary text-[10px] font-bold text-primary-foreground">
                    {currentUser?.fullName
                      ? currentUser.fullName.trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2)
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-semibold leading-none">{displayName}</span>
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button 
                variant="outline"
                className="rounded-full bg-transparent border border-[#6DFF3B] text-foreground hover:bg-[#6DFF3B] hover:text-[#050505] transition-all px-5 text-sm font-semibold"
              >
                Login / Sign Up
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full">
        <MobileAppBar />

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className={`flex-1 md:pb-0 ${
            hideMobileNav
              ? "pb-[calc(76px+env(safe-area-inset-bottom))]"
              : "pb-[calc(104px+env(safe-area-inset-bottom))]"
          }`}
        >
          <div
            className={
              location.pathname.startsWith("/player-dashboard") || location.pathname.startsWith("/venues")
                ? "w-full"
                : "px-4 py-5 md:px-6 md:py-6 lg:px-8 md:mx-auto md:max-w-7xl"
            }
          >
            <Outlet />
          </div>
        </motion.main>

        {!hideMobileNav && <MobileBottomNav activeTab={mobileTab} />}
      </div>
    </div>
  );
}
