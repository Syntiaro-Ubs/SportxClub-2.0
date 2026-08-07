import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  FileText,
  Search,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  IndianRupee,
  CalendarDays,
  TrendingUp,
  CalendarIcon,
  Printer,
  FileSpreadsheet,
  FileCheck,
  ChevronDown,
  Lock,
  Building,
  ShieldAlert,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "../../components/ui/select";
import { toast } from "sonner";
import { adminApi } from "../../services/admin-api";
import { turfService } from "../../services/turf.service";

// Fallback seed reports if DB is empty
const fallbackReports = [
  { id: "TRX-8924", player: "Rahul Sharma", turf: "Premium Green Turf", sport: "Football", date: "2026-08-06", time: "18:00 - 20:00", amount: 1500, status: "Success", type: "Booking", paymentMethod: "UPI" },
  { id: "TRX-8923", player: "Amit Patel", turf: "Skyline Arena", sport: "Cricket", date: "2026-08-06", time: "07:00 - 09:00", amount: 2000, status: "Cancelled", type: "Booking", paymentMethod: "UPI" },
  { id: "TRX-8922", player: "Sneha Reddy", turf: "Elite Sports Club", sport: "Tennis", date: "2026-08-06", time: "06:00 - 07:00", amount: 800, status: "Success", type: "Booking", paymentMethod: "Card" },
  { id: "TRX-8921", player: "Kiran Kumar", turf: "Downtown Court", sport: "Basketball", date: "2026-08-05", time: "19:00 - 20:00", amount: 1200, status: "Refunded", type: "Booking", paymentMethod: "Net Banking" },
  { id: "TRX-8920", player: "Priya Singh", turf: "Premium Green Turf", sport: "Football", date: "2026-08-05", time: "20:00 - 21:00", amount: 1500, status: "Pending", type: "Booking", paymentMethod: "UPI" },
  { id: "TRX-8919", player: "Vikram Rathore", turf: "Elite Sports Club", sport: "Badminton", date: "2026-08-04", time: "17:00 - 18:00", amount: 600, status: "Success", type: "Booking", paymentMethod: "Cash" },
  { id: "TRX-8918", player: "Ananya Desai", turf: "Skyline Arena", sport: "Tennis", date: "2026-08-04", time: "16:00 - 18:00", amount: 1800, status: "Success", type: "Booking", paymentMethod: "UPI" }
];

