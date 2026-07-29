import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  Calendar,
  IndianRupee,
  Star,
  Tag,
  Menu,
  X,
  LogOut,
  User,
  Trophy,
  FlaskConical,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { Logo } from "../brand/Logo";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Switch } from "../ui/switch";
import { ThemeToggleButton } from "../ui/theme-toggle-button";
import { useAuth } from "../../providers/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

const ownerNavigation = [
  { name: "Dashboard", href: "/owner-dashboard", icon: LayoutDashboard },
  { name: "Revenue", href: "/owner-dashboard/revenue", icon: IndianRupee },
  { name: "Bookings", href: "/owner-dashboard/bookings", icon: CalendarDays, badge: "18" },
  { name: "My Turfs", href: "/owner-dashboard/turfs", icon: MapPin, badge: "4" },
  { name: "Roles & Permission", href: "/owner-dashboard/staff", icon: User },
  { name: "Events", href: "/owner-dashboard/tournaments", icon: Trophy, badge: "2" },
  { name: "Calendar", href: "/owner-dashboard/calendar", icon: Calendar },
  { name: "Reviews", href: "/owner-dashboard/reviews", icon: Star, badge: "4.8★" },
  { name: "Promotions", href: "/owner-dashboard/promotions", icon: Tag },
];

export function OwnerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, updateUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("ownerSidebarCollapsed") === "true";
  });
  const [isTestMode, setIsTestMode] = useState(() => {
    return localStorage.getItem("ownerTestMode") === "true";
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("ownerSidebarCollapsed", next ? "true" : "false");
      return next;
    });
  };

  // 10-Minute Reminder Toast for active Test Mode
  useEffect(() => {
    if (!isTestMode) return;

    const TEN_MINUTES_MS = 10 * 60 * 1000;
    const intervalId = setInterval(() => {
      toast.warning("⏱️ Session Notice: Test Mode Active", {
        description: "You've been in Sandbox Mode for 10 mins. Switch to Live Mode anytime for real-time venue metrics.",
        duration: 10000,
      });
    }, TEN_MINUTES_MS);

    return () => clearInterval(intervalId);
  }, [isTestMode]);

  const handleTestModeToggle = (checked) => {
    setIsTestMode(checked);
    localStorage.setItem("ownerTestMode", checked ? "true" : "false");
    if (checked) {
      toast.warning("⚡ Sandbox Environment Active", {
        description: "Operating in simulated test mode. Live metrics & transactions remain safely isolated.",
        duration: 5000,
      });
    } else {
      toast.success("🟢 Live Production Mode Active", {
        description: "Restored real-time venue operations, bookings & revenue metrics.",
        duration: 5000,
      });
    }
  };

  // Create a local override state for demo purposes (when not logged in)
  const [demoProfile, setDemoProfile] = useState(() => {
    return JSON.parse(localStorage.getItem("mockOwnerProfile")) || null;
  });

  const activeProfile = currentUser || demoProfile || {};

  const ownerName = activeProfile.fullName || "Ujwal Bramhnote";
  const ownerEmail = activeProfile.email || "owner@sportxclub.com";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-2xl">
      <div className="flex h-[76px] shrink-0 items-center gap-3 px-4 border-b border-border/40">
        <button
          type="button"
          onClick={toggleSidebar}
          title="Collapse Sidebar (Ctrl+\)"
          aria-label="Collapse Sidebar"
          className="hidden md:flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer shrink-0 my-auto"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/" className="flex items-center shrink-0 my-auto">
          <Logo />
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-visible">
        {ownerNavigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/owner-dashboard" &&
              location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/30 shadow-2xs"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground group-hover:text-foreground"}`} />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full transition-all shrink-0 ${isActive
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground group-hover:bg-muted-foreground/20 group-hover:text-foreground"
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-border/40 flex flex-col gap-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 px-3 py-2.5 h-auto rounded-xl transition-colors font-semibold text-sm cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-background text-foreground overflow-x-hidden w-full max-w-full">
      {/* Desktop Sidebar — Completely hides 100% offscreen when collapsed */}
      <aside className={`hidden flex-col border-r border-border/40 bg-card/30 md:flex fixed inset-y-0 z-50 w-64 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area — Expands to 100% full width when sidebar is hidden */}
      <div className={`flex flex-col flex-1 w-full max-w-full overflow-x-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "md:pl-0" : "md:pl-64"}`}>
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/40 bg-background/80 px-4 shadow-xs backdrop-blur-2xl sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-muted-foreground md:hidden hover:text-foreground transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Sidebar Toggle Button in Header — Only shown when sidebar is hidden */}
              {isSidebarCollapsed && (
                <button
                  type="button"
                  onClick={toggleSidebar}
                  title="Expand Sidebar (Ctrl+\)"
                  aria-label="Expand Sidebar"
                  className="hidden md:flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer shrink-0"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground capitalize">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-x-3 sm:gap-x-5">
              {/* Test Mode Toggle Switch */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground select-none">Test Mode</span>
                <Switch
                  checked={isTestMode}
                  onCheckedChange={handleTestModeToggle}
                  className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 cursor-pointer"
                />
              </div>

              {/* Dark / Light Mode Theme Toggle Button */}
              <ThemeToggleButton className="h-8 w-8 bg-transparent hover:bg-transparent border-0 shadow-none text-foreground hover:text-foreground p-0 cursor-pointer flex items-center justify-center focus:ring-0 focus-visible:ring-0" />

              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none focus:outline-none flex items-center gap-2.5 rounded-full p-1 pr-3 transition-all cursor-pointer">
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      {activeProfile.profilePicture ? (
                        <AvatarImage src={activeProfile.profilePicture} alt={ownerName} className="object-cover" />
                      ) : (
                        <AvatarFallback className="text-foreground">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      )}
                    </Avatar>

                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold leading-none text-foreground">{ownerName}</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 rounded-2xl border-border/60 p-1.5 shadow-xl" align="end" forceMount>
                  <DropdownMenuLabel className="px-3 py-2">
                    <p className="text-xs font-bold text-foreground">{ownerName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{ownerEmail}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/owner-dashboard/profile")} className="cursor-pointer rounded-xl text-xs font-medium py-2">
                    <User className="mr-2 h-4 w-4 text-emerald-500" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-xl text-xs font-medium py-2 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background shadow-xl md:hidden"
              >
                <div className="absolute right-4 top-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-4 pt-1 pb-6 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">
            <Outlet context={{ activeProfile, setDemoProfile, isTestMode, setIsTestMode }} />
          </div>
        </main>
      </div>
    </div>
  );
}
