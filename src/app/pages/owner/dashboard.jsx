import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
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
  LineChart,
  Line,
} from "recharts";
import { analyticsService } from "../../services/analytics.service";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";

// TODO: Replace with actual auth context ownerId
const OWNER_ID = "owner-123";

// -------------------------------------------------------------
// High-Fidelity Mock Data for Preview / Demo Mode
// -------------------------------------------------------------

const mockRevenueSparkline = [
  { value: 12000 }, { value: 16000 }, { value: 14000 },
  { value: 24000 }, { value: 19000 }, { value: 26000 }, { value: 32000 }
];

const mockHistogramOccupancy = [
  { time: 'M', value: 35 },
  { time: 'A', value: 50 },
  { time: 'E', value: 95 },
  { time: 'N', value: 60 },
];

const mockRevenueChart = [
  { name: 'Mon', revenue: 24000, bookings: 12 },
  { name: 'Tue', revenue: 18000, bookings: 9 },
  { name: 'Wed', revenue: 32000, bookings: 16 },
  { name: 'Thu', revenue: 15000, bookings: 8 },
  { name: 'Fri', revenue: 42000, bookings: 21 },
  { name: 'Sat', revenue: 58000, bookings: 29 },
  { name: 'Sun', revenue: 49000, bookings: 24 },
];

const mockSportsPie = [
  { name: 'Football', value: 45, color: 'var(--primary)', count: 54 },
  { name: 'Cricket', value: 30, color: '#3b82f6', count: 36 },
  { name: 'Tennis', value: 12, color: '#f59e0b', count: 14 },
  { name: 'Badminton', value: 8, color: '#ec4899', count: 10 },
  { name: 'Basketball', value: 5, color: '#ef4444', count: 6 },
];

const mockHourlyOccupancy = [
  { hour: '06:00 AM', rate: 25 },
  { hour: '08:00 AM', rate: 45 },
  { hour: '10:00 AM', rate: 30 },
  { hour: '12:00 PM', rate: 15 },
  { hour: '02:00 PM', rate: 20 },
  { hour: '04:00 PM', rate: 60 },
  { hour: '06:00 PM', rate: 95 },
  { hour: '08:00 PM', rate: 85 },
  { hour: '10:00 PM', rate: 50 },
];

const initialBookingsList = [
  {
    id: "B-8930",
    customerName: "Rahul Sharma",
    phone: "+91 98765 43210",
    turfName: "Main Arena A",
    sport: "Football",
    slotTime: "06:00 PM - 07:00 PM",
    date: "Today",
    amount: 1500,
    status: "Confirmed",
    paymentType: "Online",
    timeAgo: "5 mins ago",
  },
  {
    id: "B-8929",
    customerName: "Amit Patel",
    phone: "+91 91234 56789",
    turfName: "Indoor Turf B",
    sport: "Cricket",
    slotTime: "08:00 PM - 10:00 PM",
    date: "Today",
    amount: 3000,
    status: "Pending",
    paymentType: "Online",
    timeAgo: "15 mins ago",
  },
  {
    id: "B-8928",
    customerName: "Siddharth Sen",
    phone: "+91 99887 76655",
    turfName: "Court 1 (Clay)",
    sport: "Tennis",
    slotTime: "04:00 PM - 05:00 PM",
    date: "Today",
    amount: 1200,
    status: "Confirmed",
    paymentType: "Walk-in",
    timeAgo: "1 hour ago",
  },
  {
    id: "B-8927",
    customerName: "Priyanka Nair",
    phone: "+91 95432 10987",
    turfName: "Multipurpose Hall",
    sport: "Basketball",
    slotTime: "07:00 PM - 08:00 PM",
    date: "Today",
    amount: 1800,
    status: "Cancelled",
    paymentType: "Online",
    timeAgo: "2 hours ago",
  },
  {
    id: "B-8926",
    customerName: "Vikram Rathore",
    phone: "+91 98123 45670",
    turfName: "Main Arena A",
    sport: "Football",
    slotTime: "09:00 PM - 10:00 PM",
    date: "Today",
    amount: 1500,
    status: "Confirmed",
    paymentType: "Online",
    timeAgo: "3 hours ago",
  },
  {
    id: "B-8925",
    customerName: "Rohan Das",
    phone: "+91 92345 67890",
    turfName: "Badminton Court 1",
    sport: "Badminton",
    slotTime: "05:00 PM - 06:00 PM",
    date: "Tomorrow",
    amount: 800,
    status: "Confirmed",
    paymentType: "Walk-in",
    timeAgo: "4 hours ago",
  },
  {
    id: "B-8924",
    customerName: "Kunal Verma",
    phone: "+91 93456 78901",
    turfName: "Indoor Turf B",
    sport: "Cricket",
    slotTime: "06:00 AM - 08:00 AM",
    date: "Tomorrow",
    amount: 2800,
    status: "Pending",
    paymentType: "Online",
    timeAgo: "5 hours ago",
  },
];

