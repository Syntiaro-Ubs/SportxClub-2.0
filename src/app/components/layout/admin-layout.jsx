import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, Users, MapPin, CalendarDays, Gamepad2, CreditCard,
  Ticket, Tag, Image as ImageIcon, Star, LifeBuoy, BarChart3, PieChart,
  Bell, Settings, UserCircle, Menu, X, LogOut, ChevronRight
} from "lucide-react";
import { Logo } from "../brand/Logo";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "../../providers/auth-provider";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const adminNavigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Home Management", href: "/admin/home-cms", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Turf Owners", href: "/admin/turf-owners", icon: UserCircle },
  { name: "Turfs", href: "/admin/turfs", icon: MapPin },
  { name: "Bookings", href: "/admin/bookings", icon: CalendarDays },
  { name: "Game Lobbies", href: "/admin/games", icon: Gamepad2 },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Game Passes", href: "/admin/passes", icon: Ticket },
  { name: "Coupons", href: "/admin/coupons", icon: Tag },
  { name: "Banners", href: "/admin/banners", icon: ImageIcon },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  { name: "Analytics", href: "/admin/analytics", icon: PieChart },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Profile", href: "/admin/profile", icon: UserCircle },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentRouteName = adminNavigation.find(
    (n) => location.pathname === n.href || (n.href !== "/admin" && location.pathname.startsWith(n.href))
  )?.name || "Admin Panel";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex h-[76px] shrink-0 items-center px-6">
        <Link to="/" className="flex items-center translate-y-[5px] md:translate-y-[8px]">
          <Logo />
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 space-y-1">
        {adminNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </div>
      <div className="p-4 mt-auto border-t border-border/40">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-border/40 bg-card/30 md:flex fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Header and Main */}
      <div className="flex flex-col flex-1 md:pl-64">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/40 bg-background/90 px-4 shadow-sm backdrop-blur-xl sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" className="-m-2.5 p-2.5 text-muted-foreground md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg capitalize">
                {currentRouteName}
              </h1>
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-background"></span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none focus:outline-none flex items-center gap-2 rounded-full hover:bg-accent/50 p-1 pr-4 pl-1 transition-colors cursor-pointer border-0 bg-transparent">
                  <Avatar className="h-10 w-10 border-2 border-primary/10 transition-colors">
                    <AvatarFallback className="bg-primary/10 text-primary flex items-center justify-center font-semibold">AD</AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block text-sm font-medium">Super Admin</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem onClick={() => navigate("/admin/profile")} className="cursor-pointer">
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
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-background shadow-xl md:hidden"
              >
                <div className="absolute right-4 top-4">
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <SidebarContent />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-8 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
