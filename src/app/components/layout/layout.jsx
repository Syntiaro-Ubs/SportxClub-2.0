import { useMemo, useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  MapPin,
  Trophy,
  Users,
  UserCircle,
  User,
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
import { isValidProfileImage } from "../ui/utils";
import { LocationModal } from "../home/LocationModal";

const navigation = [
  // { name: "Player Details", href: "/player-dashboard", icon: Activity },
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
        className="group relative flex items-center gap-1.5 px-3 py-2 rounded-md text-[13px] md:text-[14px] font-medium text-black dark:text-white active:opacity-70 text-left leading-none cursor-pointer transition"
      >
        <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-emerald-600" />
        <span className="truncate max-w-[120px] leading-none text-black dark:text-white">
          {city === "All" ? "All Areas" : city}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-black dark:text-white transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs  transition cursor-pointer ${isSelected
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
  const displayName = currentUser?.fullName || currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : "");

  const [city, setCity] = useState(
    () => localStorage.getItem("preferred-city") || "All Cities",
  );

  useEffect(() => {
    const handleCityChange = (e) => {
      setCity(e.detail || "All Cities");
    };
    window.addEventListener("preferredCityChanged", handleCityChange);
    return () =>
      window.removeEventListener("preferredCityChanged", handleCityChange);
  }, []);

  const handleCitySelect = (selected) => {
    localStorage.setItem("preferred-city", selected);
    setCity(selected);
    window.dispatchEvent(
      new CustomEvent("preferredCityChanged", { detail: selected }),
    );
  };

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

  const isAuthenticated = Boolean(currentUser && (currentUser.id || currentUser.email || currentUser.fullName));

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      {/* Desktop Top Navbar */}
      <header className="hidden md:flex h-14 items-center justify-between border-b border-border/40 bg-background/90 backdrop-blur-xl px-3 md:px-4 lg:px-6 sticky top-0 z-50 w-full">
        <div className="flex items-center gap-3 lg:gap-8 shrink-0">
          <a href="/" className="flex items-center translate-y-[3px] md:translate-y-[5px]">
            <Logo className="h-[46px] md:h-[56px] lg:h-[75px]" />
          </a>
        </div>

        <nav className="flex items-center gap-1 md:gap-2 lg:gap-5 xl:gap-8 mx-2 overflow-hidden">
          {navigation
            .filter((item) => {
              if (
                !isAuthenticated &&
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
                  className={`group relative flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm font-medium transition-colors whitespace-nowrap ${isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
        </nav>

        <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 shrink-0">
          <LocationModal
            activeCity={city}
            onCitySelect={handleCitySelect}
            trigger={
              <button
                className="group relative flex items-center gap-1 px-2 lg:px-2.5 py-1.5 rounded-full text-xs lg:text-[13px] font-medium cursor-pointer !bg-transparent hover:!bg-transparent focus:outline-none focus:ring-0 text-foreground transition-colors shrink-0"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-foreground transition-all duration-300 ease-out group-hover:scale-125 group-hover:-rotate-12 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                <span className="truncate max-w-[70px] md:max-w-[100px] lg:max-w-[140px] leading-normal pb-0.5 text-foreground transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-medium">
                  {city === "All" || city === "All Cities" ? "All Cities" : city}
                </span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-foreground/70 transition-all duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-y-0.5" />
              </button>
            }
          />

          <ThemeToggleButton className="h-8 w-8 bg-transparent hover:bg-transparent border-0 shadow-none text-foreground hover:text-foreground p-0 cursor-pointer flex items-center justify-center focus:ring-0 focus-visible:ring-0 shrink-0" />
          {isAuthenticated ? (
            <Link
              to={currentUser.role === 'owner' ? '/admin-panel' : '/profile'}
              className="shrink-0 transition-transform duration-300 ease-out hover:scale-105 active:scale-95 inline-flex items-center"
            >
              <Button
                variant="ghost"
                className="group relative rounded-md gap-2 text-muted-foreground hover:text-primary hover:bg-transparent dark:hover:!bg-transparent dark:hover:!text-emerald-400 px-2 lg:px-3 h-9 lg:h-10 cursor-pointer focus:ring-0 focus-visible:ring-0 focus-visible:outline-none transition-all duration-300"
              >
                <Avatar className="h-6 w-6 lg:h-6.5 lg:w-6.5 border-0 bg-transparent flex items-center justify-center shrink-0">
                  {isValidProfileImage(currentUser?.profilePicture || currentUser?.avatar) && (
                    <AvatarImage src={currentUser.profilePicture || currentUser.avatar} className="object-cover" />
                  )}
                  <AvatarFallback className="bg-transparent text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors duration-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400">
                    <User className="h-3.5 w-3.5 lg:h-4 lg:w-4 stroke-[2.2]" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs lg:text-sm font-semibold leading-none max-w-[75px] lg:max-w-[130px] truncate transition-colors duration-300 group-hover:text-primary dark:group-hover:text-emerald-400">
                  {displayName}
                </span>
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="shrink-0">
              <Button
                variant="outline"
                className="rounded-full bg-transparent border border-emerald-600 text-foreground hover:bg-transparent hover:text-foreground hover:opacity-80 transition-all px-3 lg:px-5 h-8.5 lg:h-9 text-xs lg:text-sm font-semibold"
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
          className={`flex-1 md:pb-0 ${hideMobileNav
            ? "pb-0"
            : "pb-[calc(104px+env(safe-area-inset-bottom))]"
            }`}
        >
          <div
            className={
              location.pathname.startsWith("/player-dashboard") ||
                location.pathname.startsWith("/venues") ||
                location.pathname.startsWith("/payment") ||
                location.pathname.startsWith("/squad-booking") ||
                location.pathname.startsWith("/booking-success") ||
                location.pathname.startsWith("/profile") ||
                location.pathname.startsWith("/edit-profile")
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
