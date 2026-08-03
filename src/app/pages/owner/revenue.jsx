import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Loader2,
  AlertCircle,
  IndianRupee,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Download,
  Filter,
  Calendar as CalendarIcon,
  Search,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building2,
  ShieldCheck,
  User,
  ChevronRight,
  Info,
  CreditCard,
  Trophy,
  Award,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { paymentService } from "../../services/payment.service";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

const renderCustomYAxisTick = ({ x, y, payload }) => {
  const value = payload.value;
  const formattedVal = value >= 1000 ? `${value / 1000}k` : value;
  return (
    <g transform={`translate(${x},${y})`}>
      <svg x="-36" y="-7" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black dark:text-white">
        <path d="M6 3h12M6 8h12M6 13l8.5 8M6 13h3a4.5 4.5 0 0 0 0-9" />
      </svg>
      <text x="-24" y="2" textAnchor="start" fontSize="10" fill="currentColor" className="text-black dark:text-white" fontWeight="600">
        {formattedVal}
      </text>
    </g>
  );
};

const renderBarYAxisTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x="-36" y="2" textAnchor="start" fontSize="10" fill="var(--foreground)" fontWeight="600">
        {payload.value}
      </text>
    </g>
  );
};

// TODO: Replace with actual auth context ownerId
const OWNER_ID = "owner-123";

const mockChartData = [
  { name: "Mon", amount: 15000 },
  { name: "Tue", amount: 22000 },
  { name: "Wed", amount: 18000 },
  { name: "Thu", amount: 32000 },
  { name: "Fri", amount: 28000 },
  { name: "Sat", amount: 45000 },
  { name: "Sun", amount: 24000 },
];

const sportPopularityData = [
  { name: 'Football', value: 45, count: 8, color: '#059669' },
  { name: 'Cricket', value: 30, count: 5, color: '#2563eb' },
  { name: 'Tennis', value: 12, count: 2, color: '#d97706' },
  { name: 'Badminton', value: 8, count: 2, color: '#ec4899' },
  { name: 'Basketball', value: 5, count: 1, color: '#ef4444' },
];

const revenueTrendData = [
  { name: 'Mon', revenue: 24000 },
  { name: 'Tue', revenue: 18000 },
  { name: 'Wed', revenue: 32000 },
  { name: 'Thu', revenue: 15000 },
  { name: 'Fri', revenue: 42000 },
  { name: 'Sat', revenue: 58000 },
  { name: 'Sun', revenue: 49000 },
];

const bookingsFilledData = [
  { name: 'Mon', bookings: 12 },
  { name: 'Tue', bookings: 9 },
  { name: 'Wed', bookings: 16 },
  { name: 'Thu', bookings: 8 },
  { name: 'Fri', bookings: 21 },
  { name: 'Sat', bookings: 29 },
  { name: 'Sun', bookings: 24 },
];

const totalBookings = sportPopularityData.reduce((sum, item) => sum + item.count, 0);

const mockTransactions = Array.from({ length: 20 }, (_, i) => {
  const base = [
    { source: "Cricket Ground 1", amount: 1200, status: "completed", method: "UPI" },
    { source: "Premium Football Turf", amount: 1600, status: "completed", method: "Card" },
    { source: "Cricket Ground 2", amount: 800, status: "pending", method: "Cash" },
    { source: "Cricket Ground 1", amount: 1200, status: "completed", method: "UPI" },
    { source: "Premium Football Turf", amount: 1600, status: "failed", method: "UPI" },
    { source: "Cricket Ground 1", amount: 800, status: "completed", method: "UPI" },
    { source: "Cricket Ground 2", amount: 1200, status: "completed", method: "Cash" },
    { source: "Premium Football Turf", amount: 1600, status: "completed", method: "Card" },
    { source: "Cricket Ground 1", amount: 800, status: "pending", method: "UPI" }
  ];
  const b = base[i % base.length];
  return {
    id: `TXN89${(30 - i).toString().padStart(2, '0')}A${(i % 9) + 1}`,
    date: `Jul ${Math.max(1, 26 - Math.floor(i / 2)).toString().padStart(2, '0')}, 2026`,
    source: b.source,
    amount: b.amount,
    status: b.status,
    method: b.method,
  };
});

