import { useState, useEffect, useMemo } from "react";
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
  Users,
  Trophy,
  FlaskConical,
  PanelLeft,
  PanelLeftClose,
  FileText,
  Settings,
  ArrowLeft,
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
  { name: "Dashboard", href: "/admin-panel", icon: LayoutDashboard, permissionKey: "dashboard" },
  { name: "Revenue", href: "/admin-panel/revenue", icon: IndianRupee, permissionKey: "revenue" },
  { name: "Bookings", href: "/admin-panel/bookings", icon: CalendarDays, badge: "18", permissionKey: "bookings" },
  { name: "My Turfs", href: "/admin-panel/turfs", icon: MapPin, badge: "4", permissionKey: "turfs" },
  { name: "Roles", href: "/admin-panel/staff", icon: Users, permissionKey: "roles" },
  { name: "Events", href: "/admin-panel/tournaments", icon: Trophy, badge: "2", permissionKey: "events" },
  { name: "Reviews", href: "/admin-panel/reviews", icon: Star, badge: "4.8★", permissionKey: "reviews" },
  { name: "Promotions", href: "/admin-panel/promotions", icon: Tag, permissionKey: "promotions" },
  { name: "Report", href: "/admin-panel/report", icon: FileText, permissionKey: "report" },
  { name: "Settings", href: "/admin-panel/settings", icon: Settings, permissionKey: "settings" },
];

function TwoLineMenuIcon({ className, ...props }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <line x1="3" y1="8" x2="21" y2="8" />
      <line x1="3" y1="16" x2="15" y2="16" />
    </svg>
  );
}

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

  const handleTestModeToggle = (checked) => {
    setIsTestMode(checked);
    localStorage.setItem("ownerTestMode", checked ? "true" : "false");
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

  const visibleNavigation = useMemo(() => {
    // If Super Admin/Owner or no restricted permissions array, show all 11 pages
    if (!activeProfile || activeProfile.role === "owner" || !activeProfile.permissions) {
      return ownerNavigation;
    }
    return ownerNavigation.filter((item) => activeProfile.permissions.includes(item.permissionKey));
  }, [activeProfile]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-2xl">
      <div className="flex h-14 shrink-0 items-center gap-3 px-4 border-b border-border/40">
        <button
          type="button"
          onClick={toggleSidebar}
          title="Collapse Sidebar (Ctrl+\)"
          aria-label="Collapse Sidebar"
          className="hidden md:flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent transition-all duration-200 cursor-pointer shrink-0 my-auto group"
        >
          <TwoLineMenuIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
        </button>
        <a href="/admin-panel" className="flex items-center shrink-0 translate-y-[6px]">
          <Logo className="h-[50px] md:h-[80px]" />
        </a>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-3 pt-0 pb-4 scrollbar-visible">
        {visibleNavigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/admin-panel" &&
              location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`group flex items-center justify-between w-full py-1.5 px-3 border-b border-border/40 transition-colors duration-150 hover:bg-muted/30 ${isActive
                ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
                : "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 shrink-0 transition-colors duration-150 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400"}`} />
                <span className="text-sm tracking-wide transition-colors duration-150 truncate">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-border/40">
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
      <aside className={`hidden flex-col border-r border-border/40 bg-card/30 md:flex fixed inset-y-0 z-50 w-56 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area — Expands to 100% full width when sidebar is hidden */}
      <div className={`flex flex-col flex-1 w-full max-w-full overflow-x-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? "md:pl-0" : "md:pl-56"}`}>
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-x-4 border-b border-border/40 bg-background/80 dark:bg-black/80 px-4 shadow-xs backdrop-blur-2xl sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              className="-m-1.5 p-1.5 text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 group"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <TwoLineMenuIcon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
            </button>
            <a href="/admin-panel" className="flex items-center shrink-0 translate-y-[6px]">
              <Logo className="h-[50px] md:h-[80px]" />
            </a>
          </div>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Sidebar Toggle Button & Logo when sidebar navigation is hidden */}
              {isSidebarCollapsed && (
                <div className="hidden md:flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    title="Expand Sidebar (Ctrl+\)"
                    aria-label="Expand Sidebar"
                    className="flex items-center justify-center p-2 rounded-full text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent transition-all duration-200 cursor-pointer shrink-0 group"
                  >
                    <TwoLineMenuIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  </button>
                  <a href="/admin-panel" className="flex items-center shrink-0 translate-y-[6px]">
                    <Logo className="h-[50px] md:h-[80px]" />
                  </a>
                </div>
              )}
              {/* Always show back button in main header on non-dashboard pages (desktop) */}
              {location.pathname !== "/admin-panel" && (
                <button
                  onClick={() => navigate(-1)}
                  className="hidden md:flex items-center justify-center p-1.5 sm:p-2 rounded-full text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent transition-all duration-200 cursor-pointer shrink-0 group"
                  title="Go Back"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:scale-110" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-x-3 sm:gap-x-5">
              {/* Test Mode Toggle Switch */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground select-none">Test Mode</span>
                <Switch
                  checked={isTestMode}
                  onCheckedChange={handleTestModeToggle}
                  className="data-[state=checked]:bg-red-400 data-[state=checked]:border-red-400 cursor-pointer scale-[0.8]"
                />
              </div>

              {/* Dark / Light Mode Theme Toggle Button */}
              <ThemeToggleButton className="h-8 w-8 !bg-transparent hover:!bg-transparent border-0 shadow-none text-foreground hover:text-foreground p-0 cursor-pointer flex items-center justify-center focus:ring-0 focus-visible:ring-0" />

              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none focus:outline-none flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 p-1 transition-all duration-200 cursor-pointer group">
                  <div className="relative">
                    <Avatar className="h-6 w-6 sm:h-9 sm:w-9 border-0 bg-transparent flex items-center justify-center">
                      {activeProfile.profilePicture ? (
                        <AvatarImage src={activeProfile.profilePicture} alt={ownerName} className="object-cover" />
                      ) : (
                        <AvatarFallback className="bg-transparent text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <User className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2.2]" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <span className="text-[10px] sm:text-sm font-semibold leading-tight text-foreground whitespace-nowrap">{ownerName}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 !rounded-none border-border/60 p-1.5 shadow-xl" align="end" forceMount>
                  <DropdownMenuLabel className="px-3 py-2">
                    <p className="text-xs font-bold text-foreground">{ownerName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{ownerEmail}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/admin-panel/profile")} className="cursor-pointer !rounded-none text-xs font-medium py-2 focus:text-emerald-600 dark:focus:text-emerald-400 focus:bg-emerald-500/10">
                    <User className="mr-2 h-4 w-4 text-emerald-500" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer !rounded-none text-xs font-medium py-2 text-rose-500 focus:text-rose-500 focus:bg-rose-500/10">
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
                className="fixed inset-y-0 left-0 z-50 w-full max-w-[190px] bg-background shadow-xl md:hidden"
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
          <div className="mx-auto max-w-[1440px] px-4 pt-1 pb-6 sm:px-6 lg:px-8 w-full overflow-x-hidden">
            <Outlet context={{ activeProfile, setDemoProfile, isTestMode, setIsTestMode }} />
          </div>
        </main>
      </div>
    </div>
  );
}
