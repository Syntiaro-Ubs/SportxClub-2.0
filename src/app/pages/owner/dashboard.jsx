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
  FlaskConical,
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
  const outletContext = useOutletContext() || {};
  const isTestMode = outletContext.isTestMode !== undefined
    ? outletContext.isTestMode
    : (localStorage.getItem("ownerTestMode") === "true");

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
  const [timeframe, setTimeframe] = useState("weekly");

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

  // Dynamic Chart Data Hooks for Performance Analytics
  const sportPopularityData = useMemo(() => {
    const statusScaleMap = { all: 1, completed: 0.82, pending: 0.12, failed: 0.06 };
    const timeScaleMap = { today: 0.15, weekly: 1, monthly: 4, yearly: 48 };
    const scale = (statusScaleMap[statusFilter] || 1) * (timeScaleMap[timeframe] || 1);
    
    return [
      { name: "Football", value: Math.max(1, Math.round(45 * scale)), color: "var(--primary)", count: Math.max(1, Math.round(54 * scale)) },
      { name: "Cricket", value: Math.max(1, Math.round(30 * scale)), color: "#3b82f6", count: Math.max(1, Math.round(36 * scale)) },
      { name: "Tennis", value: Math.max(1, Math.round(12 * scale)), color: "#f59e0b", count: Math.max(1, Math.round(14 * scale)) },
      { name: "Badminton", value: Math.max(1, Math.round(8 * scale)), color: "#ec4899", count: Math.max(1, Math.round(10 * scale)) },
      { name: "Basketball", value: Math.max(1, Math.round(5 * scale)), color: "#ef4444", count: Math.max(1, Math.round(6 * scale)) },
    ];
  }, [statusFilter, timeframe]);

  const totalBookings = useMemo(() => sportPopularityData.reduce((acc, curr) => acc + curr.count, 0), [sportPopularityData]);

  const bookingsFilledData = useMemo(() => {
    const statusScaleMap = { all: 1, completed: 0.82, pending: 0.12, failed: 0.06 };
    const timeScaleMap = { today: 0.15, weekly: 1, monthly: 4, yearly: 48 };
    const scale = (statusScaleMap[statusFilter] || 1) * (timeScaleMap[timeframe] || 1);
    
    return [
      { name: "Mon", bookings: Math.round(12 * scale) },
      { name: "Tue", bookings: Math.round(9 * scale) },
      { name: "Wed", bookings: Math.round(16 * scale) },
      { name: "Thu", bookings: Math.round(8 * scale) },
      { name: "Fri", bookings: Math.round(21 * scale) },
      { name: "Sat", bookings: Math.round(29 * scale) },
      { name: "Sun", bookings: Math.round(24 * scale) },
    ];
  }, [statusFilter, timeframe]);

  const revenueTrendData = useMemo(() => {
    const statusScaleMap = { all: 1, completed: 0.82, pending: 0.12, failed: 0.06 };
    const timeScaleMap = { today: 0.15, weekly: 1, monthly: 4, yearly: 48 };
    const scale = (statusScaleMap[statusFilter] || 1) * (timeScaleMap[timeframe] || 1);
    
    return [
      { name: "Mon", revenue: Math.round(24000 * scale) },
      { name: "Tue", revenue: Math.round(18000 * scale) },
      { name: "Wed", revenue: Math.round(32000 * scale) },
      { name: "Thu", revenue: Math.round(15000 * scale) },
      { name: "Fri", revenue: Math.round(42000 * scale) },
      { name: "Sat", revenue: Math.round(58000 * scale) },
      { name: "Sun", revenue: Math.round(49000 * scale) },
    ];
  }, [statusFilter, timeframe]);

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
    if (isTestMode) return [];
    return bookings.filter(b => {
      const matchesSearch =
        b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.turfName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSport = sportFilter === "all" || b.sport.toLowerCase() === sportFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || b.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesSport && matchesStatus;
    });
  }, [bookings, searchQuery, sportFilter, statusFilter, isTestMode]);

  // Bookings Radial Circle progress calculations
  const totalSlotsCount = 24;
  const bookedSlotsCount = isTestMode ? 0 : 18;
  const progressPercentage = isTestMode ? 0 : Math.round((bookedSlotsCount / totalSlotsCount) * 100);
  const ringRadius = 22;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashoffset = ringCircumference - (progressPercentage / 100) * ringCircumference;

  const activePieData = useMemo(() => {
    if (isTestMode) {
      return [
        { name: "No Test Data", value: 100, color: "#64748b" }
      ];
    }
    return mockSportsPie;
  }, [isTestMode]);

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




      {/* -------------------------------------------------------------
          New Diverse KPI Cards Grid (Content-Specific Layouts)
          ------------------------------------------------------------- */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3">

        {/* Card 1: Gross Revenue (Full-Bleed Sparkline) */}
        <Card
          onClick={() => navigate("/owner-dashboard/revenue")}
          className="relative overflow-hidden border border-emerald-500/10 bg-card/45 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-emerald-500/35 transition-all duration-300 hover:-translate-y-1 cursor-pointer rounded-2xl group flex flex-col justify-between min-h-[165px]"
        >


          <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Revenue</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-black tracking-tight text-foreground">
                    ₹{isTestMode ? "0" : (data?.stats?.monthlyRevenue || 184200).toLocaleString()}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" />
                    {isTestMode ? "0%" : "+12.5%"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between border-t border-border/20 pt-3 text-[10px] font-semibold text-muted-foreground">
              <div className="flex gap-3">
                <span>Online: <strong className="text-foreground">{isTestMode ? "₹0" : "₹139K"}</strong></span>
                <span className="opacity-40">|</span>
                <span>Cash: <strong className="text-foreground">{isTestMode ? "₹0" : "₹45K"}</strong></span>
              </div>
              <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1 group/btn border border-border bg-white dark:bg-slate-900 text-foreground hover:bg-emerald-600 hover:border-emerald-600 hover:text-black shadow-xs hover:shadow-md cursor-pointer">
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
                  {isTestMode ? 0 : (data?.stats?.todaysBookings || 18)} Bookings
                </h3>
                <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3" />
                  {isTestMode ? "0%" : "+8.2% vs yesterday"}
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
                <span>Confirmed: <strong className="text-foreground">{isTestMode ? 0 : 14}</strong></span>
                <span className="opacity-40">·</span>
                <span>Pending: <strong className="text-amber-500">{isTestMode ? 0 : 4}</strong></span>
              </div>
              <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1 group/btn border border-border bg-white dark:bg-slate-900 text-foreground hover:bg-emerald-600 hover:border-emerald-600 hover:text-black shadow-xs hover:shadow-md cursor-pointer">
                Details
                <ChevronRight className="h-3 w-3 transform group-hover/btn:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </CardContent>
        </Card>



        {/* Card 3: Active Turfs */}
        <Card
          onClick={() => navigate("/owner-dashboard/turfs")}
          className="relative overflow-hidden border border-purple-500/10 bg-card/45 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-purple-500/35 transition-all duration-300 hover:-translate-y-1 cursor-pointer rounded-2xl group flex flex-col justify-between min-h-[165px]"
        >
          <CardContent className="p-5 relative z-10 flex flex-col justify-between h-full flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Turfs</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-black tracking-tight text-foreground">
                    {isTestMode ? "0" : (data?.stats?.activeTurfs || 4)}
                  </h3>
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-0.5">
                    / {isTestMode ? "0" : (data?.stats?.totalTurfs || 5)} Total
                  </span>
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 shadow-inner">
                <MapPin className="h-4.5 w-4.5 text-purple-500" />
              </div>
            </div>

            <div className="mt-6 flex items-end justify-between border-t border-border/20 pt-3 text-[10px] font-semibold text-muted-foreground">
              <div className="flex gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Operational
                </span>
              </div>
              <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1 group/btn border border-border bg-white dark:bg-slate-900 text-foreground hover:bg-purple-600 hover:border-purple-600 hover:text-white shadow-xs hover:shadow-md cursor-pointer">
                Manage
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
                  <h3 className="text-2xl font-black tracking-tight text-foreground">{isTestMode ? "0.0" : (data?.stats?.averageRating || 4.8)}</h3>
                  <div className="flex items-center text-amber-500 translate-y-[-2px]">
                    {[1, 2, 3, 4, 5].map((starIndex) => {
                      const ratingVal = isTestMode ? 0 : (data?.stats?.averageRating || 4.8);
                      const isFilled = ratingVal >= starIndex;
                      const isHalf = ratingVal >= starIndex - 0.5 && ratingVal < starIndex;
                      return (
                        <Star
                          key={starIndex}
                          className={`h-4 w-4 ${isFilled
                            ? "fill-amber-500 text-amber-500"
                            : isHalf
                              ? "fill-amber-500/50 text-amber-500"
                              : "fill-transparent text-amber-500/40"
                            }`}
                        />
                      );
                    })}
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
                <span>Reviews: {isTestMode ? 0 : (data?.stats?.reviewsCount || 128)}</span>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center gap-1 group/btn border border-border bg-white dark:bg-slate-900 text-foreground hover:bg-emerald-600 hover:border-emerald-600 hover:text-black shadow-xs hover:shadow-md cursor-pointer">
                  Reviews
                  <ChevronRight className="h-3 w-3 transform group-hover/btn:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full flex overflow-hidden border border-border/20">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: isTestMode ? "0%" : "85%" }} title="5 Stars: 85%" />
                <div className="h-full bg-amber-500 transition-all" style={{ width: isTestMode ? "0%" : "10%" }} title="4 Stars: 10%" />
                <div className="h-full bg-rose-500 transition-all" style={{ width: isTestMode ? "0%" : "5%" }} title="3 Stars or below: 5%" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* -------------------------------------------------------------
          Visual Graphs Section & Quick Operations
          ------------------------------------------------------------- */}
      <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Header and Timeframe */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Performance Analytics</h2>
            <p className="text-xs text-slate-500 mt-1">Detailed breakdown of your venue's metrics.</p>
          </div>
          
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            {["today", "weekly", "monthly", "yearly"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${timeframe === tf
                  ? "bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* 4 KPI Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: "all", label: "Total Revenue", amount: "₹45,000", color: "border-blue-200 bg-blue-50 text-blue-700" },
            { id: "completed", label: "Received", amount: "₹28,500", color: "border-emerald-200 bg-emerald-50 text-emerald-700" },
            { id: "pending", label: "Upcoming", amount: "₹12,000", color: "border-amber-200 bg-amber-50 text-amber-700" },
            { id: "failed", label: "Cancellations", amount: "₹4,500", color: "border-rose-200 bg-rose-50 text-rose-700" },
          ].map((stat) => (
            <button
              key={stat.id}
              onClick={() => setStatusFilter(stat.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                statusFilter === stat.id 
                  ? `${stat.color} shadow-md ring-2 ring-offset-1 ring-current`
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 opacity-70 hover:opacity-100"
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-2xl font-black">{stat.amount}</p>
            </button>
          ))}
        </div>

        {/* The 3 Graphs in one line */}
        <div className="grid lg:grid-cols-3 gap-6">
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
                    data={sportPopularityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {sportPopularityData.map((entry, index) => (
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
                <span className="text-2xl font-black tracking-tight text-foreground">{isTestMode ? 0 : totalBookings}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-0.5">Bookings</span>
              </div>
            </div>

            {/* Premium Custom Legend */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
              {sportPopularityData.map((item) => (
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
          <Card className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <CardHeader className="border-b border-border/40 p-6">
              <CardTitle className="text-lg font-bold tracking-tight">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-center">
              {/* 1. Revenue Chart Content */}
              <div className="flex flex-col">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
              </div>

            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-xl shadow-lg flex flex-col justify-between">
            <CardHeader className="border-b border-border/40 p-6">
              <CardTitle className="text-lg font-bold tracking-tight">Bookings Filled</CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-center">
              {/* 2. Bookings Chart Content */}
              <div className="flex flex-col">
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingsFilledData} margin={{ top: 10, right: 25, left: -10, bottom: 0 }}>
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
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Middle Row: Recent Activity
          ------------------------------------------------------------- */}
      <div className="grid lg:grid-cols-1 gap-6">
        {/* Recent Activity List */}
        <Card className="lg:col-span-1 border-border/40 bg-card/30 backdrop-blur-xl shadow-lg overflow-hidden flex flex-col justify-between">
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
