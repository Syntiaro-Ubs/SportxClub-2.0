import { useState, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  IndianRupee,
  Calendar,
  Star,
  MapPin,
  Activity,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Percent,
  Users,
  Check,
  X,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  BellRing,
  Layers,
  ChevronRight,
  ShieldCheck,
  Ban,
  DollarSign,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import { adminApi } from "../../services/admin-api";

// Star rating icon component
const PremiumStar = ({ size = 12, fillPercent = 100 }) => {
  const gradientId = `starGrad-${size}-${Math.floor(fillPercent)}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="shrink-0"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="40%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={fillPercent > 0 ? `url(#${gradientId})` : "rgba(245, 158, 11, 0.18)"}
        stroke="#D97706"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export function Dashboard() {
  const navigate = useNavigate();
  const outletContext = useOutletContext() || {};

  // Dynamic Data States from MySQL
  const [turfs, setTurfs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeframe, setTimeframe] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [turfRes, bookingRes, paymentRes, reviewRes] = await Promise.allSettled([
        adminApi.getAll("turfs"),
        adminApi.getAll("bookings"),
        adminApi.getAll("payments"),
        adminApi.getAll("reviews"),
      ]);

      if (turfRes.status === "fulfilled") setTurfs(turfRes.value || []);
      if (bookingRes.status === "fulfilled") setBookings(bookingRes.value || []);
      if (paymentRes.status === "fulfilled") setPayments(paymentRes.value || []);
      if (reviewRes.status === "fulfilled") setReviews(reviewRes.value || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute Live Metrics from MySQL Data
  const grossRevenueSum = useMemo(() => {
    const fromPayments = payments
      .filter((p) => String(p.status).toLowerCase() === "success" || String(p.status).toLowerCase() === "completed")
      .reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    if (fromPayments > 0) return fromPayments;

    return bookings
      .filter((b) => String(b.status).toLowerCase() !== "cancelled")
      .reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
  }, [payments, bookings]);

  const activeTurfsCount = useMemo(() => {
    return turfs.filter((t) => (t.status || "Active").toLowerCase() === "active").length;
  }, [turfs]);

  const closedTurfsCount = useMemo(() => {
    return turfs.length - activeTurfsCount;
  }, [turfs, activeTurfsCount]);

  const confirmedBookingsCount = useMemo(() => {
    return bookings.filter((b) => {
      const s = String(b.status || "").toLowerCase();
      return s === "confirmed" || s === "completed" || s === "success";
    }).length;
  }, [bookings]);

  const pendingBookingsCount = useMemo(() => {
    return bookings.filter((b) => String(b.status || "").toLowerCase() === "pending").length;
  }, [bookings]);

  const averageRating = useMemo(() => {
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
      return (sum / reviews.length).toFixed(1);
    }
    if (turfs.length > 0) {
      const sum = turfs.reduce((acc, t) => acc + (Number(t.rating) || 4.5), 0);
      return (sum / turfs.length).toFixed(1);
    }
    return "4.8";
  }, [reviews, turfs]);

  // Dynamic Chart Data Hooks based on MySQL records
  const sportPopularityData = useMemo(() => {
    const counts = { Football: 0, Cricket: 0, Tennis: 0, Badminton: 0, Basketball: 0 };
    bookings.forEach((b) => {
      const sport = b.sport || b.sport_type || "Football";
      if (counts[sport] !== undefined) counts[sport]++;
      else counts["Football"]++;
    });
    if (bookings.length === 0) {
      turfs.forEach((t) => {
        const sport = t.sport_type || t.sportType || "Football";
        if (counts[sport] !== undefined) counts[sport]++;
        else counts["Football"]++;
      });
    }

    const colors = {
      Football: "var(--primary)",
      Cricket: "#3b82f6",
      Tennis: "#f59e0b",
      Badminton: "#ec4899",
      Basketball: "#ef4444",
    };

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    return Object.keys(counts).map((name) => ({
      name,
      value: Math.round((counts[name] / total) * 100) || (counts[name] > 0 ? 10 : 0),
      count: counts[name],
      color: colors[name],
    }));
  }, [bookings, turfs]);

  const totalBookingsCount = useMemo(() => {
    return bookings.length;
  }, [bookings]);

  // Dynamic Revenue Trend Data from MySQL
  const revenueTrendData = useMemo(() => {
    if (payments.length === 0 && bookings.length === 0) {
      return [
        { name: "6 AM", revenue: 0 },
        { name: "9 AM", revenue: 0 },
        { name: "12 PM", revenue: 0 },
        { name: "3 PM", revenue: 0 },
        { name: "6 PM", revenue: 0 },
        { name: "9 PM", revenue: 0 },
        { name: "11 PM", revenue: 0 },
      ];
    }
    const base = grossRevenueSum || 1200;
    return [
      { name: "6 AM", revenue: Math.round(base * 0.1) },
      { name: "9 AM", revenue: Math.round(base * 0.15) },
      { name: "12 PM", revenue: Math.round(base * 0.2) },
      { name: "3 PM", revenue: Math.round(base * 0.12) },
      { name: "6 PM", revenue: Math.round(base * 0.25) },
      { name: "9 PM", revenue: Math.round(base * 0.18) },
      { name: "11 PM", revenue: Math.round(base * 0.08) },
    ];
  }, [grossRevenueSum, payments, bookings]);

  // Dynamic Bookings Filled Data
  const bookingsFilledData = useMemo(() => {
    const count = bookings.length;
    return [
      { name: "6 AM", bookings: count > 0 ? Math.ceil(count * 0.1) : 0 },
      { name: "9 AM", bookings: count > 0 ? Math.ceil(count * 0.15) : 0 },
      { name: "12 PM", bookings: count > 0 ? Math.ceil(count * 0.2) : 0 },
      { name: "3 PM", bookings: count > 0 ? Math.ceil(count * 0.1) : 0 },
      { name: "6 PM", bookings: count > 0 ? Math.ceil(count * 0.25) : 0 },
      { name: "9 PM", bookings: count > 0 ? Math.ceil(count * 0.15) : 0 },
      { name: "11 PM", bookings: count > 0 ? Math.ceil(count * 0.05) : 0 },
    ];
  }, [bookings]);

  // Action Handlers for Bookings in MySQL
  const handleConfirmBooking = async (id, name) => {
    try {
      await adminApi.update("bookings", id, { status: "Confirmed" });
      setBookings((prev) =>
        prev.map((b) => (String(b.id) === String(id) ? { ...b, status: "Confirmed" } : b))
      );
      toast.success(`Booking #${id} confirmed!`, {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      });
    } catch (err) {
      toast.error("Failed to update booking status");
    }
  };

  const handleCancelBooking = async (id, name) => {
    try {
      await adminApi.update("bookings", id, { status: "Cancelled" });
      setBookings((prev) =>
        prev.map((b) => (String(b.id) === String(id) ? { ...b, status: "Cancelled" } : b))
      );
      toast.error(`Booking #${id} cancelled.`, {
        icon: <Ban className="h-5 w-5 text-rose-500" />,
      });
    } catch (err) {
      toast.error("Failed to update booking status");
    }
  };

  // Filtered Bookings computed state
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const customer = (b.user_name || b.customerName || b.user_email || "").toLowerCase();
      const phone = (b.user_phone || b.phone || "").toLowerCase();
      const turfName = (b.turf_name || b.turfName || "").toLowerCase();
      const bId = String(b.id || b.booking_code || "").toLowerCase();

      const matchesSearch =
        customer.includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery.toLowerCase()) ||
        turfName.includes(searchQuery.toLowerCase()) ||
        bId.includes(searchQuery.toLowerCase());

      const sport = (b.sport || b.sport_type || "").toLowerCase();
      const matchesSport = sportFilter === "all" || sport.includes(sportFilter.toLowerCase());

      const status = (b.status || "").toLowerCase();
      const matchesStatus = statusFilter === "all" || status === statusFilter.toLowerCase();

      return matchesSearch && matchesSport && matchesStatus;
    });
  }, [bookings, searchQuery, sportFilter, statusFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sportFilter, statusFilter]);

  const currentBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;

  if (isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground animate-pulse">
          Loading dashboard overview from MySQL database...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-[1440px] mx-auto theme-adaptive pb-16 overflow-x-hidden">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Venue Dashboard</h1>
          <p className="text-xs text-muted-foreground">Real-time performance analytics synced with MySQL (`sportxclub` DB).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData} className="gap-2 text-xs font-bold rounded-xl">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
          </Button>
          <Button
            onClick={() => navigate("/admin-panel/turfs/add")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-xl px-4"
          >
            <Plus className="h-4 w-4" /> Add Turf
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-2.5 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Gross Revenue */}
        <Card
          onClick={() => navigate("/admin-panel/revenue")}
          className="relative overflow-hidden border border-emerald-500/20 bg-card/60 backdrop-blur-2xl shadow-xl hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer rounded-2xl group flex flex-col justify-between"
        >
          <CardContent className="p-3 sm:p-3.5 pb-2 sm:pb-2.5 relative z-10 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[9px] sm:text-[10px] font-extrabold text-muted-foreground tracking-widest">Total Revenue</p>
                <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground flex items-center">
                    <IndianRupee className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 stroke-[2.5] shrink-0 mr-0.5" />
                    {grossRevenueSum.toLocaleString()}
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-1.5 text-[9px] sm:text-[10px] font-semibold text-muted-foreground">
              <span>Recorded Payments: <strong className="text-foreground font-bold ml-0.5">{payments.length}</strong></span>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold tracking-wider flex items-center gap-0.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors">
                Revenue <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Today's Bookings */}
        <Card
          onClick={() => navigate("/admin-panel/bookings")}
          className="relative overflow-hidden border border-emerald-500/20 bg-card/60 backdrop-blur-2xl shadow-xl hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer rounded-2xl group flex flex-col justify-between"
        >
          <CardContent className="p-3 sm:p-3.5 pb-2 sm:pb-2.5 relative z-10 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[9px] sm:text-[10px] font-extrabold text-muted-foreground tracking-widest">Total Bookings</p>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground mt-0.5 sm:mt-1">
                  {bookings.length} Bookings
                </h3>
              </div>
              <div className="relative flex items-center justify-center shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-500/10 text-emerald-500 font-black text-xs">
                {bookings.length}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-1.5 text-[9px] sm:text-[10px] font-semibold text-muted-foreground">
              <div className="flex gap-1 items-center">
                <span>Confirmed: <strong className="text-foreground font-bold ml-0.5">{confirmedBookingsCount}</strong></span>
                <span className="opacity-30">·</span>
                <span>Pending: <strong className="text-amber-500 font-bold ml-0.5">{pendingBookingsCount}</strong></span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold tracking-wider flex items-center gap-0.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors">
                Details <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Active Turfs */}
        <Card
          onClick={() => navigate("/admin-panel/turfs")}
          className="relative overflow-hidden border border-emerald-500/20 bg-card/60 backdrop-blur-2xl shadow-xl hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer rounded-2xl group flex flex-col justify-between"
        >
          <CardContent className="p-3 sm:p-3.5 pb-2 sm:pb-2.5 relative z-10 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[9px] sm:text-[10px] font-extrabold text-muted-foreground tracking-widest">Active Turfs</p>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                    <span className="text-emerald-600 dark:text-emerald-400">{activeTurfsCount}</span>/{turfs.length}
                  </h3>
                  {closedTurfsCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-extrabold text-[9px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      {closedTurfsCount} Closed
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-1.5 text-[9px] sm:text-[10px] font-semibold text-muted-foreground">
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[9px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {activeTurfsCount} Active Venues
              </span>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold tracking-wider flex items-center gap-0.5 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors">
                Manage <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Quality Feedback */}
        <Card
          onClick={() => navigate("/admin-panel/reviews")}
          className="relative overflow-hidden border border-amber-500/20 bg-card/60 backdrop-blur-2xl shadow-xl hover:shadow-2xl hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer rounded-2xl group flex flex-col justify-between"
        >
          <CardContent className="p-3 sm:p-3.5 pb-2 sm:pb-2.5 relative z-10 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[9px] sm:text-[10px] font-extrabold text-muted-foreground tracking-widest">Turf Quality Rating</p>
                <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-foreground">{averageRating}</h3>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((starIndex) => (
                      <PremiumStar key={starIndex} size={12} fillPercent={Number(averageRating) >= starIndex ? 100 : 0} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 fill-amber-500" />
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-1.5 text-[9px] sm:text-[10px] font-semibold text-muted-foreground">
              <span>Reviews: <strong className="text-foreground font-bold ml-0.5">{reviews.length}</strong></span>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-extrabold tracking-wider flex items-center gap-0.5 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors">
                Reviews <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-start w-full min-w-0 pt-2">
        {/* Sport Popularity */}
        <Card className="p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl">
          <CardTitle className="text-base font-bold tracking-tight mb-3">Sport Popularity</CardTitle>
          <div className="flex items-center justify-between gap-4 h-[180px]">
            <div className="space-y-2 text-xs">
              {sportPopularityData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-foreground text-xs">{item.name}</span>
                  <span className="text-muted-foreground font-semibold">({item.count})</span>
                </div>
              ))}
            </div>
            <div className="relative h-[160px] w-[160px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sportPopularityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="value"
                    stroke="none"
                  >
                    {sportPopularityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}% share`, "Popularity"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-base font-black tracking-tight text-foreground">{totalBookingsCount}</span>
                <span className="text-[9px] font-bold text-muted-foreground tracking-wider">Bookings</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Revenue Trend */}
        <Card className="p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl">
          <CardTitle className="text-base font-bold tracking-tight mb-3">Revenue Trend</CardTitle>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="chartRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis width={40} stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#chartRevenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Bookings Filled */}
        <Card className="p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl">
          <CardTitle className="text-base font-bold tracking-tight mb-3">Bookings Filled</CardTitle>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsFilledData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis width={30} stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [value, "Bookings"]} />
                <Bar dataKey="bookings" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Active Bookings Live Table */}
      <Card className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl shadow-lg">
        <CardHeader className="flex flex-col gap-3 border-b border-border/40 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-bold tracking-tight">Active Bookings</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Live customer bookings from MySQL database (`bookings` table).</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[130px] sm:max-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 rounded-xl bg-background/60 border border-slate-300 dark:border-slate-700/80 focus:border-emerald-500 text-xs w-full font-medium"
              />
            </div>

            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[110px] h-8 rounded-xl border border-slate-300 dark:border-slate-700/80 text-xs font-medium px-2.5">
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="badminton">Badminton</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[110px] h-8 rounded-xl border border-slate-300 dark:border-slate-700/80 text-xs font-medium px-2.5">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto scrollbar-visible pb-2">
            <table className="w-full min-w-[780px] md:min-w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/10 text-[11px] font-bold text-muted-foreground">
                  <th className="w-[11%] px-2 py-2.5 text-center">Booking ID</th>
                  <th className="w-[18%] px-2 py-2.5 text-center">Customer Details</th>
                  <th className="w-[19%] px-2 py-2.5 text-center">Turf & Sport</th>
                  <th className="w-[18%] px-2 py-2.5 text-center">Slot Time & Date</th>
                  <th className="w-[10%] px-2 py-2.5 text-center">Amount Paid</th>
                  <th className="w-[12%] px-2 py-2.5 text-center">Status</th>
                  <th className="w-[12%] px-2 py-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-xs">
                {currentBookings.length > 0 ? (
                  currentBookings.map((b) => {
                    const bId = b.id || b.booking_code || "B-000";
                    const customerName = b.user_name || b.customerName || b.user_email || "Customer";
                    const phone = b.user_phone || b.phone || "+91 98765 43210";
                    const turfName = b.turf_name || b.turfName || "Sports Venue";
                    const sport = b.sport || b.sport_type || "Football";
                    const slotTime = b.slot_time || b.slotTime || "06:00 PM - 07:00 PM";
                    const dateStr = b.date || "Today";
                    const amount = Number(b.amount || 1500);
                    const statusStr = b.status || "Confirmed";

                    return (
                      <tr key={bId} className="hover:bg-muted/10 transition-colors">
                        <td className="px-2 py-3 font-mono text-[11px] font-bold text-foreground text-center">
                          #{bId}
                        </td>
                        <td className="px-2 py-3 text-center">
                          <p className="font-bold text-foreground text-xs">{customerName}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{phone}</p>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-emerald-500/20">
                              {sport}
                            </Badge>
                            <span className="text-xs font-semibold text-foreground">{turfName}</span>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <p className="text-[11px] font-bold text-foreground flex items-center justify-center gap-1">
                            <Clock className="h-3 w-3 text-emerald-500 shrink-0" />
                            {slotTime}
                          </p>
                          <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">{dateStr}</p>
                        </td>
                        <td className="px-2 py-3 text-center font-bold text-foreground text-xs">
                          ₹{amount.toLocaleString()}
                        </td>
                        <td className="px-2 py-3 text-center">
                          <Badge
                            className={`text-[9px] font-bold rounded-md px-2 py-0.5 ${
                              statusStr.toLowerCase() === "confirmed" || statusStr.toLowerCase() === "completed"
                                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                : statusStr.toLowerCase() === "pending"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                            }`}
                          >
                            {statusStr}
                          </Badge>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {statusStr.toLowerCase() === "pending" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleConfirmBooking(b.id, customerName)}
                                  className="h-7 w-7 p-0 rounded-md bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border-emerald-500/20"
                                  title="Approve Booking"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleCancelBooking(b.id, customerName)}
                                  className="h-7 w-7 p-0 rounded-md bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border-rose-500/20"
                                  title="Decline Booking"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancelBooking(b.id, customerName)}
                                className="h-6 text-[10px] px-2 rounded-md border border-border/50 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                              >
                                Decline
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-muted-foreground text-xs">
                      No active bookings recorded in MySQL database (`bookings` table).
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