export function OwnerReport() {
  const [dbBookings, setDbBookings] = useState([]);
  const [dbTurfs, setDbTurfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [reportType, setReportType] = useState("all"); // 'all', 'bookings', 'cancellations', 'schedule'
  const [statusFilter, setStatusFilter] = useState("All"); // 'All', 'Success', 'Cancelled', 'Pending', 'Refunded'
  const [periodPreset, setPeriodPreset] = useState("month"); // 'today', 'yesterday', 'week', 'month', 'single-date', 'custom-range'
  
  // Particular Date & Date Range Selectors
  const [singleDate, setSingleDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-01"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load bookings and turfs from MySQL
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [bookingsData, turfsData] = await Promise.all([
          adminApi.getAll("bookings").catch(() => []),
          turfService.getAll().catch(() => []),
        ]);

        setDbTurfs(turfsData || []);

        if (bookingsData && bookingsData.length > 0) {
          const mapped = bookingsData.map((b) => ({
            id: b.booking_code || `TRX-${b.id}`,
            player: b.user_name || b.customerName || "Customer",
            turf: b.turf_name || b.venue || "Turf Arena",
            sport: b.sport || "Sports",
            date: b.date ? (b.date.includes("T") ? b.date.split("T")[0] : b.date) : format(new Date(), "yyyy-MM-dd"),
            time: b.time_slot || b.slot_time || b.time || "N/A",
            amount: Number(b.amount || 0),
            status: String(b.status || "Confirmed").toLowerCase() === "confirmed" ? "Success" : b.status,
            type: "Booking",
            paymentMethod: b.payment_method || b.payment_type || "UPI",
          }));
          setDbBookings(mapped);
        } else {
          setDbBookings(fallbackReports);
        }
      } catch (err) {
        console.error("Failed fetching report data:", err);
        setDbBookings(fallbackReports);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Standardize date comparison helper
  const isDateMatch = (rowDateStr) => {
    if (!rowDateStr) return false;
    let rDate;
    try {
      if (rowDateStr.includes("-")) {
        rDate = parseISO(rowDateStr);
      } else {
        rDate = new Date(rowDateStr);
      }
    } catch (e) {
      return false;
    }

    if (isNaN(rDate.getTime())) return true; // fallback match

    const todayObj = new Date();
    const todayStr = format(todayObj, "yyyy-MM-dd");

    if (periodPreset === "today") {
      return format(rDate, "yyyy-MM-dd") === todayStr;
    }
    if (periodPreset === "yesterday") {
      const yest = new Date();
      yest.setDate(todayObj.getDate() - 1);
      return format(rDate, "yyyy-MM-dd") === format(yest, "yyyy-MM-dd");
    }
    if (periodPreset === "single-date") {
      return format(rDate, "yyyy-MM-dd") === singleDate;
    }
    if (periodPreset === "custom-range") {
      const rYmd = format(rDate, "yyyy-MM-dd");
      return rYmd >= startDate && rYmd <= endDate;
    }
    if (periodPreset === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(todayObj.getDate() - 7);
      return rDate >= weekAgo;
    }
    if (periodPreset === "month") {
      return rDate.getMonth() === todayObj.getMonth() && rDate.getFullYear() === todayObj.getFullYear();
    }
    return true; // 'all'
  };

  // Generate Turf Schedule & Open/Closed Report Rows
  const turfScheduleRows = useMemo(() => {
    const activeDate = periodPreset === "single-date" ? singleDate : format(new Date(), "yyyy-MM-dd");
    
    // Default fallback turfs if dbTurfs is empty
    const sourceTurfs = dbTurfs.length > 0 ? dbTurfs : [
      { id: 1, name: "Shri", location: "Pune", sport_type: "Tennis", status: "Active" },
      { id: 2, name: "Premium Green Turf", location: "Mumbai", sport_type: "Football", status: "Active" },
      { id: 3, name: "Skyline Arena", location: "Mumbai", sport_type: "Cricket", status: "Closed" },
      { id: 4, name: "Elite Sports Club", location: "Pune", sport_type: "Tennis", status: "Active" },
      { id: 5, name: "Downtown Court", location: "Nagpur", sport_type: "Basketball", status: "Maintenance" },
    ];

    return sourceTurfs.map((t) => {
      const isClosed = String(t.status || "").toLowerCase() === "closed";
      const isMaintenance = String(t.status || "").toLowerCase() === "maintenance";

      let opStatus = "Open";
      let reason = "Normal Operational Hours (06:00 AM - 11:00 PM)";

      if (isClosed) {
        opStatus = "Closed";
        reason = "Venue Closed by Turf Owner";
      } else if (isMaintenance) {
        opStatus = "Maintenance";
        reason = "Scheduled Turf Maintenance & Lawn Grooming";
      }

      return {
        id: `TURF-${t.id}`,
        turfName: t.name || "Turf Arena",
        location: typeof t.location === "object" ? (t.location?.city || t.location?.address || "Location unavailable") : t.location || "City Venue",
        sport: t.sport_type || t.sportType || "Multi-Sport",
        date: activeDate,
        operatingHours: isClosed ? "Closed All Day" : "06:00 AM - 11:00 PM",
        status: opStatus,
        reason: reason,
      };
    });
  }, [dbTurfs, periodPreset, singleDate]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    if (reportType === "schedule") {
      return turfScheduleRows.filter((item) => {
        const searchLower = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !searchLower ||
          item.turfName.toLowerCase().includes(searchLower) ||
          item.id.toLowerCase().includes(searchLower) ||
          item.location.toLowerCase().includes(searchLower) ||
          item.sport.toLowerCase().includes(searchLower);

        const matchesStatus =
          statusFilter === "All" ||
          item.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      });
    }

    return dbBookings.filter((item) => {
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        item.player.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower) ||
        item.turf.toLowerCase().includes(searchLower) ||
        item.sport.toLowerCase().includes(searchLower);

      const matchesStatus =
        statusFilter === "All" ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesReportType =
        reportType === "all" ||
        (reportType === "bookings" && item.status === "Success") ||
        (reportType === "cancellations" && (item.status === "Cancelled" || item.status === "Refunded"));

      const matchesDate = isDateMatch(item.date);

      return matchesSearch && matchesStatus && matchesReportType && matchesDate;
    });
  }, [dbBookings, turfScheduleRows, searchQuery, statusFilter, reportType, periodPreset, singleDate, startDate, endDate]);

  // Compute Summary Metrics
  const summaryMetrics = useMemo(() => {
    if (reportType === "schedule") {
      let openCount = 0;
      let closedCount = 0;
      let maintenanceCount = 0;

      turfScheduleRows.forEach((row) => {
        if (row.status === "Open") openCount++;
        else if (row.status === "Closed") closedCount++;
        else if (row.status === "Maintenance") maintenanceCount++;
      });

      return {
        totalTurfs: turfScheduleRows.length,
        openCount,
        closedCount,
        maintenanceCount,
      };
    }

    let totalRevenue = 0;
    let successfulCount = 0;
    let cancelledCount = 0;
    let refundAmount = 0;

    filteredData.forEach((row) => {
      if (row.status === "Success" || row.status === "Confirmed") {
        totalRevenue += row.amount;
        successfulCount++;
      } else if (row.status === "Cancelled") {
        cancelledCount++;
      } else if (row.status === "Refunded") {
        refundAmount += row.amount;
      }
    });

    return {
      totalRevenue,
      successfulCount,
      cancelledCount,
      refundAmount,
    };
  }, [filteredData, turfScheduleRows, reportType]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, reportType, periodPreset, singleDate, startDate, endDate]);

  const currentReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  // Get active date filter label for CSV / PDF titles
  const getDateRangeLabel = () => {
    if (periodPreset === "today") return `Today (${format(new Date(), "MMM d, yyyy")})`;
    if (periodPreset === "yesterday") {
      const yest = new Date();
      yest.setDate(new Date().getDate() - 1);
      return `Yesterday (${format(yest, "MMM d, yyyy")})`;
    }
    if (periodPreset === "single-date") return `Date: ${singleDate}`;
    if (periodPreset === "custom-range") return `Range: ${startDate} to ${endDate}`;
    if (periodPreset === "week") return "This Week";
    if (periodPreset === "month") return `Month of ${format(new Date(), "MMMM yyyy")}`;
    return "All Time";
  };

  // Export CSV / Excel Download
  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast.error("No report data available to export for selected filter.");
      return;
    }

    const reportLabel = getDateRangeLabel();
    const csvRows = [];

    if (reportType === "schedule") {
      // Turf Schedule Report Header
      csvRows.push(`"SPORTXCLUB TURF OPERATING SCHEDULE & CLOSED/OPEN DATES REPORT"`);
      csvRows.push(`"Report Period: ${reportLabel}"`);
      csvRows.push(`"Generated On: ${new Date().toLocaleString()}"`);
      csvRows.push(`"Total Turfs: ${summaryMetrics.totalTurfs}"`);
      csvRows.push(`"Open & Operating: ${summaryMetrics.openCount}"`);
      csvRows.push(`"Closed / Maintenance: ${summaryMetrics.closedCount + summaryMetrics.maintenanceCount}"`);
      csvRows.push("");

      const headers = ["Turf ID", "Turf Name", "Location", "Sport", "Date", "Operating Hours", "Status", "Reason / Remarks"];
      csvRows.push(headers.join(","));

      filteredData.forEach((row) => {
        csvRows.push([
          `"${row.id}"`,
          `"${row.turfName}"`,
          `"${row.location}"`,
          `"${row.sport}"`,
          `"${row.date}"`,
          `"${row.operatingHours}"`,
          `"${row.status}"`,
          `"${row.reason}"`
        ].join(","));
      });
    } else {
      // Financial / Booking Statement Header
      csvRows.push(`"SPORTXCLUB TURF FINANCIAL STATEMENT REPORT"`);
      csvRows.push(`"Report Period: ${reportLabel}"`);
      csvRows.push(`"Generated On: ${new Date().toLocaleString()}"`);
      csvRows.push(`"Total Revenue: Rs.${summaryMetrics.totalRevenue}"`);
      csvRows.push(`"Successful Bookings: ${summaryMetrics.successfulCount}"`);
      csvRows.push(`"Cancellations: ${summaryMetrics.cancelledCount}"`);
      csvRows.push(`"Refunds Processed: Rs.${summaryMetrics.refundAmount}"`);
      csvRows.push("");

      const headers = ["Transaction ID", "Customer Name", "Turf Venue", "Sport", "Date", "Slot Time", "Amount (INR)", "Payment Method", "Status"];
      csvRows.push(headers.join(","));

      filteredData.forEach((row) => {
        csvRows.push([
          `"${row.id}"`,
          `"${row.player}"`,
          `"${row.turf}"`,
          `"${row.sport}"`,
          `"${row.date}"`,
          `"${row.time}"`,
          row.amount,
          `"${row.paymentMethod}"`,
          `"${row.status}"`
        ].join(","));
      });
    }

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `Turf_${reportType === "schedule" ? "Schedule_Report" : "Statement_Report"}_${periodPreset}_${periodPreset === "single-date" ? singleDate : format(new Date(), "yyyyMMdd")}.csv`;

    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Report downloaded successfully: ${filename}`);
  };

  // Print Statement / PDF View
  const handlePrintReport = () => {
    if (filteredData.length === 0) {
      toast.error("No report data available to print.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups to print reports.");
      return;
    }

    const reportLabel = getDateRangeLabel();

    const isScheduleReport = reportType === "schedule";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${isScheduleReport ? "Turf Operating Schedule & Closed Dates Report" : "Turf Financial Statement"} - ${reportLabel}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 25px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 24px; font-weight: 800; color: #065f46; margin: 0; }
            .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 15px; }
            .card-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            .card-value { font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: 700; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge-success { color: #15803d; font-weight: 700; }
            .badge-cancelled { color: #b91c1c; font-weight: 700; }
            .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #94a3b8; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">${isScheduleReport ? "TURF OPERATING SCHEDULE & CLOSED DATES REPORT" : "SPORTXCLUB FINANCIAL STATEMENT"}</h1>
              <div class="subtitle">Turf Management Platform • ${reportLabel}</div>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              Generated: ${new Date().toLocaleString()}
            </div>
          </div>

          <div class="metrics-grid">
            ${isScheduleReport ? `
              <div class="card">
                <div class="card-label">Total Turfs</div>
                <div class="card-value">${summaryMetrics.totalTurfs}</div>
              </div>
              <div class="card">
                <div class="card-label">Open & Operating</div>
                <div class="card-value" style="color: #15803d;">${summaryMetrics.openCount}</div>
              </div>
              <div class="card">
                <div class="card-label">Closed Turfs</div>
                <div class="card-value" style="color: #b91c1c;">${summaryMetrics.closedCount}</div>
              </div>
              <div class="card">
                <div class="card-label">Under Maintenance</div>
                <div class="card-value" style="color: #d97706;">${summaryMetrics.maintenanceCount}</div>
              </div>
            ` : `
              <div class="card">
                <div class="card-label">Total Revenue</div>
                <div class="card-value">₹${summaryMetrics.totalRevenue.toLocaleString()}</div>
              </div>
              <div class="card">
                <div class="card-label">Successful Bookings</div>
                <div class="card-value">${summaryMetrics.successfulCount}</div>
              </div>
              <div class="card">
                <div class="card-label">Cancellations</div>
                <div class="card-value">${summaryMetrics.cancelledCount}</div>
              </div>
              <div class="card">
                <div class="card-label">Refunds Processed</div>
                <div class="card-value">₹${summaryMetrics.refundAmount.toLocaleString()}</div>
              </div>
            `}
          </div>

          <h3>Report Breakdown (${filteredData.length} records)</h3>
          <table>
            <thead>
              ${isScheduleReport ? `
                <tr>
                  <th>Turf ID</th>
                  <th>Turf Name</th>
                  <th>Location & Sport</th>
                  <th>Date</th>
                  <th>Operating Hours</th>
                  <th>Operational Status</th>
                  <th>Remarks / Reason</th>
                </tr>
              ` : `
                <tr>
                  <th>Transaction ID</th>
                  <th>Player / Customer</th>
                  <th>Turf Venue</th>
                  <th>Sport</th>
                  <th>Date & Slot Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              `}
            </thead>
            <tbody>
              ${isScheduleReport ? filteredData.map(r => `
                <tr>
                  <td><strong>${r.id}</strong></td>
                  <td>${r.turfName}</td>
                  <td>${r.location} (${r.sport})</td>
                  <td>${r.date}</td>
                  <td>${r.operatingHours}</td>
                  <td class="${r.status === 'Open' ? 'badge-success' : 'badge-cancelled'}">${r.status}</td>
                  <td>${r.reason}</td>
                </tr>
              `).join('') : filteredData.map(r => `
                <tr>
                  <td><strong>${r.id}</strong></td>
                  <td>${r.player}</td>
                  <td>${r.turf}</td>
                  <td>${r.sport}</td>
                  <td>${r.date} (${r.time})</td>
                  <td><strong>₹${r.amount}</strong></td>
                  <td class="${r.status === 'Success' ? 'badge-success' : 'badge-cancelled'}">${r.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Confidential Turf Owner Report • Generated via SportXClub Platform
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Success":
      case "Open":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-none font-semibold gap-1"><CheckCircle2 className="w-3 h-3" /> {status === "Open" ? "Open" : "Success"}</Badge>;
      case "Cancelled":
      case "Closed":
        return <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-none font-semibold gap-1"><XCircle className="w-3 h-3" /> {status === "Closed" ? "Closed" : "Cancelled"}</Badge>;
      case "Maintenance":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-none font-semibold gap-1"><Lock className="w-3 h-3" /> Maintenance</Badge>;
      case "Refunded":
        return <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-none font-semibold gap-1"><RefreshCcw className="w-3 h-3" /> Refunded</Badge>;
      case "Pending":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-none font-semibold gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-full overflow-x-hidden"
    >
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-500" />
            Reports & Statement History
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Filter, inspect, and download financial statements or turf operating schedules & closed/open dates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download CSV / Excel */}
          <Button
            onClick={exportToCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV / Excel
          </Button>

          {/* Print / Download PDF Statement */}
          <Button
            onClick={handlePrintReport}
            variant="outline"
            className="border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-foreground font-bold text-xs h-9 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-emerald-500" />
            Print / PDF Statement
          </Button>
        </div>
      </div>

      {/* Interactive Report Selector & Date Filter Controls */}
      <Card className="border border-border/50 bg-card/60 backdrop-blur-md rounded-2xl shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* 1. Report Category Selector */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                1. Report Category
              </label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="h-9 rounded-xl text-xs font-semibold bg-background border-border/60">
                  <SelectValue placeholder="Select Report Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="text-xs font-semibold">📊 All Financial Transactions</SelectItem>
                  <SelectItem value="bookings" className="text-xs font-semibold">⚽ Successful Bookings & Sales</SelectItem>
                  <SelectItem value="cancellations" className="text-xs font-semibold">❌ Cancellations & Refunds</SelectItem>
                  <SelectItem value="schedule" className="text-xs font-semibold">🔒 Turf Operating Schedule & Open/Closed Dates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. Period Filter Selector */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                2. Time Period
              </label>
              <Select value={periodPreset} onValueChange={setPeriodPreset}>
                <SelectTrigger className="h-9 rounded-xl text-xs font-semibold bg-background border-border/60">
                  <SelectValue placeholder="Select Time Frame" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="today" className="text-xs font-semibold">📅 Today ({format(new Date(), "MMM d")})</SelectItem>
                  <SelectItem value="yesterday" className="text-xs font-semibold">⏪ Yesterday</SelectItem>
                  <SelectItem value="single-date" className="text-xs font-semibold">📌 Particular Date (Single Day)</SelectItem>
                  <SelectItem value="week" className="text-xs font-semibold">🗓️ Past 7 Days</SelectItem>
                  <SelectItem value="month" className="text-xs font-semibold">📆 This Month ({format(new Date(), "MMMM")})</SelectItem>
                  <SelectItem value="custom-range" className="text-xs font-semibold">🔍 Custom Date Range (Start - End)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Particular Date / Date Range Specific Inputs */}
            <div className="md:col-span-4 space-y-1">
              {periodPreset === "single-date" && (
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Pick Particular Date
                  </label>
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    className="w-full h-9 rounded-xl text-xs font-bold bg-background border border-emerald-500/60 px-3 outline-none focus:ring-2 focus:ring-emerald-500/20 text-foreground cursor-pointer shadow-xs"
                  />
                </div>
              )}

              {periodPreset === "custom-range" && (
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                    Date Range (Start to End)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-1/2 h-9 rounded-xl text-[11px] font-bold bg-background border border-border/60 px-2 text-foreground"
                    />
                    <span className="text-xs font-bold text-muted-foreground">-</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-1/2 h-9 rounded-xl text-[11px] font-bold bg-background border border-border/60 px-2 text-foreground"
                    />
                  </div>
                </div>
              )}

              {periodPreset !== "single-date" && periodPreset !== "custom-range" && (
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                    Active Filter Period
                  </label>
                  <div className="h-9 px-3 rounded-xl border border-border/40 bg-muted/30 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                    {getDateRangeLabel()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Summary Metric Cards */}
      {reportType === "schedule" ? (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card className="p-3.5 border border-border/40 bg-card rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Total Turfs</span>
              <Building className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {summaryMetrics.totalTurfs}
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                Registered turf venues
              </p>
            </div>
          </Card>

          <Card className="p-3.5 border border-border/40 bg-card rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Open & Operating</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {summaryMetrics.openCount}
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                Active for player bookings
              </p>
            </div>
          </Card>

          <Card className="p-3.5 border border-border/40 bg-card rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Closed Venues</span>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-400 tracking-tight">
                {summaryMetrics.closedCount}
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                Closed by turf owner
              </p>
            </div>
          </Card>

          <Card className="p-3.5 border border-border/40 bg-card rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Under Maintenance</span>
              <Lock className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                {summaryMetrics.maintenanceCount}
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                Scheduled turf servicing
              </p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <Card className="p-3.5 border border-border/40 bg-card rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Period Revenue</span>
              <div className="h-7 w-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <IndianRupee className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5" />
                {summaryMetrics.totalRevenue.toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                Filtered for {getDateRangeLabel()}
              </p>
            </div>
          </Card>

          <Card className="p-3.5 border border-border/40 bg-card rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Successful Bookings</span>
              <div className="h-7 w-7 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {summaryMetrics.successfulCount}
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                Confirmed bookings count
              </p>
            </div>
          </Card>

          <Card className="p-3.5 border border-border/40 bg-card rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Cancellations</span>
              <div className="h-7 w-7 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-400">
                <XCircle className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {summaryMetrics.cancelledCount}
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                Cancelled reservations
              </p>
            </div>
          </Card>

          <Card className="p-3.5 border border-border/40 bg-card rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Refund Processed</span>
              <div className="h-7 w-7 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <RefreshCcw className="h-4 w-4" />
              </div>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5" />
                {summaryMetrics.refundAmount.toLocaleString()}
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                Total refund payouts
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Transaction History / Operating Schedule Data Table */}
      <Card className="border border-border/40 bg-card rounded-2xl shadow-lg overflow-hidden">
        <CardHeader className="p-4 border-b border-border/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
                {reportType === "schedule" ? "Turf Operating & Closed/Open Dates" : "Detailed Statement Rows"}
                <Badge variant="outline" className="text-[10px] font-bold">
                  {filteredData.length} records found
                </Badge>
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-60">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search turf, player, ID or city..."
                  className="pl-8 h-9 text-xs bg-muted/40 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex bg-muted/50 p-1 rounded-xl border border-border/40">
                {(reportType === "schedule" ? ["All", "Open", "Closed", "Maintenance"] : ["All", "Success", "Cancelled", "Pending"]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      statusFilter === status
                        ? "bg-background shadow-xs text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="w-full text-center border-collapse">
              <TableHeader className="bg-muted/40 text-[11px] uppercase tracking-wider">
                {reportType === "schedule" ? (
                  <TableRow>
                    <TableHead className="text-center font-extrabold">Turf ID</TableHead>
                    <TableHead className="text-center font-extrabold">Turf Name</TableHead>
                    <TableHead className="text-center font-extrabold">Location & Sport</TableHead>
                    <TableHead className="text-center font-extrabold">Operating Date</TableHead>
                    <TableHead className="text-center font-extrabold">Operating Hours</TableHead>
                    <TableHead className="text-center font-extrabold">Status</TableHead>
                    <TableHead className="text-center font-extrabold">Remarks / Reason</TableHead>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableHead className="text-center font-extrabold">Transaction ID</TableHead>
                    <TableHead className="text-center font-extrabold">Player / Customer</TableHead>
                    <TableHead className="text-center font-extrabold">Turf & Sport</TableHead>
                    <TableHead className="text-center font-extrabold">Date & Time</TableHead>
                    <TableHead className="text-center font-extrabold">Amount</TableHead>
                    <TableHead className="text-center font-extrabold">Method</TableHead>
                    <TableHead className="text-center font-extrabold">Status</TableHead>
                  </TableRow>
                )}
              </TableHeader>
              <TableBody>
                {currentReports.map((trx) => (
                  <TableRow key={trx.id} className="hover:bg-muted/30 transition-colors">
                    {reportType === "schedule" ? (
                      <>
                        <TableCell className="font-mono text-xs font-bold text-center">{trx.id}</TableCell>
                        <TableCell className="font-bold text-xs text-center">{trx.turfName}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-xs font-semibold">{trx.location}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold">{trx.sport}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-center">{trx.date}</TableCell>
                        <TableCell className="text-xs font-mono font-bold text-center">{trx.operatingHours}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center text-center">
                            {getStatusBadge(trx.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium text-center">{trx.reason}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-mono text-xs font-bold text-center">{trx.id}</TableCell>
                        <TableCell className="font-semibold text-center text-xs">{trx.player}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-xs font-bold">{trx.turf}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold">{trx.sport}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-xs font-semibold">{trx.date}</span>
                            <span className="text-[10px] text-muted-foreground font-semibold">{trx.time}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-xs text-center">
                          <span className="flex items-center justify-center">
                            <IndianRupee className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" />
                            {trx.amount}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-semibold text-center">
                          {trx.paymentMethod}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center text-center">
                            {getStatusBadge(trx.status)}
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}

                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={reportType === "schedule" ? 7 : 7} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <FileText className="w-8 h-8 text-muted-foreground/40" />
                        <span className="font-bold text-sm">No report records found</span>
                        <span className="text-xs text-muted-foreground">Try changing the date filter or report category above.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {filteredData.length > 0 && (
            <div className="flex items-center justify-between border-t border-border/40 px-4 py-3 bg-muted/20">
              <div className="text-xs text-muted-foreground font-medium hidden sm:block">
                Showing <span className="font-bold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-foreground">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-bold text-foreground">{filteredData.length}</span> entries
              </div>
              <div className="flex flex-1 justify-between sm:justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 text-xs font-semibold border-border/60 hover:border-emerald-500"
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
                  className="h-8 text-xs font-semibold border-border/60 hover:border-emerald-500"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