const fallbackData = {
  stats: {
    totalTurfs: 5,
    activeTurfs: 4,
    monthlyRevenue: 184200,
    pendingPayments: 14500,
    todaysBookings: 18,
    upcomingBookings: 32,
    reviewsCount: 128,
    averageRating: 4.8,
    occupancyRate: 78,
  },
  recentActivity: {
    bookings: [
      { title: "New Football Booking", description: "Rahul Sharma booked Main Arena A for Today", time: "5 mins ago" },
      { title: "Payment Received", description: "Amit Patel paid ₹3,000 for Indoor Turf B", time: "15 mins ago" },
      { title: "Review Added", description: "Siddharth Sen rated 5 stars: 'Best turf in town!'", time: "1 hour ago" },
      { title: "Booking Cancelled", description: "Priyanka Nair cancelled slot for Basketball", time: "2 hours ago" },
    ]
  }
};

export function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Interactive bookings state
  const [bookings, setBookings] = useState(initialBookingsList);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [sportFilter, setSportFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isBlockSlotOpen, setIsBlockSlotOpen] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  // Modal Form Inputs
  const [blockTurf, setBlockTurf] = useState("");
  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [broadcastText, setBroadcastText] = useState("");

  const fetchDashboardData = async (showRetrying = false) => {
    if (showRetrying) setIsRetrying(true);
    else setIsLoading(true);

    try {
      const result = await analyticsService.getAll(OWNER_ID, {
        type: "dashboard_overview",
      });
      setData(result);
      setIsDemoMode(false);
      toast.success("Connected to Live API!");
    } catch (err) {
      console.warn("Backend API not found. Falling back to Demo Mode.");
      setData(fallbackData);
      setIsDemoMode(true);
      if (showRetrying) {
        toast.error("API offline. Remaining in Demo Mode.");
      }
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRetryFetch = () => {
    fetchDashboardData(true);
  };

  const toggleManualMode = (mode) => {
    if (mode === "demo") {
      setData(fallbackData);
      setIsDemoMode(true);
      toast.info("Switched to Demo Mode (Mock data)");
    } else {
      fetchDashboardData(true);
    }
  };

  // Booking action handlers
  const handleConfirmBooking = (id, name) => {
    setBookings(prev =>
      prev.map(b => b.id === id ? { ...b, status: "Confirmed" } : b)
    );
    toast.success(`Booking ${id} for ${name} confirmed!`, {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
    });
  };

  const handleCancelBooking = (id, name) => {
    setBookings(prev =>
      prev.map(b => b.id === id ? { ...b, status: "Cancelled" } : b)
    );
    toast.error(`Booking ${id} for ${name} cancelled.`, {
      icon: <Ban className="h-5 w-5 text-rose-500" />
    });
  };

  // Modal actions submit handlers
  const submitBlockSlot = (e) => {
    e.preventDefault();
    if (!blockTurf || !blockDate || !blockTime) {
      toast.error("Please fill in all fields to block slot.");
      return;
    }
    toast.success(`Slot blocked on ${blockTurf} for ${blockDate} at ${blockTime}!`);
    setIsBlockSlotOpen(false);
    // Reset fields
    setBlockTurf("");
    setBlockDate("");
    setBlockTime("");
  };

  const submitPromoCode = (e) => {
    e.preventDefault();
    if (!promoCode || !promoDiscount) {
      toast.error("Please provide both code and discount percent.");
      return;
    }
    toast.success(`Discount code "${promoCode.toUpperCase()}" (${promoDiscount}% Off) created!`);
    setIsPromoOpen(false);
    setPromoCode("");
    setPromoDiscount("");
  };

  const submitBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastText) {
      toast.error("Cannot send an empty broadcast.");
      return;
    }
    toast.success(`Announcement broadcasted to 18 active booked users!`);
    setIsBroadcastOpen(false);
    setBroadcastText("");
  };

  // Filtered Bookings computed state
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch =
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.turfName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSport = sportFilter === "all" || b.sport.toLowerCase() === sportFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || b.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesSport && matchesStatus;
    });
  }, [bookings, searchQuery, sportFilter, statusFilter]);

  // Bookings Radial Circle progress calculations
  const totalSlotsCount = 24;
  const bookedSlotsCount = 18;
  const progressPercentage = (bookedSlotsCount / totalSlotsCount) * 100;
  const ringRadius = 22;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashoffset = ringCircumference - (progressPercentage / 100) * ringCircumference;

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto theme-adaptive pb-16 overflow-x-hidden">

      {/* Hidden Global SVG definitions for linear gradients */}
      <svg width="0" height="0" className="absolute z-[-1] pointer-events-none">
        <defs>
          <linearGradient id="blueProgressRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <linearGradient id="revenueSparklineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.0} />
          </linearGradient>
        </defs>
      </svg>

      {/* -------------------------------------------------------------
          Header Bar with mode toggles and date selector
          ------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
              Owner Dashboard
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="w-fit text-xs font-mono px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 shadow-sm">
                ID: {OWNER_ID}
              </Badge>
              {isDemoMode ? (
                <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs gap-1.5 flex items-center shadow-inner">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Demo Mode
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs gap-1.5 flex items-center shadow-inner">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground mt-1">
            Analyze occupancy, manage bookings, and increase your club revenue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Selector Toggle */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-full border border-border/50 backdrop-blur-md">
            <button
              onClick={() => toggleManualMode("live")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${!isDemoMode
                ? "bg-white dark:bg-slate-900 text-foreground border border-border/10 shadow-xs hover:bg-[#6DFF3B] hover:text-black hover:border-[#6DFF3B]"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Live API
            </button>
            <button
              onClick={() => toggleManualMode("demo")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isDemoMode
                ? "bg-white dark:bg-slate-900 text-foreground border border-border/10 shadow-xs hover:bg-[#6DFF3B] hover:text-black hover:border-[#6DFF3B]"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Demo Mode
            </button>
          </div>

          <Button variant="outline" className="gap-2 backdrop-blur-md bg-card/40 border border-border/50 hover:bg-muted/50 transition-all rounded-xl h-10 text-xs">
            <Calendar className="h-4 w-4 text-primary" />
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Demo Mode Offline Warning Banner
          ------------------------------------------------------------- */}
      {isDemoMode && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                Simulating Offline Dashboard Preview
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                The database API endpoint is offline. Showing premium layout with local sandbox mock data.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetryFetch}
              disabled={isRetrying}
              className="h-9 text-xs gap-2 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 rounded-xl transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              Retry Live Connect
            </Button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          New Diverse KPI Cards Grid (Content-Specific Layouts)
          ------------------------------------------------------------- */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

        {/* Card 1: Gross Revenue (Full-Bleed Sparkline) */}
        <Card
          onClick={() => navigate("/owner-dashboard/revenue")}
          className="relative overflow-hidden border border-emerald-500/10 bg-card/45 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-emerald-500/35 transition-all duration-300 hover:-translate-y-1 cursor-pointer rounded-2xl group flex flex-col justify-between min-h-[165px]"
        >
          {/* Robinhood-Style Full Bleed Sparkline in Background */}
          <div className="absolute inset-x-0 bottom-0 top-12 z-0 opacity-30 select-none pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueSparkline} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#revenueSparklineGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Revenue</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-black tracking-tight text-foreground">
                    ₹{(data?.stats?.monthlyRevenue || 184200).toLocaleString()}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" />
                    +12.5%
                  </span>
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                <IndianRupee className="h-4.5 w-4.5 text-emerald-500" />
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between border-t border-border/20 pt-3 text-[10px] font-semibold text-muted-foreground">
              <div className="flex gap-3">
                <span>Online: <strong className="text-foreground">₹139K</strong></span>
                <span className="opacity-40">|</span>
                <span>Cash: <strong className="text-foreground">₹45K</strong></span>
              </div>
              <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1 group/btn border border-border bg-white dark:bg-slate-900 text-foreground hover:bg-[#6DFF3B] hover:border-[#6DFF3B] hover:text-black shadow-xs hover:shadow-md cursor-pointer">
                Revenue
                <ChevronRight className="h-3 w-3 transform group-hover/btn:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Bookings Count (Radial Progress Gauge) */}
        <Card
          onClick={() => navigate("/owner-dashboard/bookings")}
          className="relative overflow-hidden border border-blue-500/10 bg-card/45 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-blue-500/35 transition-all duration-300 hover:-translate-y-1 cursor-pointer rounded-2xl group flex flex-col justify-between min-h-[165px]"
        >
          <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Today's Bookings</p>
                <h3 className="text-2xl font-black tracking-tight text-foreground mt-0.5">
                  {data?.stats?.todaysBookings || 18} Bookings
                </h3>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  +8.2% vs yesterday
                </p>
              </div>

              {/* Glowing SVG Progress Ring */}
              <div className="relative flex items-center justify-center shrink-0 w-14 h-14 translate-y-[-2px]">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r={ringRadius}
                    stroke="currentColor"
                    className="text-muted/20"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r={ringRadius}
                    stroke="url(#blueProgressRing)"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-black text-blue-500">{progressPercentage}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-border/20 pt-3 text-[10px] font-semibold text-muted-foreground">
              <div className="flex gap-2">
                <span>Confirmed: <strong className="text-foreground">14</strong></span>
                <span className="opacity-40">·</span>
                <span>Pending: <strong className="text-amber-500">4</strong></span>
              </div>
              <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1 group/btn border border-border bg-white dark:bg-slate-900 text-foreground hover:bg-[#6DFF3B] hover:border-[#6DFF3B] hover:text-black shadow-xs hover:shadow-md cursor-pointer">
                Details
                <ChevronRight className="h-3 w-3 transform group-hover/btn:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Active Occupancy (Histogram Chart) */}
        <Card
          onClick={() => navigate("/owner-dashboard/time-slots")}
          className="relative overflow-hidden border border-emerald-500/10 bg-card/45 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-emerald-500/35 transition-all duration-300 hover:-translate-y-1 cursor-pointer rounded-2xl group flex flex-col justify-between min-h-[165px]"
        >
          <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Occupancy</p>
                <h3 className="text-2xl font-black tracking-tight text-foreground mt-0.5">
                  {data?.stats?.occupancyRate || 78}%
                </h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Peak slots: <strong className="text-emerald-600 dark:text-[#6DFF3B] font-bold">6-9 PM</strong></p>
              </div>

              {/* Compact Histogram Column Chart */}
              <div className="w-16 h-12 shrink-0 translate-y-[4px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockHistogramOccupancy} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Bar
                      dataKey="value"
                      fill="#10b981"
                      radius={[2, 2, 0, 0]}
                      maxBarSize={8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between border-t border-border/20 pt-3 text-[10px] font-semibold text-muted-foreground">
              <div className="flex gap-3">
                <span>Morning: <strong className="text-foreground">35%</strong></span>
                <span className="opacity-40">·</span>
                <span>Evening: <strong className="text-foreground">95%</strong></span>
              </div>
              <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1 group/btn border border-border bg-white dark:bg-slate-900 text-foreground hover:bg-[#6DFF3B] hover:border-[#6DFF3B] hover:text-black shadow-xs hover:shadow-md cursor-pointer">
                Slots
                <ChevronRight className="h-3 w-3 transform group-hover/btn:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Quality Feedback (Stacked Segment Bar) */}
        <Card
          onClick={() => navigate("/owner-dashboard/reviews")}
          className="relative overflow-hidden border border-amber-500/10 bg-card/45 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-amber-500/35 transition-all duration-300 hover:-translate-y-1 cursor-pointer rounded-2xl group flex flex-col justify-between min-h-[165px]"
        >
          <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Turf Quality Rating</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-2xl font-black tracking-tight text-foreground">{data?.stats?.averageRating || 4.8}</h3>
                  <div className="flex items-center text-amber-500 translate-y-[-2px]">
                    <Star className="h-4 w-4 fill-amber-500" />
                    <Star className="h-4 w-4 fill-amber-500" />
                    <Star className="h-4 w-4 fill-amber-500" />
                    <Star className="h-4 w-4 fill-amber-500" />
                    <Star className="h-4 w-4 fill-amber-500/20 text-amber-500/50" />
                  </div>
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-inner">
                <Star className="h-4.5 w-4.5 text-amber-500" />
              </div>
            </div>

            {/* Segmented stacked horizontal review bar */}
            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-[9px] text-muted-foreground font-bold items-center">
                <span>Reviews: {data?.stats?.reviewsCount || 128}</span>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1 group/btn border border-border bg-white dark:bg-slate-900 text-foreground hover:bg-[#6DFF3B] hover:border-[#6DFF3B] hover:text-black shadow-xs hover:shadow-md cursor-pointer">
                  Reviews
                  <ChevronRight className="h-3 w-3 transform group-hover/btn:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full flex overflow-hidden border border-border/20">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: "85%" }} title="5 Stars: 85%" />
                <div className="h-full bg-amber-500 transition-all" style={{ width: "10%" }} title="4 Stars: 10%" />
                <div className="h-full bg-rose-500 transition-all" style={{ width: "5%" }} title="3 Stars or below: 5%" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* -------------------------------------------------------------
          Visual Graphs Section (Main Tabbed Analytics & Donut Popularity)
          ------------------------------------------------------------- */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Left Column: Interactive Main Chart */}
        <Card className="lg:col-span-2 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl shadow-lg">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 p-6">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">Analytics Overview</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Track occupancy rates, daily revenue, and slots filled.</p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs defaultValue="revenue" className="w-full space-y-6">
              <div className="w-full bg-muted/30 p-1 rounded-xl border border-border/40">
                <TabsList className="grid grid-cols-3 w-full bg-transparent border-0 h-auto p-0 gap-1">
                  <TabsTrigger value="revenue" className="text-[10px] sm:text-xs rounded-lg px-1 py-2 font-semibold text-center whitespace-nowrap transition-all cursor-pointer">Revenue Trend</TabsTrigger>
                  <TabsTrigger value="bookings" className="text-[10px] sm:text-xs rounded-lg px-1 py-2 font-semibold text-center whitespace-nowrap transition-all cursor-pointer">Bookings Filled</TabsTrigger>
                  <TabsTrigger value="occupancy" className="text-[10px] sm:text-xs rounded-lg px-1 py-2 font-semibold text-center whitespace-nowrap transition-all cursor-pointer">Hourly Peak</TabsTrigger>
                </TabsList>
              </div>

              {/* 1. Revenue Chart Content */}
              <TabsContent value="revenue" className="focus-visible:outline-none">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockRevenueChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="chartRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--popover)", borderColor: "hsl(var(--border))", borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                        itemStyle={{ color: "var(--foreground)" }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))", fontWeight: "bold" }}
                        formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#chartRevenueGrad)" activeDot={{ r: 6, stroke: "var(--background)", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* 2. Bookings Chart Content */}
              <TabsContent value="bookings" className="focus-visible:outline-none">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockRevenueChart} margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={false}
                        contentStyle={{ backgroundColor: "var(--popover)", borderColor: "hsl(var(--border))", borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                        itemStyle={{ color: "var(--foreground)" }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))", fontWeight: "bold" }}
                        formatter={(value) => [value, "Bookings"]}
                      />
                      <Bar dataKey="bookings" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* 3. Occupancy Peak Hours */}
              <TabsContent value="occupancy" className="focus-visible:outline-none">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockHourlyOccupancy} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="chartOccupancyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "var(--popover)", borderColor: "hsl(var(--border))", borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                        itemStyle={{ color: "var(--foreground)" }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))", fontWeight: "bold" }}
                        formatter={(value) => [`${value}%`, "Slot Occupancy"]}
                      />
                      <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#chartOccupancyGrad)" activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right Column: Sport Share Pie Chart */}
        <Card className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl shadow-lg flex flex-col justify-between">
          <CardHeader className="border-b border-border/40 p-6">
            <CardTitle className="text-lg font-bold tracking-tight">Sport Popularity</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Top sports booked in last 30 days.</p>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center">

            <div className="relative h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockSportsPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {mockSportsPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="outline-none focus:outline-none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--popover)", borderColor: "hsl(var(--border))", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                    itemStyle={{ color: "var(--foreground)" }}
                    formatter={(value) => [`${value}% share`, "Popularity"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black tracking-tight text-foreground">120</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">Bookings</span>
              </div>
            </div>

            {/* Premium Custom Legend */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              {mockSportsPie.map((item) => (
                <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/30 transition-all border border-transparent hover:border-border/30">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.count} slots ({item.value}%)</p>
                  </div>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------------------------------
          Middle Row: Quick Operations & Recent Activity
          ------------------------------------------------------------- */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent Activity List */}
        <Card className="lg:col-span-2 border-border/40 bg-card/30 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 p-6 bg-muted/10">
            <div>
              <CardTitle className="text-lg font-bold tracking-tight">System Logs & Activities</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">Live real-time operational feeds</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-xl border border-border/40 hover:bg-muted/50 h-8 text-xs font-semibold">
              View Audit logs
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-border/30">
              {data?.recentActivity?.bookings?.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-5 hover:bg-muted/20 transition-all cursor-pointer group"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                    {activity.title.includes("Payment") ? (
                      <IndianRupee className="h-4.5 w-4.5 text-primary" />
                    ) : activity.title.includes("Review") ? (
                      <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500/20" />
                    ) : activity.title.includes("Cancel") ? (
                      <Ban className="h-4.5 w-4.5 text-rose-500" />
                    ) : (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{activity.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 bg-background/50 px-2.5 py-1 rounded-full border border-border/40">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Operations Actions Grid */}
        <Card className="border border-border/40 bg-card/30 backdrop-blur-xl shadow-lg flex flex-col justify-between">
          <CardHeader className="border-b border-border/40 p-6">
            <CardTitle className="text-lg font-bold tracking-tight">Quick Operations</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Instantly configure your facilities.</p>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col justify-center gap-4">

            {/* Action 1: Block custom slots */}
            <Dialog open={isBlockSlotOpen} onOpenChange={setIsBlockSlotOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start gap-3 h-12 rounded-xl bg-card border border-border/50 hover:bg-muted text-foreground hover:text-foreground shadow-sm group transition-all">
                  <span className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 group-hover:scale-105 transition-transform">
                    <Ban className="h-4 w-4" />
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-bold">Block Turf Time-Slots</p>
                    <p className="text-[10px] text-muted-foreground">For repair & maintenance works</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border border-border/40 bg-popover max-w-md">
                <form onSubmit={submitBlockSlot}>
                  <DialogHeader>
                    <DialogTitle className="font-bold flex items-center gap-2">
                      <Ban className="h-5 w-5 text-rose-500" />
                      Block Turf Slot
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Block operational hours for maintenance, events, or weather conditions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="block-turf" className="text-xs font-semibold">Select Turf Facility</Label>
                      <Select value={blockTurf} onValueChange={setBlockTurf} required>
                        <SelectTrigger id="block-turf" className="h-10 rounded-lg">
                          <SelectValue placeholder="Choose turf..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                          <SelectItem value="Main Arena A">Main Arena A (Football)</SelectItem>
                          <SelectItem value="Indoor Turf B">Indoor Turf B (Cricket)</SelectItem>
                          <SelectItem value="Court 1 (Clay)">Court 1 (Tennis)</SelectItem>
                          <SelectItem value="Badminton Court 1">Badminton Court 1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="block-date" className="text-xs font-semibold">Date</Label>
                        <Input
                          id="block-date"
                          type="date"
                          value={blockDate}
                          onChange={(e) => setBlockDate(e.target.value)}
                          className="h-10 rounded-lg"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="block-time" className="text-xs font-semibold">Time Slot / Duration</Label>
                        <Input
                          id="block-time"
                          placeholder="e.g. 2:00 PM - 5:00 PM"
                          value={blockTime}
                          onChange={(e) => setBlockTime(e.target.value)}
                          className="h-10 rounded-lg"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsBlockSlotOpen(false)} className="rounded-lg h-10 text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" className="rounded-lg h-10 text-xs bg-rose-600 text-white hover:bg-rose-700">
                      Block Slot
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Action 2: Create Promo Code */}
            <Dialog open={isPromoOpen} onOpenChange={setIsPromoOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start gap-3 h-12 rounded-xl bg-card border border-border/50 hover:bg-muted text-foreground hover:text-foreground shadow-sm group transition-all">
                  <span className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
                    <Percent className="h-4 w-4" />
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-bold">Launch Discount Code</p>
                    <p className="text-[10px] text-muted-foreground">Promotions & campaigns discounts</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border border-border/40 bg-popover max-w-md">
                <form onSubmit={submitPromoCode}>
                  <DialogHeader>
                    <DialogTitle className="font-bold flex items-center gap-2">
                      <Percent className="h-5 w-5 text-emerald-500" />
                      Create Promotion Code
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Generate a discount coupon to boost slot bookings.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="promo-code" className="text-xs font-semibold">Promo Code</Label>
                      <Input
                        id="promo-code"
                        placeholder="e.g. MONSOON50"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="h-10 rounded-lg font-mono uppercase"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="promo-discount" className="text-xs font-semibold">Discount Percentage (%)</Label>
                      <Input
                        id="promo-discount"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="e.g. 20"
                        value={promoDiscount}
                        onChange={(e) => setPromoDiscount(e.target.value)}
                        className="h-10 rounded-lg"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsPromoOpen(false)} className="rounded-lg h-10 text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" className="rounded-lg h-10 text-xs bg-primary text-primary-foreground hover:opacity-95">
                      Create Coupon
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Action 3: Broadcast Announcement */}
            <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start gap-3 h-12 rounded-xl bg-card border border-border/50 hover:bg-muted text-foreground hover:text-foreground shadow-sm group transition-all">
                  <span className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20 group-hover:scale-105 transition-transform">
                    <BellRing className="h-4 w-4" />
                  </span>
                  <div className="text-left">
                    <p className="text-xs font-bold">Broadcast Announcement</p>
                    <p className="text-[10px] text-muted-foreground">Alert all booked players via app notifications</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl border border-border/40 bg-popover max-w-md">
                <form onSubmit={submitBroadcast}>
                  <DialogHeader>
                    <DialogTitle className="font-bold flex items-center gap-2">
                      <BellRing className="h-5 w-5 text-blue-500" />
                      Broadcast Notification
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Sends a direct push notification alert to all users holding a booking for today or tomorrow.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="broadcast-text" className="text-xs font-semibold">Notification Content</Label>
                      <textarea
                        id="broadcast-text"
                        placeholder="e.g. Due to sudden heavy rainfall, we are moving court slots indoors where possible. Please contact support."
                        value={broadcastText}
                        onChange={(e) => setBroadcastText(e.target.value)}
                        className="w-full min-h-[100px] border border-input bg-background rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsBroadcastOpen(false)} className="rounded-lg h-10 text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" className="rounded-lg h-10 text-xs bg-blue-600 text-white hover:bg-blue-700">
                      Send Broadcast
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Action 4: Register New Turf */}
            <Button
              onClick={() => navigate("/owner-dashboard/turfs/add")}
              className="w-full justify-start gap-3 h-12 rounded-xl bg-primary text-primary-foreground shadow-md hover:opacity-95 group transition-all font-semibold"
            >
              <span className="h-7 w-7 rounded-lg bg-primary-foreground/15 text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-4.5 w-4.5" />
              </span>
              <div className="text-left">
                <p className="text-xs font-bold text-primary-foreground">Register New Facility</p>
                <p className="text-[10px] text-primary-foreground/70">Expand club and upload turfs</p>
              </div>
            </Button>

          </CardContent>
        </Card>
      </div>

      {/* -------------------------------------------------------------
          Bottom Section: Advanced Interactive Booking Feed / Live Table
          ------------------------------------------------------------- */}
      <Card className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl shadow-lg">

        {/* Table Toolbar / Controls */}
        <CardHeader className="flex flex-col gap-4 border-b border-border/40 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg font-bold tracking-tight">Active Bookings Directory</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Filter, search, approve or decline real-time bookings.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search customer, turf..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-background/50 border-border/40 focus:border-primary/50 text-xs w-full"
              />
            </div>

            {/* Sport Select Filter */}
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[130px] h-10 rounded-xl border-border/40 text-xs">
                <SelectValue placeholder="All Sports" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="football">Football</SelectItem>
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="badminton">Badminton</SelectItem>
                <SelectItem value="basketball">Basketball</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Select Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-10 rounded-xl border-border/40 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {/* Table Sheet Content */}
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full scrollbar-visible pb-3">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="border-b border-border/40 bg-muted/10 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-6 py-4 whitespace-nowrap">Booking ID</th>
                  <th className="px-6 py-4 whitespace-nowrap">Customer Details</th>
                  <th className="px-6 py-4 whitespace-nowrap">Turf & Sport</th>
                  <th className="px-6 py-4 whitespace-nowrap">Slot Time & Date</th>
                  <th className="px-6 py-4 whitespace-nowrap">Amount Paid</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-sm">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-muted/10 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-foreground whitespace-nowrap">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{booking.customerName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-medium">{booking.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-accent/10 border-accent/20 text-accent font-bold">
                            {booking.sport}
                          </Badge>
                          <span className="text-xs font-semibold text-foreground">{booking.turfName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {booking.slotTime}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                            {booking.date} · <span className="italic">{booking.timeAgo}</span>
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-bold text-foreground">₹{booking.amount.toLocaleString()}</p>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase">{booking.paymentType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {booking.status === "Confirmed" && (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold rounded-lg px-2 py-0.5">
                            Confirmed
                          </Badge>
                        )}
                        {booking.status === "Pending" && (
                          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold rounded-lg px-2 py-0.5">
                            Pending
                          </Badge>
                        )}
                        {booking.status === "Cancelled" && (
                          <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold rounded-lg px-2 py-0.5">
                            Cancelled
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {booking.status === "Pending" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleConfirmBooking(booking.id, booking.customerName)}
                                className="h-8 w-8 p-0 rounded-lg bg-emerald-500/5 hover:bg-emerald-500 border-emerald-500/20 hover:border-emerald-500 text-emerald-500 hover:text-white transition-all shadow-sm"
                                title="Approve Booking"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelBooking(booking.id, booking.customerName)}
                                className="h-8 w-8 p-0 rounded-lg bg-rose-500/5 hover:bg-rose-500 border-rose-500/20 hover:border-rose-500 text-rose-500 hover:text-white transition-all shadow-sm"
                                title="Decline Booking"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : booking.status === "Confirmed" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelBooking(booking.id, booking.customerName)}
                              className="h-8 text-xs px-2.5 rounded-lg border border-border/50 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                            >
                              Decline
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground font-semibold italic">No actions available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-muted-foreground text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 opacity-20" />
                        No matching bookings found
                      </div>
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
