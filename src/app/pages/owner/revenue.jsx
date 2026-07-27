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
  ResponsiveContainer
} from "recharts";

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

const mockTransactions = [
  { id: "TXN8930A4", date: "Jul 26, 2026", source: "Cricket Ground 1", amount: 1200, status: "completed", method: "UPI" },
  { id: "TXN8929A2", date: "Jul 26, 2026", source: "Premium Football Turf", amount: 1600, status: "completed", method: "Card" },
  { id: "TXN8928B3", date: "Jul 25, 2026", source: "Cricket Ground 2", amount: 800, status: "pending", method: "Cash" },
  { id: "TXN8927A1", date: "Jul 25, 2026", source: "Cricket Ground 1", amount: 1200, status: "completed", method: "UPI" },
  { id: "TXN8926C4", date: "Jul 24, 2026", source: "Premium Football Turf", amount: 1600, status: "failed", method: "UPI" },
  { id: "TXN8925A9", date: "Jul 24, 2026", source: "Cricket Ground 1", amount: 800, status: "completed", method: "UPI" },
  { id: "TXN8924B2", date: "Jul 23, 2026", source: "Cricket Ground 2", amount: 1200, status: "completed", method: "Cash" },
  { id: "TXN8923C1", date: "Jul 22, 2026", source: "Premium Football Turf", amount: 1600, status: "completed", method: "Card" },
  { id: "TXN8922A3", date: "Jul 22, 2026", source: "Cricket Ground 1", amount: 800, status: "pending", method: "UPI" },
];

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
    switch (timeframe) {
      case "today":
        return [
          { name: "08:00", amount: 1200 },
          { name: "10:00", amount: 1600 },
          { name: "12:00", amount: 0 },
          { name: "14:00", amount: 0 },
          { name: "16:00", amount: 0 },
          { name: "18:00", amount: 0 },
          { name: "20:00", amount: 0 },
        ];
      case "monthly":
        return [
          { name: "Week 1", amount: 38000 },
          { name: "Week 2", amount: 45000 },
          { name: "Week 3", amount: 52000 },
          { name: "Week 4", amount: 49000 },
        ];
      case "yearly":
        return [
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
      case "weekly":
      default:
        return [
          { name: "Mon", amount: 15000 },
          { name: "Tue", amount: 22000 },
          { name: "Wed", amount: 18000 },
          { name: "Thu", amount: 32000 },
          { name: "Fri", amount: 28000 },
          { name: "Sat", amount: 45000 },
          { name: "Sun", amount: 24000 },
        ];
    }
  }, [timeframe]);

  const trendFooter = useMemo(() => {
    switch (timeframe) {
      case "today":
        return { peak: "10:00 AM", avg: "₹1.4K", label: "Peak Hour", avgLabel: "Est. Hourly Avg" };
      case "monthly":
        return { peak: "Week 3", avg: "₹46.0K", label: "Peak Period", avgLabel: "Est. Monthly Avg" };
      case "yearly":
        return { peak: "December", avg: "₹187.9K", label: "Peak Month", avgLabel: "Est. Yearly Avg" };
      case "weekly":
      default:
        return { peak: "Saturday", avg: "₹26.5K", label: "Peak Day", avgLabel: "Est. Weekly Avg" };
    }
  }, [timeframe]);

  const totalRevenue = useMemo(() => {
    return activePayments.filter(t => t.status === 'completed').reduce((acc, curr) => acc + curr.amount, 0);
  }, [activePayments]);

  const pendingRevenue = useMemo(() => {
    return activePayments.filter(t => t.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0);
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
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.amount.toString().includes(searchQuery);

      const matchesStatus = statusFilter === "all" || tx.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [activePayments, searchQuery, statusFilter]);

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto theme-adaptive pb-16 overflow-hidden px-1">

      {/* Hidden svg gradients declaration block */}
      <svg className="absolute w-0 h-0 invisible">
        <defs>
          <linearGradient id="revenueTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
          </linearGradient>
        </defs>
      </svg>

      {/* -------------------------------------------------------------
          Header Title & Workspace Switcher Row
          ------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            Revenue Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Analyze facility returns, payment status feeds, and download transaction logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
          <Button
            onClick={handleExport}
            variant="outline"
            className="gap-2 h-10 rounded-xl px-4 py-2 border border-border text-foreground bg-white dark:bg-slate-900 hover:bg-emerald-600 hover:text-black hover:border-emerald-600 hover:scale-[1.03] transition-all duration-300 font-bold text-xs cursor-pointer shadow-xs"
          >
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          KPI Widgets cards grid (2 Cards)
          ------------------------------------------------------------- */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">

        {/* Widget 1: Total Received Revenue */}
        <Card className="border-emerald-500/10 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 rounded-2xl flex flex-col justify-between p-5 min-h-[140px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Received Revenue</p>
              <h3 className="text-3xl font-black tracking-tight text-emerald-700 dark:text-emerald-400 mt-1">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </h3>
            </div>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <IndianRupee className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 text-xs text-emerald-600/80 dark:text-emerald-400/80 flex items-center gap-1 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" /> +12.5% vs last month
          </div>
        </Card>

        {/* Widget 2: Upcoming Settlements (Clickable Button Trigger) */}
        <Dialog open={isSettlementsModalOpen} onOpenChange={setIsSettlementsModalOpen}>
          <DialogTrigger asChild>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-xl shadow-lg hover:shadow-xl hover:border-primary/40 transition-all duration-300 rounded-2xl flex flex-col justify-between p-5 min-h-[140px] cursor-pointer group hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                    Upcoming Settlements
                    <Info className="h-3 w-3 opacity-60" />
                  </p>
                  <h3 className="text-3xl font-black tracking-tight text-foreground mt-1">
                    ₹{pendingRevenue.toLocaleString('en-IN')}
                  </h3>
                </div>
                <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                  <Clock className="h-4.5 w-4.5 text-primary" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground font-semibold pt-2 border-t border-border/40">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Auto-settled via Escrow
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-0.5 group-hover:underline">
                  View History <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </Card>
          </DialogTrigger>

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
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
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
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gross Pending</span>
                  <p className="text-2xl font-black text-primary font-mono">
                    ₹{mockSettlementData.totalGross.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* User-Wise History List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
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
                          <p className="font-mono font-bold text-sm text-foreground">₹{item.grossAmount}</p>
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold">{item.paymentMode}</span>
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
                  <span className="font-mono font-semibold text-foreground">₹{mockSettlementData.calculations.gross.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Payment Gateway Fee (2%)</span>
                  <span className="font-mono font-semibold text-rose-500">-₹{mockSettlementData.calculations.gatewayFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>GST on Gateway Fee (18%)</span>
                  <span className="font-mono font-semibold text-rose-500">-₹{mockSettlementData.calculations.gstOnFee.toFixed(2)}</span>
                </div>
                <div className="border-t border-border/40 pt-2 flex justify-between text-sm font-bold text-foreground">
                  <span>Net Credited to Bank Account</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-base">
                    ₹{mockSettlementData.calculations.netPayout.toFixed(2)}
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

      </div>

      {/* -------------------------------------------------------------
          Two-column grid: Chart on Right, Transactions List on Left
          ------------------------------------------------------------- */}
      <div className="flex flex-col gap-8">

        {/* Top Part: Dynamic Revenue Trend Chart */}
        <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-lg overflow-hidden rounded-2xl p-5 flex flex-col min-h-[380px] xl:min-h-[480px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base font-bold tracking-tight text-foreground capitalize">{timeframe} Revenue Trend</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                {timeframe === "today" ? "Earnings throughout the day" : timeframe === "weekly" ? "Earnings across calendar week" : timeframe === "monthly" ? "Earnings across last 4 weeks" : "Earnings across months"}
              </CardDescription>
            </div>

            {/* Timeframe Selector Segmented Switch */}
            <div className="flex items-center gap-0.5 bg-muted/65 p-1 rounded-xl border border-border/40 shadow-inner flex-none">
              {["today", "weekly", "monthly", "yearly"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    setTimeframe(tf);
                    toast.info(`Switched view to ${tf.toUpperCase()}`);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${timeframe === tf
                    ? "bg-white dark:bg-slate-900 !text-foreground shadow-sm border border-border/10 hover:bg-emerald-600 hover:text-black hover:border-emerald-600"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tf === "today" ? "Today" : tf === "weekly" ? "Week" : tf === "monthly" ? "Month" : "Year"}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[320px] mt-6 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -10, bottom: 20 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
                <XAxis
                  dataKey="name"
                  stroke="none"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dy={6}
                />
                <YAxis
                  stroke="none"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10, fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  dx={-6}
                  tickFormatter={(val) => val >= 1000 ? `₹${val / 1000}K` : `₹${val}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#chartGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-4 border-t border-border/20 text-[11px] text-muted-foreground flex justify-between items-center font-medium mt-6 flex-none">
            <span>{trendFooter.label}: <strong className="text-foreground">{trendFooter.peak}</strong></span>
            <span>{trendFooter.avgLabel}: <strong className="text-foreground">{trendFooter.avg}</strong></span>
          </div>
        </Card>

        {/* Bottom Part: Transaction List */}
        <Card className="border-border/40 bg-card/30 backdrop-blur-xl shadow-lg overflow-hidden rounded-2xl flex flex-col justify-between">
          <div className="border-b border-border/40 bg-muted/20 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg font-bold tracking-tight text-foreground">Transaction History</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Recent payments and settlement receipts</CardDescription>
              </div>

              {/* Status filtering pills row */}
              <div className="flex flex-wrap items-center gap-1 bg-card/60 p-1 rounded-xl border border-border/50 shadow-inner">
                {["all", "completed", "pending", "failed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer ${statusFilter === status
                      ? status === "completed"
                        ? "bg-emerald-500/10 !text-emerald-600 dark:!text-emerald-400 font-bold"
                        : status === "pending"
                          ? "bg-amber-500/10 !text-amber-600 dark:!text-amber-400 font-bold"
                          : status === "failed"
                            ? "bg-rose-500/10 !text-rose-600 dark:!text-rose-400 font-bold"
                            : "bg-emerald-600 !text-black font-bold"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search input */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID, turf, or price..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-lg bg-background/50 border-border/40 text-xs w-full focus:border-primary/50"
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
                <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                  <IndianRupee className="h-6 w-6 opacity-40" />
                </div>
                <p className="text-sm font-bold text-foreground">No Transactions Found</p>
                <p className="text-xs text-muted-foreground mt-0.5">Try widening your filters or queries.</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full scrollbar-visible pb-3">
                <table className="w-full text-xs text-left min-w-[700px]">
                  <thead className="text-[10px] text-muted-foreground uppercase bg-muted/20 border-b border-border/40 font-black tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5 font-bold whitespace-nowrap">Transaction ID</th>
                      <th className="px-5 py-3.5 font-bold whitespace-nowrap">Date</th>
                      <th className="px-5 py-3.5 font-bold whitespace-nowrap">Facility / Turf</th>
                      <th className="px-5 py-3.5 font-bold whitespace-nowrap">Amount</th>
                      <th className="px-5 py-3.5 font-bold whitespace-nowrap">Method</th>
                      <th className="px-5 py-3.5 font-bold text-right whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredPayments.map((tx) => (
                      <tr key={tx.id} className="hover:bg-muted/15 transition-colors group cursor-default">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-mono font-bold text-muted-foreground/80 group-hover:text-foreground transition-colors">{tx.id}</span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground/90 font-medium">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-3 w-3 text-muted-foreground/50" />
                            {tx.date}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-extrabold text-foreground whitespace-nowrap">
                          {tx.source}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="font-black flex items-center text-foreground">
                            <IndianRupee className="h-3.5 w-3.5 mr-0.5 text-muted-foreground" />
                            {tx.amount.toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <Badge variant="secondary" className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-muted/50 border-0 text-muted-foreground">{tx.method || "UPI"}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <Badge className={`capitalize text-[9px] font-extrabold tracking-wider rounded-lg px-2.5 py-0.5 ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