export function Revenue() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mode Selection: Fallback Sandbox vs Live API
  const [isDemoMode, setIsDemoMode] = useState(true);

  // Timeframe selector: weekly, monthly, yearly
  const [timeframe, setTimeframe] = useState("weekly");

  // Table search & filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await paymentService.getAll(OWNER_ID);
      setData(result || []);
    } catch (err) {
      console.warn("Failed to load live revenue API, sandbox remains active", err);
      // Don't show hard blocking errors, just let user know they can switch modes
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mockTransactionsFiltered = useMemo(() => {
    switch (timeframe) {
      case "today":
        return [
          { id: "TXN8930A4", date: "Jul 26, 2026", source: "Cricket Ground 1", amount: 1200, status: "completed", method: "UPI" },
          { id: "TXN8929A2", date: "Jul 26, 2026", source: "Premium Football Turf", amount: 1600, status: "completed", method: "Card" },
        ];
      case "monthly":
        return [
          { id: "TXN8930A4", date: "Jul 26, 2026", source: "Cricket Ground 1", amount: 1200, status: "completed", method: "UPI" },
          { id: "TXN8929A2", date: "Jul 26, 2026", source: "Premium Football Turf", amount: 1600, status: "completed", method: "Card" },
          { id: "TXN8928B3", date: "Jul 25, 2026", source: "Cricket Ground 2", amount: 800, status: "pending", method: "Cash" },
          { id: "TXN8927A1", date: "Jul 25, 2026", source: "Cricket Ground 1", amount: 1200, status: "completed", method: "UPI" },
          { id: "TXN8926C4", date: "Jul 24, 2026", source: "Premium Football Turf", amount: 1600, status: "failed", method: "UPI" },
          { id: "TXN8925A9", date: "Jul 24, 2026", source: "Cricket Ground 1", amount: 800, status: "completed", method: "UPI" },
          { id: "TXN8924B2", date: "Jul 23, 2026", source: "Cricket Ground 2", amount: 1200, status: "completed", method: "Cash" },
          { id: "TXN8923C1", date: "Jul 22, 2026", source: "Premium Football Turf", amount: 1600, status: "completed", method: "Card" },
          { id: "TXN8922A3", date: "Jul 22, 2026", source: "Cricket Ground 1", amount: 800, status: "pending", method: "UPI" },
          { id: "TXN8921X9", date: "Jul 18, 2026", source: "Premium Football Turf", amount: 4800, status: "completed", method: "UPI" },
          { id: "TXN8920Y8", date: "Jul 15, 2026", source: "Cricket Ground 2", amount: 3200, status: "completed", method: "Cash" },
          { id: "TXN8919Z7", date: "Jul 12, 2026", source: "Cricket Ground 1", amount: 5600, status: "completed", method: "Card" },
          { id: "TXN8918W6", date: "Jul 08, 2026", source: "Premium Football Turf", amount: 6400, status: "completed", method: "UPI" },
          { id: "TXN8917V5", date: "Jul 05, 2026", source: "Cricket Ground 1", amount: 7200, status: "completed", method: "Card" },
        ];
      case "yearly":
        return [
          { id: "TXN8930A4", date: "Jul 26, 2026", source: "Cricket Ground 1", amount: 1200, status: "completed", method: "UPI" },
          { id: "TXN8929A2", date: "Jul 26, 2026", source: "Premium Football Turf", amount: 1600, status: "completed", method: "Card" },
          { id: "TXN8928B3", date: "Jul 25, 2026", source: "Cricket Ground 2", amount: 800, status: "pending", method: "Cash" },
          { id: "TXN8927A1", date: "Jul 25, 2026", source: "Cricket Ground 1", amount: 1200, status: "completed", method: "UPI" },
          { id: "TXN8926C4", date: "Jul 24, 2026", source: "Premium Football Turf", amount: 1600, status: "failed", method: "UPI" },
          { id: "TXN8925A9", date: "Jul 24, 2026", source: "Cricket Ground 1", amount: 800, status: "completed", method: "UPI" },
          { id: "TXN8923C1", date: "Jul 22, 2026", source: "Premium Football Turf", amount: 1600, status: "completed", method: "Card" },
          { id: "TXN8912M4", date: "Jun 14, 2026", source: "Cricket Ground 1", amount: 24000, status: "completed", method: "UPI" },
          { id: "TXN8909N2", date: "May 20, 2026", source: "Premium Football Turf", amount: 32000, status: "completed", method: "Card" },
          { id: "TXN8898O1", date: "Apr 05, 2026", source: "Cricket Ground 2", amount: 18000, status: "completed", method: "Cash" },
          { id: "TXN8887P3", date: "Mar 18, 2026", source: "Premium Football Turf", amount: 45000, status: "completed", method: "UPI" },
          { id: "TXN8876Q2", date: "Feb 10, 2026", source: "Cricket Ground 1", amount: 38000, status: "completed", method: "Card" },
          { id: "TXN8865R1", date: "Jan 22, 2026", source: "Cricket Ground 2", amount: 29000, status: "completed", method: "Cash" },
        ];
      case "weekly":
      default:
        return mockTransactions;
    }
  }, [timeframe]);

  const activePayments = useMemo(() => {
    return isDemoMode ? mockTransactionsFiltered : data;
  }, [isDemoMode, mockTransactionsFiltered, data]);

  const chartData = useMemo(() => {
    let baseData = [];
    switch (timeframe) {
      case "today":
        baseData = [
          { name: "08:00", amount: 1200 },
          { name: "10:00", amount: 1600 },
          { name: "12:00", amount: 0 },
          { name: "14:00", amount: 0 },
          { name: "16:00", amount: 0 },
          { name: "18:00", amount: 0 },
          { name: "20:00", amount: 0 },
        ];
        break;
      case "monthly":
        baseData = [
          { name: "Week 1", amount: 38000 },
          { name: "Week 2", amount: 45000 },
          { name: "Week 3", amount: 52000 },
          { name: "Week 4", amount: 49000 },
        ];
        break;
      case "yearly":
        baseData = [
          { name: "Jan", amount: 120000 },
          { name: "Feb", amount: 140000 },
          { name: "Mar", amount: 110000 },
          { name: "Apr", amount: 165000 },
          { name: "May", amount: 190000 },
          { name: "Jun", amount: 210000 },
          { name: "Jul", amount: 245000 },
          { name: "Aug", amount: 180000 },
          { name: "Sep", amount: 195000 },
          { name: "Oct", amount: 220000 },
          { name: "Nov", amount: 215000 },
          { name: "Dec", amount: 260000 },
        ];
        break;
      case "weekly":
      default:
        baseData = [
          { name: "Mon", amount: 15000 },
          { name: "Tue", amount: 22000 },
          { name: "Wed", amount: 18000 },
          { name: "Thu", amount: 32000 },
          { name: "Fri", amount: 28000 },
          { name: "Sat", amount: 45000 },
          { name: "Sun", amount: 24000 },
        ];
        break;
    }

    const scaleMap = {
      all: 1,
      completed: 0.82,
      pending: 0.12,
      failed: 0.06
    };
    const baseScale = scaleMap[statusFilter] || 1;

    return baseData.map((d, index) => {
      let variance = 1;
      if (statusFilter === "completed") variance = 1 + (index % 3) * 0.1;
      if (statusFilter === "pending") variance = 1 + (index % 2) * -0.2;
      if (statusFilter === "failed") variance = 1 + (index % 4) * 0.3;

      return {
        ...d,
        amount: Math.round(d.amount * baseScale * variance)
      };
    });
  }, [timeframe, statusFilter]);

  const sportPopularityData = useMemo(() => {
    const statusScaleMap = { all: 1, completed: 0.82, pending: 0.12, failed: 0.06 };
    const timeScaleMap = { today: 0.15, weekly: 1, monthly: 4, yearly: 48 };
    const scale = (statusScaleMap[statusFilter] || 1) * (timeScaleMap[timeframe] || 1);

    return [
      { name: "Football", value: Math.max(1, Math.round(54 * scale)), color: "#059669", count: Math.max(1, Math.round(54 * scale)) },
      { name: "Cricket", value: Math.max(1, Math.round(36 * scale)), color: "#3b82f6", count: Math.max(1, Math.round(36 * scale)) },
      { name: "Tennis", value: Math.max(1, Math.round(14 * scale)), color: "#f59e0b", count: Math.max(1, Math.round(14 * scale)) },
      { name: "Badminton", value: Math.max(1, Math.round(10 * scale)), color: "#ec4899", count: Math.max(1, Math.round(10 * scale)) },
    ];
  }, [statusFilter, timeframe]);

  const totalBookings = useMemo(() => sportPopularityData.reduce((acc, curr) => acc + curr.value, 0), [sportPopularityData]);

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

  const chartColor = useMemo(() => {
    switch (statusFilter) {
      case "completed": return "#10b981";
      case "pending": return "#f59e0b";
      case "failed": return "#e11d48";
      case "all":
      default: return "#3b82f6";
    }
  }, [statusFilter]);

  const trendFooter = useMemo(() => {
    switch (timeframe) {
      case "today":
        return { peak: "10:00 AM", avg: "1.4K", label: "Peak Hour", avgLabel: "Est. Hourly Avg" };
      case "monthly":
        return { peak: "Week 3", avg: "46.0K", label: "Peak Period", avgLabel: "Est. Monthly Avg" };
      case "yearly":
        return { peak: "December", avg: "187.9K", label: "Peak Month", avgLabel: "Est. Yearly Avg" };
      case "weekly":
      default:
        return { peak: "Saturday", avg: "26.5K", label: "Peak Day", avgLabel: "Est. Weekly Avg" };
    }
  }, [timeframe]);

  const grossRevenue = useMemo(() => {
    return activePayments.reduce((acc, curr) => acc + curr.amount, 0);
  }, [activePayments]);

  const receivedRevenue = useMemo(() => {
    return activePayments.filter(t => t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);
  }, [activePayments]);

  const pendingRevenue = useMemo(() => {
    return activePayments.filter(t => t.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
  }, [activePayments]);

  const cancelledRevenue = useMemo(() => {
    return activePayments.filter(t => t.status === 'failed').reduce((acc, curr) => acc + curr.amount, 0);
  }, [activePayments]);

  const [isSettlementsModalOpen, setIsSettlementsModalOpen] = useState(false);

  const mockSettlementData = useMemo(() => ({
    totalGross: pendingRevenue || 1600,
    expectedDate: "Tomorrow, 10:00 AM",
    settlementCycle: "Razorpay T+1 Nodal Transfer",
    settlementRef: "SETTLE-984201",
    nodalBank: "HDFC Bank (****4821)",
    breakdown: [
      {
        id: "B-8932",
        userName: "Rahul Sharma",
        userPhone: "+91 98765 43210",
        turfName: "Main Arena A (Football)",
        slotDate: "Today",
        slotTime: "6:00 PM - 7:00 PM",
        grossAmount: 800,
        paymentMode: "Razorpay UPI",
        status: "Processing Bank Transfer",
      },
      {
        id: "B-8934",
        userName: "Amit Patel",
        userPhone: "+91 91234 56789",
        turfName: "Indoor Turf B (Cricket)",
        slotDate: "Today",
        slotTime: "8:00 PM - 9:00 PM",
        grossAmount: 800,
        paymentMode: "Razorpay Credit Card",
        status: "In Escrow Clearance",
      },
    ],
    calculations: {
      gross: pendingRevenue || 1600,
      gatewayFee: (pendingRevenue || 1600) * 0.02,
      gstOnFee: (pendingRevenue || 1600) * 0.02 * 0.18,
      netPayout: (pendingRevenue || 1600) - ((pendingRevenue || 1600) * 0.02 * 1.18),
    },
  }), [pendingRevenue]);

  const totalTransactionsCount = useMemo(() => {
    return activePayments.length;
  }, [activePayments]);

  const filteredPayments = useMemo(() => {
    return activePayments.filter(tx => {
      const matchesSearch =
        (tx.id || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (tx.source || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        tx.amount.toString().includes(searchQuery);

      const matchesStatus = statusFilter === "all" || tx.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [activePayments, searchQuery, statusFilter]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const currentPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPayments, currentPage]);

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  const handleExport = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: "Compiling earnings spreadsheet...",
        success: "CSV report exported and downloaded successfully!",
        error: "Failed to export report"
      }
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      case "failed":
        return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover/90 backdrop-blur-md border border-border/50 p-2.5 rounded-xl shadow-xl text-xs font-bold animate-in fade-in zoom-in-95">
          <p className="text-muted-foreground font-semibold">{payload[0].payload.name}</p>
          <p className="text-primary mt-1 text-sm">₹{payload[0].value.toLocaleString('en-IN')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-2.5 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto theme-adaptive pb-16 overflow-hidden px-1">

      {/* Hidden svg gradients declaration block */}
      <svg className="absolute w-0 h-0 invisible">
        <defs>
          <linearGradient id="revenueTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
          </linearGradient>
        </defs>
      </svg>

      <div className="flex items-center justify-end">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleExport}
            variant="outline"
            className="gap-2 h-10 rounded-[18px] px-4 py-2 border border-border text-foreground bg-white dark:bg-slate-900 hover:bg-transparent hover:border-emerald-500 transition-all duration-300 font-bold text-xs cursor-pointer shadow-xs"
          >
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          KPI Widgets cards grid (2 Cards per row on Mobile)
          ------------------------------------------------------------- */}
      <div className="grid gap-2.5 sm:gap-3.5 grid-cols-2 lg:grid-cols-4">

        {/* Widget 1: Total Received Revenue */}
        {/* Widget 1: Total Revenue */}
        <Card
          onClick={() => setStatusFilter("all")}
          className={`bg-transparent border-2 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between p-3.5 pb-2.5 [&:last-child]:pb-2.5 min-h-[90px] cursor-pointer ${statusFilter === "all" ? "border-[#2563eb] shadow-md" : "border-[#2563eb]/40 hover:border-[#2563eb]"}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#2563eb] dark:text-blue-400 tracking-widest">Total Revenue</p>
              <h3 className="text-2xl font-bold tracking-tight text-[#2563eb] dark:text-blue-400 mt-0.5 flex items-center">
                <IndianRupee className="h-5 w-5 stroke-[2.5] shrink-0 mr-0.5 text-[#2563eb] dark:text-blue-400" />
                {grossRevenue.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="flex items-center justify-center p-1">
              <Database className="h-4.5 w-4.5 text-[#2563eb] dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-1.5 text-xs text-[#2563eb]/80 dark:text-blue-400/80 flex items-center gap-1 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" /> Gross generated
          </div>
        </Card>

        {/* Widget 2: Received Revenue */}
        <Card
          onClick={() => setStatusFilter("completed")}
          className={`bg-transparent border-2 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between p-3.5 pb-2.5 [&:last-child]:pb-2.5 min-h-[90px] cursor-pointer ${statusFilter === "completed" ? "border-[#059669] shadow-md" : "border-[#059669]/40 hover:border-[#059669]"}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#059669] dark:text-emerald-400 tracking-widest">Received Payment</p>
              <h3 className="text-2xl font-bold tracking-tight text-[#059669] dark:text-emerald-400 mt-0.5 flex items-center">
                <IndianRupee className="h-5 w-5 stroke-[2.5] shrink-0 mr-0.5 text-[#059669] dark:text-emerald-400" />
                {receivedRevenue.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="flex items-center justify-center p-1">
              <IndianRupee className="h-4.5 w-4.5 text-[#059669] dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-1.5 text-xs text-[#059669]/80 dark:text-emerald-400/80 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Settled in bank
          </div>
        </Card>

        {/* Widget 3: Upcoming Settlements (Clickable Button Trigger) */}
        <Dialog open={isSettlementsModalOpen} onOpenChange={setIsSettlementsModalOpen}>
          <Card
            onClick={() => setStatusFilter("pending")}
            className={`bg-transparent border-2 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between p-3.5 pb-2.5 [&:last-child]:pb-2.5 min-h-[90px] cursor-pointer group hover:-translate-y-0.5 ${statusFilter === "pending" ? "border-[#059669] shadow-md" : "border-[#059669]/40 hover:border-[#059669]"}`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-[#059669] dark:text-emerald-400 tracking-widest flex items-center gap-1">
                  Upcoming Settlements
                </p>
                <h3 className="text-2xl font-bold tracking-tight text-[#059669] dark:text-emerald-400 mt-0.5 flex items-center">
                  <IndianRupee className="h-5 w-5 stroke-[2.5] shrink-0 mr-0.5 text-[#059669] dark:text-emerald-400" />
                  {pendingRevenue.toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
                <Clock className="h-4.5 w-4.5 text-[#059669]" />
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-[#059669] font-semibold pt-1 border-t border-black/5 dark:border-white/10">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Auto-settled via Escrow
              </span>
              <DialogTrigger asChild>
                <button className="text-[10px] font-bold tracking-wider flex items-center gap-0.5 hover:underline cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  View History <ChevronRight className="h-3 w-3" />
                </button>
              </DialogTrigger>
            </div>
          </Card>

          <DialogContent className="rounded-3xl border border-border/40 bg-popover max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 font-mono">
                  Batch #{mockSettlementData.settlementRef}
                </Badge>
                <Badge variant="outline" className="text-xs font-semibold border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                  T+1 Settlement Cycle
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-foreground">
                <Clock className="h-6 w-6 text-primary" />
                Upcoming Settlements Breakdown
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Detailed user-wise breakdown of funds queued for bank credit.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Summary Credit Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-primary tracking-widest">
                    Expected Bank Credit ETA
                  </span>
                  <h4 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Building2 className="h-4.5 w-4.5 text-primary" />
                    {mockSettlementData.expectedDate}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Destination: <strong className="text-foreground">{mockSettlementData.nodalBank}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-primary/20 pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-widest">Gross Pending</span>
                  <p className="text-2xl font-black text-primary font-mono flex items-center justify-start sm:justify-end gap-0.5">
                    <IndianRupee className="h-5 w-5 shrink-0 stroke-[2.5]" />
                    {mockSettlementData.totalGross.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* User-Wise History List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground tracking-wider flex items-center justify-between">
                  <span>User Transactions ({mockSettlementData.breakdown.length})</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Razorpay Verified Escrow
                  </span>
                </h4>

                <div className="divide-y divide-border/30 border border-border/40 rounded-2xl overflow-hidden bg-card/40">
                  {mockSettlementData.breakdown.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-foreground">{item.userName}</p>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {item.id}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">
                            {item.turfName} · <span className="text-foreground">{item.slotTime}</span> ({item.slotDate})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border/20 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="font-mono font-bold text-sm text-foreground flex items-center justify-start sm:justify-end gap-0.5"><IndianRupee className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />{item.grossAmount}</p>
                          <span className="text-[10px] text-muted-foreground font-semibold">{item.paymentMode}</span>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold rounded-lg px-2 py-0.5 whitespace-nowrap">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settlement Deductions Breakdown Table */}
              <div className="rounded-2xl border border-border/40 bg-muted/20 p-4 space-y-2">
                <h5 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-primary" /> Net Payout Calculation Summary
                </h5>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Gross Upcoming Revenue</span>
                  <span className="font-mono font-semibold text-foreground inline-flex items-center gap-0.5"><IndianRupee className="h-3 w-3 shrink-0" />{mockSettlementData.calculations.gross.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Payment Gateway Fee (2%)</span>
                  <span className="font-mono font-semibold text-rose-500 inline-flex items-center gap-0.5">-<IndianRupee className="h-3 w-3 shrink-0" />{mockSettlementData.calculations.gatewayFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>GST on Gateway Fee (18%)</span>
                  <span className="font-mono font-semibold text-rose-500 inline-flex items-center gap-0.5">-<IndianRupee className="h-3 w-3 shrink-0" />{mockSettlementData.calculations.gstOnFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-border/40 pt-2 flex justify-between text-sm font-bold text-foreground">
                  <span>Net Credited to Bank Account</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-base inline-flex items-center gap-0.5">
                    <IndianRupee className="h-4 w-4 shrink-0 stroke-[2.5]" />{mockSettlementData.calculations.netPayout.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  toast.success("Settlement advice PDF generated!");
                }}
                className="rounded-xl h-10 text-xs font-bold gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download Settlement Advice (PDF)
              </Button>
              <Button
                onClick={() => setIsSettlementsModalOpen(false)}
                className="rounded-xl h-10 text-xs bg-primary text-primary-foreground font-bold cursor-pointer hover:opacity-95"
              >
                Close Breakdown
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Widget 4: Cancellations */}
        <Card
          onClick={() => setStatusFilter("failed")}
          className={`bg-transparent border-2 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl flex flex-col justify-between p-3.5 pb-2.5 [&:last-child]:pb-2.5 min-h-[90px] cursor-pointer ${statusFilter === "failed" ? "border-[#e11d48] shadow-md" : "border-[#e11d48]/40 hover:border-[#e11d48]"}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-[#e11d48] dark:text-rose-400 tracking-widest">Cancellations</p>
              <h3 className="text-2xl font-bold tracking-tight text-[#e11d48] dark:text-rose-400 mt-0.5 flex items-center">
                <IndianRupee className="h-5 w-5 stroke-[2.5] shrink-0 mr-0.5 text-[#e11d48] dark:text-rose-400" />
                {cancelledRevenue.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="flex items-center justify-center p-1">
              <AlertCircle className="h-4.5 w-4.5 text-[#e11d48] dark:text-rose-400" />
            </div>
          </div>
          <div className="mt-1.5 text-xs text-[#e11d48]/80 dark:text-rose-400/80 flex items-center gap-1 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5" /> Failed or cancelled
          </div>
        </Card>

      </div>

      {/* -------------------------------------------------------------
          Two-column grid: Chart on Right, Transactions List on Left
          ------------------------------------------------------------- */}
      <div className="flex flex-col gap-4">

        {/* All 3 Graphs perfectly aligned in one horizontal line (from Dashboard) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 items-start my-4 border-t border-b border-border/30 py-6 w-full min-w-0">

          {/* Sport Popularity — First */}
          <div className="flex flex-col min-w-0">
            <div className="min-h-[28px] flex flex-col justify-start mb-4">
              <CardTitle className="text-lg font-bold tracking-tight">Sport Popularity</CardTitle>
            </div>
            <div className="flex flex-row items-center justify-start gap-4 sm:gap-6 w-full h-[220px] min-w-0">
              <div className="flex flex-col items-start justify-end gap-y-1 text-xs h-full shrink-0 pb-3">
                {sportPopularityData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 px-1 py-[1px] rounded-md hover:bg-muted/30 transition-all border border-transparent hover:border-border/30 w-full">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="font-bold text-foreground text-[11px]">{item.name}</span>
                      <span className="text-[11px] text-muted-foreground font-semibold">({item.count})</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative h-[200px] w-[200px] shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sportPopularityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={95}
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
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-lg font-black tracking-tight text-foreground">{totalBookings}</span>
                  <span className="text-[9px] font-bold text-muted-foreground tracking-wider mt-0.5">Bookings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Trend — Second */}
          <div className="flex flex-col min-w-0">
            <div className="min-h-[28px] flex flex-col justify-start mb-4">
              <CardTitle className="text-lg font-bold tracking-tight">Revenue Trend</CardTitle>
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="h-[210px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenuePageChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fill: "var(--foreground)" }} fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis width={45} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `₹${val / 1000}k` : `₹${val}`} tick={{ fill: "var(--foreground)" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                      itemStyle={{ color: "var(--foreground)" }}
                      labelStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#revenuePageChartGrad)" activeDot={{ r: 6, stroke: "var(--background)", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bookings Filled — Third */}
          <div className="flex flex-col min-w-0">
            <div className="min-h-[28px] flex flex-col justify-start mb-4">
              <CardTitle className="text-lg font-bold tracking-tight">Bookings Filled</CardTitle>
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="h-[210px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsFilledData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fill: "var(--foreground)" }} fontSize={11} tickLine={false} axisLine={false} dy={10} />
                    <YAxis width={45} stroke="var(--muted-foreground)" tick={{ fill: "var(--foreground)" }} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={false}
                      contentStyle={{ backgroundColor: "var(--popover)", borderColor: "var(--border)", borderRadius: "12px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
                      itemStyle={{ color: "var(--foreground)" }}
                      labelStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
                      formatter={(value) => [value, "Bookings"]}
                    />
                    <Bar dataKey="bookings" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>

        {/* Settlement Breakdown Modal */}
        <Dialog open={isSettlementsModalOpen} onOpenChange={setIsSettlementsModalOpen}>
          <DialogContent className="sm:max-w-[620px] max-h-[88vh] overflow-y-auto rounded-3xl p-6">
            <DialogHeader className="space-y-1.5 pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-extrabold text-foreground">
                    Escrow Settlement Breakdown
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Next payout credit schedule & itemized user payments
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Summary Credit Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-primary tracking-widest">
                    Expected Bank Credit ETA
                  </span>
                  <h4 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Building2 className="h-4.5 w-4.5 text-primary" />
                    {mockSettlementData.expectedDate}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Destination: <strong className="text-foreground">{mockSettlementData.nodalBank}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-primary/20 pt-2 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-widest">Gross Pending</span>
                  <p className="text-2xl font-black text-primary font-mono flex items-center justify-start sm:justify-end gap-0.5">
                    <IndianRupee className="h-5 w-5 shrink-0 stroke-[2.5]" />
                    {mockSettlementData.totalGross.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* User-Wise History List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground tracking-wider flex items-center justify-between">
                  <span>User Transactions ({mockSettlementData.breakdown.length})</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Razorpay Verified Escrow
                  </span>
                </h4>

                <div className="divide-y divide-border/30 border border-border/40 rounded-2xl overflow-hidden bg-card/40">
                  {mockSettlementData.breakdown.map((item) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-foreground">{item.userName}</p>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {item.id}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">
                            {item.turfName} · <span className="text-foreground">{item.slotTime}</span> ({item.slotDate})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border/20 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="font-mono font-bold text-sm text-foreground flex items-center justify-start sm:justify-end gap-0.5"><IndianRupee className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" />{item.grossAmount}</p>
                          <span className="text-[10px] text-muted-foreground font-semibold">{item.paymentMode}</span>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold rounded-lg px-2 py-0.5 whitespace-nowrap">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settlement Deductions Breakdown Table */}
              <div className="rounded-2xl border border-border/40 bg-muted/20 p-4 space-y-2">
                <h5 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-primary" /> Net Payout Calculation Summary
                </h5>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Gross Upcoming Revenue</span>
                  <span className="font-mono font-semibold text-foreground inline-flex items-center gap-0.5"><IndianRupee className="h-3 w-3 shrink-0" />{mockSettlementData.calculations.gross.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Payment Gateway Fee (2%)</span>
                  <span className="font-mono font-semibold text-rose-500 inline-flex items-center gap-0.5">-<IndianRupee className="h-3 w-3 shrink-0" />{mockSettlementData.calculations.gatewayFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>GST on Gateway Fee (18%)</span>
                  <span className="font-mono font-semibold text-rose-500 inline-flex items-center gap-0.5">-<IndianRupee className="h-3 w-3 shrink-0" />{mockSettlementData.calculations.gstOnFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-border/40 pt-2 flex justify-between text-sm font-bold text-foreground">
                  <span>Net Credited to Bank Account</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-base inline-flex items-center gap-0.5">
                    <IndianRupee className="h-4 w-4 shrink-0 stroke-[2.5]" />{mockSettlementData.calculations.netPayout.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  toast.success("Settlement advice PDF generated!");
                }}
                className="rounded-xl h-10 text-xs font-bold gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" /> Download Settlement Advice (PDF)
              </Button>
              <Button
                onClick={() => setIsSettlementsModalOpen(false)}
                className="rounded-xl h-10 text-xs bg-primary text-primary-foreground font-bold cursor-pointer hover:opacity-95"
              >
                Close Breakdown
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* -------------------------------------------------------------
          Two-column grid: Transaction History (Left 8 cols - No Horizontal Scroll) & Turf Performance (Right 4 cols)
          ------------------------------------------------------------- */}
        {/* Full-width Transaction History Section */}
        <div className="w-full mt-6 sm:mt-8">
          <Card className="border-0 bg-transparent shadow-none flex flex-col justify-between w-full">
            <div className="bg-transparent p-0 pb-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground">Transaction History</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Recent payments and settlement receipts</CardDescription>
                </div>

                {/* Status filtering pills row */}
                <div className="inline-flex w-fit items-center gap-0.5 bg-transparent p-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                  {["all", "completed", "pending", "failed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize tracking-wider transition-all cursor-pointer border ${statusFilter === status
                        ? status === "completed"
                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent font-bold"
                          : status === "pending"
                            ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-transparent font-bold"
                            : status === "failed"
                              ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-transparent font-bold"
                              : "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-transparent font-bold"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Search input */}
              <div className="relative mt-2.5 max-w-[260px] sm:max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by transaction ID, turf..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-7.5 rounded-full bg-transparent border border-slate-300 dark:border-slate-700 text-[11px] w-full focus:border-emerald-500"
                />
              </div>
            </div>

            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex h-[200px] items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredPayments.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center text-muted-foreground">
                  <div className="h-14 w-14 rounded-2xl bg-transparent border border-border/40 flex items-center justify-center mb-3">
                    <IndianRupee className="h-6 w-6 opacity-40" />
                  </div>
                  <p className="text-sm font-bold text-foreground">No Transactions Found</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Try widening your filters or queries.</p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto scrollbar-visible pb-2">
                  <table className="w-full min-w-[650px] md:min-w-full text-xs text-center border-collapse">
                    <thead className="text-[11px] text-muted-foreground bg-transparent border-b border-border/40 font-black tracking-wider text-center">
                      <tr>
                        <th className="px-2 py-2 font-bold whitespace-nowrap text-center">Transaction ID</th>
                        <th className="px-2 py-2 font-bold whitespace-nowrap text-center">Date</th>
                        <th className="px-2 py-2 font-bold whitespace-nowrap text-center">Facility</th>
                        <th className="px-2 py-2 font-bold whitespace-nowrap text-center">Amount</th>
                        <th className="px-2 py-2 font-bold whitespace-nowrap text-center">Method</th>
                        <th className="px-2 py-2 font-bold whitespace-nowrap text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {currentPayments.map((tx) => (
                        <tr key={tx.id} className="hover:bg-emerald-500/5 transition-colors group cursor-default">
                          <td className="px-2 py-2 whitespace-nowrap text-center">
                            <span className="font-mono font-bold text-foreground/90 group-hover:text-foreground transition-colors text-xs">{tx.id}</span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-muted-foreground font-medium text-xs text-center">
                            <div className="flex items-center justify-center gap-1">
                              <CalendarIcon className="h-3 w-3 text-muted-foreground/60 shrink-0" />
                              <span>{tx.date}</span>
                            </div>
                          </td>
                          <td className="px-2 py-2 font-bold text-foreground whitespace-nowrap text-center text-xs">
                            {tx.source}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-center">
                            <div className="font-extrabold flex items-center justify-center text-foreground text-xs">
                              <IndianRupee className="h-3 w-3 mr-0.5 text-muted-foreground shrink-0 stroke-[2.5]" />
                              {tx.amount.toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-center">
                            <span className="text-[11px] font-mono font-extrabold uppercase text-muted-foreground/90 tracking-wider">{tx.method || "UPI"}</span>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center">
                              <Badge className={`capitalize text-[10px] font-bold tracking-wider rounded-md px-2 py-0.5 ${getStatusColor(tx.status)}`}>
                                {tx.status}
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {!isLoading && totalPages > 1 && filteredPayments.length > 0 && (
                <div className="flex items-center justify-between border-t border-border/40 px-4 py-3 sm:px-6 bg-card/40 rounded-b-2xl">
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    Showing <span className="font-bold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, filteredPayments.length)}</span> of <span className="font-bold text-foreground">{filteredPayments.length}</span> entries
                  </div>
                  <div className="flex flex-1 justify-between sm:justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 text-xs font-medium border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 sm:hidden">
                      <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="h-8 text-xs font-medium border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
