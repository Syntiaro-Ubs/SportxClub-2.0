import { useState } from "react";
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
} from "lucide-react";
import { Logo } from "../brand/Logo";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Switch } from "../ui/switch";
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
  { name: "Bookings", href: "/owner-dashboard/bookings", icon: CalendarDays },
  { name: "My Turfs", href: "/owner-dashboard/turfs", icon: MapPin },
  { name: "Roles & Permission", href: "/owner-dashboard/staff", icon: User },
  { name: "Events", href: "/owner-dashboard/tournaments", icon: Trophy },
  { name: "Calendar", href: "/owner-dashboard/calendar", icon: Calendar },
  { name: "Reviews", href: "/owner-dashboard/reviews", icon: Star },
  { name: "Promotions", href: "/owner-dashboard/promotions", icon: Tag },
];

export function OwnerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, updateUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTestMode, setIsTestMode] = useState(() => {
    return localStorage.getItem("ownerTestMode") === "true";
  });
  const [isTestAlertOpen, setIsTestAlertOpen] = useState(false);

  const handleTestModeToggle = (checked) => {
    setIsTestMode(checked);
    localStorage.setItem("ownerTestMode", checked ? "true" : "false");
    if (checked) {
      setIsTestAlertOpen(true);
    }
  };

  // Create a local override state for demo purposes (when not logged in)
  const [demoProfile, setDemoProfile] = useState(() => {
    return JSON.parse(localStorage.getItem("mockOwnerProfile")) || null;
  });

  const activeProfile = currentUser || demoProfile || {};

  const ownerName = activeProfile.fullName || "Turf Owner";
  const ownerEmail = activeProfile.email || "owner@sportxclub.com";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex h-[76px] shrink-0 items-center px-6">
        <Link to="/" className="flex items-center translate-y-[5px] md:translate-y-[8px]">
          <Logo />
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 space-y-1">
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
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 mt-auto border-t border-border/40 flex flex-col gap-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground px-3 py-2.5 h-auto rounded-xl"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-background text-foreground overflow-x-hidden w-full max-w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border/40 bg-card/30 md:flex fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 md:pl-64 w-full max-w-full overflow-x-hidden">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/40 bg-background/90 px-4 shadow-sm backdrop-blur-xl sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-muted-foreground md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground capitalize">
                {ownerNavigation.find(
                  (n) =>
                    location.pathname === n.href ||
                    (n.href !== "/owner-dashboard" &&
                      location.pathname.startsWith(n.href)),
                )?.name || "Admin Panel"}
              </h1>
            </div>

            <div className="flex items-center gap-x-3 lg:gap-x-5">
              {/* Test Mode Toggle Switch */}
              <div className="flex items-center gap-2 px-2 transition-colors">
                <span className="text-xs font-bold select-none text-foreground">Test Mode</span>
                <Switch
                  checked={isTestMode}
                  onCheckedChange={handleTestModeToggle}
                  className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 cursor-pointer"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none focus:outline-none flex items-center gap-2 rounded-full p-1 pr-4 pl-1 transition-colors cursor-pointer border-0 bg-transparent">
                  <Avatar className="h-10 w-10 transition-colors">
                    {activeProfile.profilePicture ? (
                      <AvatarImage src={activeProfile.profilePicture} alt={ownerName} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-transparent text-primary flex items-center justify-center font-semibold">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium">
                    {ownerName}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => navigate("/owner-dashboard/profile")} className="cursor-pointer">
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
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
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-8 lg:px-8 w-full max-w-full overflow-x-hidden">
            <Outlet context={{ activeProfile, setDemoProfile, isTestMode, setIsTestMode }} />
          </div>
        </main>
      </div>

      {/* Test Mode Alert Popup Modal */}
      <Dialog open={isTestAlertOpen} onOpenChange={setIsTestAlertOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-destructive/20 bg-card p-6 shadow-2xl backdrop-blur-xl">
          <DialogHeader className="flex flex-col items-center text-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <FlaskConical className="h-6 w-6 text-destructive animate-bounce" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Test Mode Active — Clean Sandbox
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Dashboard metrics & bookings are cleared for test transactions. Toggle Test Mode OFF in top header anytime to return to live data.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="mt-4 sm:justify-center">
            <Button
              variant="destructive"
              onClick={() => setIsTestAlertOpen(false)}
              className="w-full sm:w-auto px-6 font-bold rounded-xl h-10 text-xs shadow-md shadow-destructive/20 cursor-pointer"
            >
              Got it, continue testing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
