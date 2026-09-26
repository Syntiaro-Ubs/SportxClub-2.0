import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Search,
  RefreshCw,
  Download,
  Eye,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  DollarSign,
  Ban,
  Activity,
  Calendar,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ShieldCheck,
  Zap,
  Percent,
  FileSpreadsheet,
  FileText,
  Info,
  CalendarRange
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { adminApi } from "../../services/admin-api";

const CACHE_KEY = "sportx_turf_reports_cache";

function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateStr);
  }
}

// Helper: Check if a date/timestamp falls within the selected period filter
function isDateInPeriod(dateOrTimestamp, period, customStart, customEnd) {
  if (!period || period === "all") return true;
  if (!dateOrTimestamp) return false;

  const now = new Date();
  const todayYMD = now.toISOString().slice(0, 10);
  const todayLocal = now.toLocaleDateString("en-CA"); // YYYY-MM-DD

  let d;
  try {
    d = new Date(dateOrTimestamp);
    if (isNaN(d.getTime())) return false;
  } catch {
    return false;
  }

  const dYMD = d.toISOString().slice(0, 10);
  const dLocal = d.toLocaleDateString("en-CA");

  if (period === "today") {
    return (
      dYMD === todayYMD ||
      dLocal === todayLocal ||
      String(dateOrTimestamp).startsWith(todayYMD) ||
      String(dateOrTimestamp).startsWith(todayLocal)
    );
  }

  if (period === "7days") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    return d >= sevenDaysAgo;
  }

  if (period === "1month" || period === "month" || period === "30days") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    const isSameMonthYear = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return d >= thirtyDaysAgo || isSameMonthYear;
  }

  if (period === "custom") {
    if (customStart && customEnd) {
      const s = new Date(customStart);
      s.setHours(0, 0, 0, 0);
      const e = new Date(customEnd);
      e.setHours(23, 59, 59, 999);
      return d >= s && d <= e;
    } else if (customStart) {
      const s = new Date(customStart);
      s.setHours(0, 0, 0, 0);
      return d >= s;
    } else if (customEnd) {
      const e = new Date(customEnd);
      e.setHours(23, 59, 59, 999);
      return d <= e;
    }
    return true;
  }

  return true;
}

export function TurfReportsView() {
  const [data, setData] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(!data);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Global Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all"); // "all" | "today" | "1month" | "7days" | "custom"
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [sortBy, setSortBy] = useState("bookings_desc"); // bookings_desc, revenue_desc, cancellations_desc, newest, name

  // Modal inspection (Particular Turf)
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [isTurfModalOpen, setIsTurfModalOpen] = useState(false);
  const [modalPeriodFilter, setModalPeriodFilter] = useState("inherit"); // "inherit" | "all" | "today" | "1month" | "7days" | "custom"
  const [modalCustomStart, setModalCustomStart] = useState("");
  const [modalCustomEnd, setModalCustomEnd] = useState("");
  const [modalStatusFilter, setModalStatusFilter] = useState("all");
  const [modalSearchTerm, setModalSearchTerm] = useState("");

  const loadReports = async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const res = await fetch("/api/admin/reports/turfs-summary", {
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json();

      if (json && json.success) {
        setData(json);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(json));
        } catch {}
        setLastRefreshed(new Date());
        if (isManual) toast.success("Turf reports refreshed successfully!");
      } else {
        await fallbackClientAggregation();
      }
    } catch (err) {
      console.warn("Report API fetch error, executing client fallback:", err);
      await fallbackClientAggregation();
    } finally {
      setLoading(false);
    }
  };

  const fallbackClientAggregation = async () => {
    try {
      const [allTurfs, allBookings, allOwners] = await Promise.all([
        adminApi.getAll("turfs").catch(() => []),
        adminApi.getAll("bookings").catch(() => []),
        adminApi.getAll("onboarding").catch(() => []),
      ]);

      const turfsList = Array.isArray(allTurfs) ? allTurfs : [];
      const bookingsList = Array.isArray(allBookings) ? allBookings : [];
      const ownersList = Array.isArray(allOwners) ? allOwners : [];

      const todayYMD = new Date().toISOString().slice(0, 10);
      const isToday = (dt) => {
        if (!dt) return false;
        try {
          return new Date(dt).toISOString().slice(0, 10) === todayYMD;
        } catch {
          return false;
        }
      };

      const todayTurfs = turfsList.filter((t) => isToday(t.created_at));
      const todayOwners = ownersList.filter((o) => isToday(o.created_at || o.joined_date));

      const fallbackData = {
        success: true,
        kpiSummary: {
          todayTurfsOnboarded: todayTurfs.length,
          todayOwnersOnboarded: todayOwners.length,
          totalTurfs: turfsList.length,
          activeTurfs: turfsList.filter((t) => (t.status || "").toLowerCase() === "active").length,
          totalBookings: bookingsList.length,
          confirmedBookings: 0,
          cancelledBookings: 0,
          reservedSlots: 0,
          cancellationRate: 0,
          totalRevenue: 0,
          cancelledRevenue: 0,
        },
        rawTurfs: turfsList,
        rawBookings: bookingsList,
        todayOnboardedTurfs: todayTurfs,
        allBookingsLedger: bookingsList,
      };

      setData(fallbackData);
      setLastRefreshed(new Date());
    } catch (e) {
      console.error("Fallback error:", e);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Raw datasets
  const rawTurfs = data?.turfsReports || data?.rawTurfs || [];
  const rawBookings = data?.allBookingsLedger || data?.rawBookings || [];
  const todayTurfsList = data?.todayOnboardedTurfs || [];

  // Dynamically compute Global Period-Filtered Bookings & KPIs
  const { periodBookings, periodKPIs, periodTurfsReports, periodCancellationReasons } = useMemo(() => {
    const filteredBookings = rawBookings.filter((b) => {
      const bDate = b.date || b.created_at;
      return (
        isDateInPeriod(bDate, periodFilter, customStartDate, customEndDate) ||
        isDateInPeriod(b.created_at, periodFilter, customStartDate, customEndDate)
      );
    });

    let confirmedCount = 0;
    let cancelledCount = 0;
    let reservedCount = 0;
    let totalRev = 0;
    let cancelledRev = 0;
    const reasonCounts = {};

    filteredBookings.forEach((b) => {
      const amt = parseFloat(b.amount) || 0;
      const st = String(b.status || "").trim().toLowerCase();

      if (st === "confirmed" || st === "completed") {
        confirmedCount += 1;
        totalRev += amt;
      } else if (st === "cancelled" || st === "canceled") {
        cancelledCount += 1;
        cancelledRev += amt;
        const r = b.cancellation_reason || "Customer Cancellation / Unspecified";
        reasonCounts[r] = (reasonCounts[r] || 0) + 1;
      } else if (st === "reserved" || st === "maintenance" || st === "blocked") {
        reservedCount += 1;
      }
    });

    const totalBookingsCount = filteredBookings.length;
    const cancelRate = totalBookingsCount > 0
      ? Number(((cancelledCount / totalBookingsCount) * 100).toFixed(1))
      : 0;

    const turfMap = new Map();

    rawTurfs.forEach((t) => {
      const tid = t.turfId || t.id;
      turfMap.set(tid, {
        turfId: tid,
        turfName: t.turfName || t.name,
        location: t.location || "Not specified",
        sportType: t.sportType || t.sport_type || "Multi-sport",
        pricePerHour: parseFloat(t.pricePerHour || t.price_per_hour) || 0,
        rating: parseFloat(t.rating) || 4.5,
        status: t.status || "Active",
        ownerName: t.ownerName || t.owner_name || "N/A",
        ownerEmail: t.ownerEmail || t.owner_email || "",
        ownerPhone: t.ownerPhone || t.owner_phone || "",
        createdAt: t.createdAt || t.created_at,
        isOnboardedToday: Boolean(t.isOnboardedToday),
        imageUrl: t.imageUrl || t.image_url || "",
        totalBookings: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        reservedSlots: 0,
        totalRevenue: 0,
        cancelledRevenue: 0,
        cancellationRate: 0,
        averageBookingValue: 0,
        allTurfBookings: [],
      });
    });

    filteredBookings.forEach((b) => {
      let matchedTurf = null;
      if (b.turf_id && turfMap.has(Number(b.turf_id))) {
        matchedTurf = turfMap.get(Number(b.turf_id));
      } else if (b.turf_name) {
        const cleanName = b.turf_name.trim().toLowerCase();
        for (const item of turfMap.values()) {
          if (item.turfName?.trim().toLowerCase() === cleanName) {
            matchedTurf = item;
            break;
          }
        }
      }

      if (!matchedTurf) {
        const legacyKey = `legacy_${b.turf_name || "Unknown"}`;
        if (!turfMap.has(legacyKey)) {
          turfMap.set(legacyKey, {
            turfId: b.turf_id || null,
            turfName: b.turf_name || "Legacy / Unlisted Turf",
            location: "Historical Venue",
            sportType: b.sport || "Multi-Sport",
            pricePerHour: 0,
            rating: 4.5,
            status: "Archived",
            ownerName: "Historical Record",
            ownerEmail: "",
            ownerPhone: "",
            createdAt: b.created_at,
            isOnboardedToday: false,
            imageUrl: "",
            totalBookings: 0,
            confirmedBookings: 0,
            cancelledBookings: 0,
            reservedSlots: 0,
            totalRevenue: 0,
            cancelledRevenue: 0,
            cancellationRate: 0,
            averageBookingValue: 0,
            allTurfBookings: [],
          });
        }
        matchedTurf = turfMap.get(legacyKey);
      }

      matchedTurf.totalBookings += 1;
      const amt = parseFloat(b.amount) || 0;
      const st = String(b.status || "").trim().toLowerCase();

      if (st === "confirmed" || st === "completed") {
        matchedTurf.confirmedBookings += 1;
        matchedTurf.totalRevenue += amt;
      } else if (st === "cancelled" || st === "canceled") {
        matchedTurf.cancelledBookings += 1;
        matchedTurf.cancelledRevenue += amt;
      } else if (st === "reserved" || st === "maintenance" || st === "blocked") {
        matchedTurf.reservedSlots += 1;
      }

      matchedTurf.allTurfBookings.push(b);
    });

    const periodReports = Array.from(turfMap.values()).map((t) => {
      t.cancellationRate = t.totalBookings > 0
        ? Number(((t.cancelledBookings / t.totalBookings) * 100).toFixed(1))
        : 0;
      t.averageBookingValue = t.confirmedBookings > 0
        ? Math.round(t.totalRevenue / t.confirmedBookings)
        : 0;
      return t;
    });

    const reasonsList = Object.entries(reasonCounts).map(([reason, count]) => ({
      reason,
      count,
      percentage: cancelledCount > 0 ? Math.round((count / cancelledCount) * 100) : 0,
    }));

    return {
      periodBookings: filteredBookings,
      periodKPIs: {
        todayTurfsOnboarded: data?.kpiSummary?.todayTurfsOnboarded ?? todayTurfsList.length,
        todayOwnersOnboarded: data?.kpiSummary?.todayOwnersOnboarded ?? 0,
        totalTurfs: data?.kpiSummary?.totalTurfs ?? rawTurfs.length,
        activeTurfs: data?.kpiSummary?.activeTurfs ?? rawTurfs.filter((t) => (t.status || "").toLowerCase() === "active").length,
        totalBookings: totalBookingsCount,
        confirmedBookings: confirmedCount,
        cancelledBookings: cancelledCount,
        reservedSlots: reservedCount,
        cancellationRate: cancelRate,
        totalRevenue: totalRev,
        cancelledRevenue: cancelledRev,
      },
      periodTurfsReports: periodReports,
      periodCancellationReasons: reasonsList,
    };
  }, [rawTurfs, rawBookings, periodFilter, customStartDate, customEndDate, data, todayTurfsList]);

  // Filtered & Sorted Turfs Performance Matrix
  const filteredTurfs = useMemo(() => {
    return periodTurfsReports
      .filter((turf) => {
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          const matchName = (turf.turfName || "").toLowerCase().includes(term);
          const matchLoc = (turf.location || "").toLowerCase().includes(term);
          const matchOwner = (turf.ownerName || "").toLowerCase().includes(term);
          const matchSport = (turf.sportType || "").toLowerCase().includes(term);
          if (!matchName && !matchLoc && !matchOwner && !matchSport) return false;
        }

        if (selectedSport !== "all") {
          const turfSports = (turf.sportType || "").toLowerCase();
          if (!turfSports.includes(selectedSport.toLowerCase())) return false;
        }

        if (selectedStatus !== "all") {
          if ((turf.status || "").toLowerCase() !== selectedStatus.toLowerCase()) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "today_first") {
          if (a.isOnboardedToday && !b.isOnboardedToday) return -1;
          if (!a.isOnboardedToday && b.isOnboardedToday) return 1;
          return b.totalBookings - a.totalBookings;
        }
        if (sortBy === "bookings_desc") return b.totalBookings - a.totalBookings;
        if (sortBy === "revenue_desc") return b.totalRevenue - a.totalRevenue;
        if (sortBy === "cancellations_desc") return b.cancelledBookings - a.cancelledBookings;
        if (sortBy === "rate_desc") return b.cancellationRate - a.cancellationRate;
        if (sortBy === "name_asc") return (a.turfName || "").localeCompare(b.turfName || "");
        if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        return 0;
      });
  }, [periodTurfsReports, searchTerm, selectedSport, selectedStatus, sortBy]);

  // Particular Turf Modal Bookings Calculation (Dynamically reacts to Modal Period Filters)
  const activeModalPeriod = modalPeriodFilter === "inherit" ? periodFilter : modalPeriodFilter;
  const activeModalCustomStart = modalPeriodFilter === "inherit" ? customStartDate : modalCustomStart;
  const activeModalCustomEnd = modalPeriodFilter === "inherit" ? customEndDate : modalCustomEnd;

  const modalFilteredTurfData = useMemo(() => {
    if (!selectedTurf) return null;

    // Filter raw bookings for this particular turf
    const turfBookings = rawBookings.filter((b) => {
      const matchTurf =
        (selectedTurf.turfId && Number(b.turf_id) === Number(selectedTurf.turfId)) ||
        (b.turf_name && b.turf_name.trim().toLowerCase() === selectedTurf.turfName?.trim().toLowerCase());
      if (!matchTurf) return false;

      const bDate = b.date || b.created_at;
      return (
        isDateInPeriod(bDate, activeModalPeriod, activeModalCustomStart, activeModalCustomEnd) ||
        isDateInPeriod(b.created_at, activeModalPeriod, activeModalCustomStart, activeModalCustomEnd)
      );
    });

    // Sub-filter by status & search in modal
    const visibleBookings = turfBookings.filter((b) => {
      const st = String(b.status || "").toLowerCase();
      if (modalStatusFilter === "confirmed" && st !== "confirmed" && st !== "completed") return false;
      if (modalStatusFilter === "cancelled" && st !== "cancelled" && st !== "canceled") return false;
      if (modalStatusFilter === "reserved" && st !== "reserved" && st !== "maintenance" && st !== "blocked") return false;

      if (modalSearchTerm.trim()) {
        const term = modalSearchTerm.toLowerCase().trim();
        const matchCode = (b.booking_code || "").toLowerCase().includes(term);
        const matchUser = (b.user_name || "").toLowerCase().includes(term);
        const matchEmail = (b.user_email || "").toLowerCase().includes(term);
        const matchPhone = (b.user_phone || "").toLowerCase().includes(term);
        if (!matchCode && !matchUser && !matchEmail && !matchPhone) return false;
      }

      return true;
    });

    let confirmed = 0;
    let cancelled = 0;
    let reserved = 0;
    let rev = 0;
    let loss = 0;

    turfBookings.forEach((b) => {
      const amt = parseFloat(b.amount) || 0;
      const st = String(b.status || "").toLowerCase();
      if (st === "confirmed" || st === "completed") {
        confirmed += 1;
        rev += amt;
      } else if (st === "cancelled" || st === "canceled") {
        cancelled += 1;
        loss += amt;
      } else if (st === "reserved" || st === "maintenance" || st === "blocked") {
        reserved += 1;
      }
    });

    const total = turfBookings.length;
    const cancelRate = total > 0 ? Number(((cancelled / total) * 100).toFixed(1)) : 0;

    return {
      allPeriodBookings: turfBookings,
      visibleBookings,
      kpis: {
        total,
        confirmed,
        cancelled,
        reserved,
        totalRevenue: rev,
        cancelledRevenue: loss,
        cancellationRate: cancelRate,
      },
    };
  }, [selectedTurf, rawBookings, activeModalPeriod, activeModalCustomStart, activeModalCustomEnd, modalStatusFilter, modalSearchTerm]);

  const getPeriodLabel = (period, start, end) => {
    if (period === "today") return "Today";
    if (period === "1month") return "This Month (1 Month)";
    if (period === "7days") return "Last 7 Days";
    if (period === "custom") {
      if (start && end) return `Custom (${start} to ${end})`;
      if (start) return `Custom (From ${start})`;
      if (end) return `Custom (Until ${end})`;
      return "Custom Date Range";
    }
    return "All Time";
  };

  // ==========================================
  // EXPORT 1: PARTICULAR TURF EXCEL (CSV)
  // ==========================================
  const handleExportParticularTurfCSV = (turf, fromModal = false) => {
    const targetTurf = turf || selectedTurf;
    if (!targetTurf) {
      toast.error("Please select a turf to export.");
      return;
    }

    // If exported from modal, use the exact visible filtered bookings list from the modal
    const bookingsToExport = fromModal && modalFilteredTurfData
      ? modalFilteredTurfData.visibleBookings
      : (targetTurf.allTurfBookings || rawBookings.filter((b) => {
          const matchTurf =
            (targetTurf.turfId && Number(b.turf_id) === Number(targetTurf.turfId)) ||
            (b.turf_name && b.turf_name.trim().toLowerCase() === targetTurf.turfName?.trim().toLowerCase());
          if (!matchTurf) return false;
          const bDate = b.date || b.created_at;
          return (
            isDateInPeriod(bDate, periodFilter, customStartDate, customEndDate) ||
            isDateInPeriod(b.created_at, periodFilter, customStartDate, customEndDate)
          );
        }));

    const periodName = fromModal
      ? getPeriodLabel(activeModalPeriod, activeModalCustomStart, activeModalCustomEnd)
      : globalPeriodLabel;

    const statusLabel = fromModal
      ? (modalStatusFilter === "all" ? "All Statuses" : modalStatusFilter === "confirmed" ? "Confirmed Only" : modalStatusFilter === "cancelled" ? "Cancelled Only" : "Reserved Only")
      : (selectedStatus === "all" ? "All Statuses" : selectedStatus);

    const headers = [
      "Booking Code",
      "Turf Name",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Booking Date",
      "Time Slot",
      "Sport",
      "Amount (INR)",
      "Payment Method",
      "Status",
      "Cancellation Reason",
      "Booking Created At",
      "Report Period",
      "Status Filter",
    ];

    const rows = bookingsToExport.map((b) => [
      b.booking_code || `#${b.id}`,
      `"${(targetTurf.turfName || b.turf_name || "").replace(/"/g, '""')}"`,
      `"${(b.user_name || "Reserved / Blocked").replace(/"/g, '""')}"`,
      `"${(b.user_email || "").replace(/"/g, '""')}"`,
      `"${(b.user_phone || "").replace(/"/g, '""')}"`,
      b.date || "N/A",
      `"${(b.time_slot || b.slot_time || "").replace(/"/g, '""')}"`,
      `"${(b.sport || targetTurf.sportType || "").replace(/"/g, '""')}"`,
      parseFloat(b.amount) || 0,
      `"${(b.payment_method || b.payment_type || "UPI").replace(/"/g, '""')}"`,
      b.status || "Confirmed",
      `"${(b.cancellation_reason || "").replace(/"/g, '""')}"`,
      formatDateDisplay(b.created_at),
      `"${periodName}"`,
      `"${statusLabel}"`,
    ]);

    const cleanTurfName = (targetTurf.turfName || "turf").toLowerCase().replace(/[^a-z0-9]/gi, "_");
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${cleanTurfName}-report-${fromModal ? activeModalPeriod : periodFilter}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported Excel/CSV for ${targetTurf.turfName} (${bookingsToExport.length} records)!`);
  };

  // ==========================================
  // EXPORT 2: PARTICULAR TURF PDF REPORT
  // ==========================================
  const handleExportParticularTurfPDF = (turf, fromModal = false) => {
    const targetTurf = turf || selectedTurf;
    if (!targetTurf) {
      toast.error("Please select a turf to export.");
      return;
    }

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // If exported from modal, use the exact visible filtered bookings list from the modal
      const bookingsList = fromModal && modalFilteredTurfData
        ? modalFilteredTurfData.visibleBookings
        : (targetTurf.allTurfBookings || rawBookings.filter((b) => {
            const matchTurf =
              (targetTurf.turfId && Number(b.turf_id) === Number(targetTurf.turfId)) ||
              (b.turf_name && b.turf_name.trim().toLowerCase() === targetTurf.turfName?.trim().toLowerCase());
            if (!matchTurf) return false;
            const bDate = b.date || b.created_at;
            return (
              isDateInPeriod(bDate, periodFilter, customStartDate, customEndDate) ||
              isDateInPeriod(b.created_at, periodFilter, customStartDate, customEndDate)
            );
          }));

      const periodName = fromModal
        ? getPeriodLabel(activeModalPeriod, activeModalCustomStart, activeModalCustomEnd)
        : globalPeriodLabel;

      const statusLabel = fromModal
        ? (modalStatusFilter === "all" ? "All Statuses" : modalStatusFilter === "confirmed" ? "Confirmed Only" : modalStatusFilter === "cancelled" ? "Cancelled Only" : "Reserved Only")
        : (selectedStatus === "all" ? "All Statuses" : selectedStatus);

      // Calculate statistics strictly for the bookings in this report
      let confirmedCount = 0;
      let cancelledCount = 0;
      let reservedCount = 0;
      let totalRevenueAmt = 0;
      let cancelledRevenueAmt = 0;

      bookingsList.forEach((b) => {
        const amt = parseFloat(b.amount) || 0;
        const st = String(b.status || "").toLowerCase();
        if (st === "confirmed" || st === "completed") {
          confirmedCount += 1;
          totalRevenueAmt += amt;
        } else if (st === "cancelled" || st === "canceled") {
          cancelledCount += 1;
          cancelledRevenueAmt += amt;
        } else if (st === "reserved" || st === "maintenance" || st === "blocked") {
          reservedCount += 1;
        }
      });

      const totalCount = bookingsList.length;
      const cancelRate = totalCount > 0 ? Number(((cancelledCount / totalCount) * 100).toFixed(1)) : 0;

      // 1. Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 26, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.text("SportXClub - Turf Performance Report", 14, 12);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Official Venue Analytics & Booking Audit Ledger | Generated: ${new Date().toLocaleString()}`, 14, 19);

      // 2. Turf Details Box
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.roundedRect(14, 32, 182, 30, 3, 3, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(String(targetTurf.turfName || "Sports Venue"), 18, 40);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Location: ${targetTurf.location || "N/A"}  |  Sport: ${targetTurf.sportType || "Multi-sport"}  |  Rate: Rs. ${targetTurf.pricePerHour || 0}/hr`, 18, 46);
      doc.text(`Owner: ${targetTurf.ownerName || "N/A"}  |  Email: ${targetTurf.ownerEmail || "N/A"}  |  Phone: ${targetTurf.ownerPhone || "N/A"}`, 18, 52);
      doc.text(`Period: ${periodName}  |  Status Filter: ${statusLabel}  ${fromModal && modalSearchTerm ? `| Search: "${modalSearchTerm}"` : ""}`, 18, 58);

      // 3. KPI Summary Bar (4 mini boxes)
      const startY = 67;
      const boxW = 43;
      const boxH = 17;

      // Box 1: Total Bookings in this report
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, startY, boxW, boxH, 2, 2, "F");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("REPORT RECORDS", 18, startY + 5.5);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(String(totalCount), 18, startY + 13);

      // Box 2: Confirmed Slots
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.roundedRect(60, startY, boxW, boxH, 2, 2, "F");
      doc.setFontSize(7.5);
      doc.setTextColor(5, 150, 105);
      doc.text("CONFIRMED SLOTS", 64, startY + 5.5);
      doc.setFontSize(12);
      doc.setTextColor(4, 120, 87);
      doc.text(String(confirmedCount), 64, startY + 13);

      // Box 3: Cancelled Slots
      doc.setFillColor(255, 241, 242); // rose-50
      doc.roundedRect(106, startY, boxW, boxH, 2, 2, "F");
      doc.setFontSize(7.5);
      doc.setTextColor(225, 29, 72);
      doc.text("CANCELLED SLOTS", 110, startY + 5.5);
      doc.setFontSize(12);
      doc.setTextColor(190, 18, 60);
      doc.text(`${cancelledCount} (${cancelRate}%)`, 110, startY + 13);

      // Box 4: Confirmed Revenue
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(152, startY, boxW + 1, boxH, 2, 2, "F");
      doc.setFontSize(7.5);
      doc.setTextColor(5, 150, 105);
      doc.text("CONFIRMED REVENUE", 156, startY + 5.5);
      doc.setFontSize(11);
      doc.setTextColor(4, 120, 87);
      doc.text(`Rs. ${Number(totalRevenueAmt || 0).toLocaleString("en-IN")}`, 156, startY + 13);

      // 4. Bookings Ledger Table Header
      let tableY = 90;
      doc.setFillColor(15, 23, 42);
      doc.rect(14, tableY, 182, 7, "F");

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("Code", 17, tableY + 5);
      doc.text("Customer", 45, tableY + 5);
      doc.text("Date", 82, tableY + 5);
      doc.text("Time Slot", 106, tableY + 5);
      doc.text("Amount", 148, tableY + 5);
      doc.text("Status", 172, tableY + 5);

      tableY += 7;

      if (bookingsList.length === 0) {
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "normal");
        doc.text("No slot booking records match the selected date period & status filter.", 18, tableY + 10);
      } else {
        bookingsList.forEach((b, idx) => {
          if (tableY > 275) {
            doc.addPage();
            tableY = 15;

            // Repeat header on new page
            doc.setFillColor(15, 23, 42);
            doc.rect(14, tableY, 182, 7, "F");
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text("Code", 17, tableY + 5);
            doc.text("Customer", 45, tableY + 5);
            doc.text("Date", 82, tableY + 5);
            doc.text("Time Slot", 106, tableY + 5);
            doc.text("Amount", 148, tableY + 5);
            doc.text("Status", 172, tableY + 5);
            tableY += 7;
          }

          // Alternating row background
          if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(14, tableY, 182, 6.5, "F");
          }

          doc.setFontSize(7.5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(15, 23, 42);

          const codeStr = String(b.booking_code || `#${b.id}`);
          const nameStr = String(b.user_name || "Reserved").slice(0, 20);
          const dateStr = formatDateDisplay(b.date);
          const slotStr = String(b.time_slot || b.slot_time || "—");
          const amtStr = `Rs. ${Number(parseFloat(b.amount) || 0).toLocaleString("en-IN")}`;
          const stStr = String(b.status || "Confirmed");

          doc.text(codeStr, 17, tableY + 4.5);
          doc.text(nameStr, 45, tableY + 4.5);
          doc.text(dateStr, 82, tableY + 4.5);
          doc.text(slotStr, 106, tableY + 4.5);
          doc.text(amtStr, 148, tableY + 4.5);

          if (stStr.toLowerCase() === "confirmed") {
            doc.setTextColor(4, 120, 87);
          } else if (stStr.toLowerCase() === "cancelled") {
            doc.setTextColor(190, 18, 60);
          } else {
            doc.setTextColor(180, 83, 9);
          }
          doc.setFont("helvetica", "bold");
          doc.text(stStr, 172, tableY + 4.5);

          tableY += 6.5;
        });
      }

      // 5. Save PDF
      const cleanTurfName = (targetTurf.turfName || "turf").toLowerCase().replace(/[^a-z0-9]/gi, "_");
      doc.save(`${cleanTurfName}-performance-report-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success(`PDF report downloaded for ${targetTurf.turfName} (${bookingsList.length} records)!`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  // ==========================================
  // EXPORT 3: ALL TURFS MASTER EXCEL (CSV)
  // ==========================================
  const handleExportAllTurfsCSV = () => {
    if (!filteredTurfs || filteredTurfs.length === 0) {
      toast.error("No turf report data to export.");
      return;
    }

    const headers = [
      "Turf ID",
      "Turf Name",
      "Location / City",
      "Sports Type",
      "Hourly Rate (INR)",
      "Owner Name",
      "Owner Email",
      "Owner Phone",
      "Status",
      "Onboarded Today",
      "Onboarding Date",
      "Selected Period",
      "Total Bookings",
      "Confirmed Bookings",
      "Cancelled Slots",
      "Reserved / Blocked Slots",
      "Cancellation Rate (%)",
      "Total Confirmed Revenue (INR)",
      "Lost Cancelled Revenue (INR)",
    ];

    const periodLabel = getPeriodLabel(periodFilter, customStartDate, customEndDate);

    const rows = filteredTurfs.map((t) => [
      t.turfId || "N/A",
      `"${(t.turfName || "").replace(/"/g, '""')}"`,
      `"${(t.location || "").replace(/"/g, '""')}"`,
      `"${(t.sportType || "").replace(/"/g, '""')}"`,
      t.pricePerHour || 0,
      `"${(t.ownerName || "").replace(/"/g, '""')}"`,
      `"${(t.ownerEmail || "").replace(/"/g, '""')}"`,
      `"${(t.ownerPhone || "").replace(/"/g, '""')}"`,
      t.status || "Active",
      t.isOnboardedToday ? "YES" : "NO",
      formatDateDisplay(t.createdAt),
      `"${periodLabel}"`,
      t.totalBookings || 0,
      t.confirmedBookings || 0,
      t.cancelledBookings || 0,
      t.reservedSlots || 0,
      `${t.cancellationRate || 0}%`,
      t.totalRevenue || 0,
      t.cancelledRevenue || 0,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sportx-all-turfs-report-${periodFilter}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported All Turfs CSV (${periodLabel})!`);
  };

  const handleOpenTurfModal = (turf) => {
    setSelectedTurf(turf);
    setModalPeriodFilter("inherit");
    setModalStatusFilter("all");
    setModalSearchTerm("");
    setIsTurfModalOpen(true);
  };

  const globalPeriodLabel = getPeriodLabel(periodFilter, customStartDate, customEndDate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Real-Time Platform Reports
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <Calendar className="w-3 h-3 text-slate-500" />
              {globalPeriodLabel}
            </span>
            <span className="text-xs text-slate-400">
              • Last updated: {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            All Turfs & Bookings Reports
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Monitor venue booking volumes, slot cancellations, revenue performance, and real-time turf onboarding stats.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Period Switcher Pills in Header */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setPeriodFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setPeriodFilter("today")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === "today" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setPeriodFilter("7days")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === "7days" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setPeriodFilter("1month")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === "1month" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              1 Month
            </button>
            <button
              onClick={() => setPeriodFilter("custom")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodFilter === "custom" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Custom
            </button>
          </div>

          <Button
            onClick={() => loadReports(true)}
            variant="outline"
            disabled={loading}
            className="h-9 px-3 gap-2 text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>

          <button
            type="button"
            onClick={handleExportAllTurfsCSV}
            className="h-9 px-3.5 inline-flex items-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white hover:text-white rounded-xl shadow-xs transition-colors cursor-pointer border-0 outline-none"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            <span className="text-white">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Bar (Shown when Custom period is selected) */}
      {periodFilter === "custom" && (
        <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
            <CalendarRange className="w-4 h-4 text-indigo-600" />
            <span>Select Custom Date Range:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">From:</span>
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-9 text-xs rounded-xl bg-white border-indigo-200 w-36"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">To:</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-9 text-xs rounded-xl bg-white border-indigo-200 w-36"
              />
            </div>
            {(customStartDate || customEndDate) && (
              <Button
                onClick={() => {
                  setCustomStartDate("");
                  setCustomEndDate("");
                }}
                variant="ghost"
                size="sm"
                className="h-9 text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                Reset Dates
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Top 5 Executive Metric Cards (Dynamically re-aggregated by selected period) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Today's Turfs Onboarded */}
        <Card className="relative overflow-hidden border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white shadow-sm">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                Today's Onboarding
              </span>
              <span className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                <Sparkles className="w-4 h-4 animate-bounce" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {periodKPIs.todayTurfsOnboarded}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {periodKPIs.todayTurfsOnboarded > 0 ? `+${periodKPIs.todayTurfsOnboarded} New Today` : "0 Today"}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">
              {periodKPIs.todayOwnersOnboarded > 0 
                ? `${periodKPIs.todayOwnersOnboarded} owner application${periodKPIs.todayOwnersOnboarded > 1 ? "s" : ""} today` 
                : "Turfs added & live today"}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Total Registered Turfs */}
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Total Registered Turfs
              </span>
              <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {periodKPIs.totalTurfs}
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {periodKPIs.activeTurfs} Active
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">
              Venues listed across all cities
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Total Bookings & Confirmed Slots */}
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Booked Slots ({globalPeriodLabel})
              </span>
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <CalendarDays className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {periodKPIs.confirmedBookings}
              </span>
              <span className="text-xs font-bold text-slate-400">
                / {periodKPIs.totalBookings} Total
              </span>
            </div>
            <p className="mt-1.5 text-xs font-bold text-emerald-600">
              Revenue: {formatCurrency(periodKPIs.totalRevenue)}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Cancelled Slots & Loss */}
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Cancelled Slots ({globalPeriodLabel})
              </span>
              <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <XCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-rose-600">
                {periodKPIs.cancelledBookings}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                periodKPIs.cancellationRate > 20 
                  ? "bg-rose-100 text-rose-700" 
                  : "bg-amber-100 text-amber-700"
              }`}>
                {periodKPIs.cancellationRate}% Rate
              </span>
            </div>
            <p className="mt-1.5 text-xs font-semibold text-rose-500">
              Lost ₹: {formatCurrency(periodKPIs.cancelledRevenue)}
            </p>
          </CardContent>
        </Card>

        {/* Card 5: Reserved / Blocked Slots */}
        <Card className="border-slate-200/80 bg-white shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Reserved / Blocked
              </span>
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Ban className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">
                {periodKPIs.reservedSlots}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Locked
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">
              Maintenance & offline reserved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Onboarded Turfs Spotlight Widget */}
      {todayTurfsList && todayTurfsList.length > 0 ? (
        <div className="p-5 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-2xl shadow-md border border-emerald-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <Sparkles className="w-4 h-4 animate-spin" />
              </span>
              <h2 className="text-base font-black text-white tracking-wide">
                🚀 Turfs Onboarded Today on Website ({todayTurfsList.length})
              </h2>
            </div>
            <span className="text-xs font-bold bg-emerald-500 text-white px-3 py-1 rounded-full animate-pulse">
              Live Today
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayTurfsList.map((t, idx) => (
              <div
                key={t.id || idx}
                className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 flex items-start gap-3 hover:bg-white/15 transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-300 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-white truncate">{t.name}</h4>
                    <span className="text-[10px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded">
                      NEW
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    {t.location || "Location not specified"}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-300 mt-2 pt-2 border-t border-white/10">
                    <span>Owner: {t.ownerName || "N/A"}</span>
                    <span className="font-extrabold text-emerald-300">
                      {t.pricePerHour ? `₹${t.pricePerHour}/hr` : "₹0"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-400" />
            <span>
              <strong>Today's Onboarding Status:</strong> No new turfs onboarded today yet. Total of{" "}
              <strong>{periodKPIs.totalTurfs} active venues</strong> operating across the platform.
            </span>
          </div>
          <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Pipeline Active
          </span>
        </div>
      )}

      {/* Main Reporting Tabs */}
      <Tabs defaultValue="all-turfs" className="w-full space-y-4">
        <TabsList className="bg-slate-100 p-1 rounded-xl border border-slate-200 h-auto flex flex-wrap gap-1">
          <TabsTrigger
            value="all-turfs"
            className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            All Turfs Performance ({filteredTurfs.length})
          </TabsTrigger>
          <TabsTrigger
            value="cancellations"
            className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
            Slot Cancellations & Analysis ({periodKPIs.cancelledBookings})
          </TabsTrigger>
          <TabsTrigger
            value="bookings-ledger"
            className="rounded-lg text-xs font-bold px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
          >
            <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
            Master Bookings Ledger ({periodBookings.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: ALL TURFS PERFORMANCE MATRIX */}
        <TabsContent value="all-turfs" className="space-y-4 m-0">
          {/* Search, Filters, Period, and Sorting Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search turf, owner, city, sport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 text-xs rounded-xl bg-slate-50 border-slate-200"
              />
            </div>

            {/* Dropdown Filters (Including Period Filter: Today, 1 Month, Custom, etc.) */}
            <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
              {/* TIME PERIOD FILTER */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  Period:
                </span>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="h-10 px-3 text-xs font-extrabold bg-emerald-50/70 border border-emerald-300 text-emerald-900 rounded-xl outline-none cursor-pointer hover:bg-emerald-100/70 transition-colors"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="1month">This Month (1 Month)</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="custom">Custom Date Range...</option>
                </select>
              </div>

              {/* Sport Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Sport:</span>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">All Sports</option>
                  <option value="cricket">Cricket</option>
                  <option value="football">Football</option>
                  <option value="badminton">Badminton</option>
                  <option value="tennis">Tennis</option>
                  <option value="pickleball">Pickleball</option>
                  <option value="basketball">Basketball</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer"
                >
                  <option value="bookings_desc">Most Bookings</option>
                  <option value="revenue_desc">Highest Revenue (₹)</option>
                  <option value="cancellations_desc">Most Cancellations</option>
                  <option value="rate_desc">Highest Cancellation %</option>
                  <option value="today_first">Today Onboarded First</option>
                  <option value="newest">Newest Onboarded</option>
                  <option value="name_asc">Turf Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Turfs Performance Table */}
          <Card className="border-slate-200/80 shadow-sm overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 uppercase font-black tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Turf Details & City</th>
                    <th className="py-3.5 px-3">Owner Info</th>
                    <th className="py-3.5 px-3">Hourly Rate</th>
                    <th className="py-3.5 px-3 text-center">
                      Booked Slots
                      {periodFilter !== "all" && (
                        <span className="block text-[9px] font-bold text-emerald-600 lowercase">
                          ({globalPeriodLabel})
                        </span>
                      )}
                    </th>
                    <th className="py-3.5 px-3 text-center">
                      Cancelled Slots
                      {periodFilter !== "all" && (
                        <span className="block text-[9px] font-bold text-rose-600 lowercase">
                          ({globalPeriodLabel})
                        </span>
                      )}
                    </th>
                    <th className="py-3.5 px-3 text-center">Reserved</th>
                    <th className="py-3.5 px-3 text-right">Confirmed Revenue</th>
                    <th className="py-3.5 px-3 text-right">Cancelled Loss</th>
                    <th className="py-3.5 px-3">Onboarded</th>
                    <th className="py-3.5 px-4 text-center">Ledger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredTurfs.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="font-semibold text-sm">No turfs match the selected filters for this period.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredTurfs.map((turf) => (
                      <tr
                        key={turf.turfId || turf.turfName}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          turf.isOnboardedToday ? "bg-emerald-50/40" : ""
                        }`}
                      >
                        {/* Turf Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900 truncate max-w-[170px]">
                                  {turf.turfName}
                                </span>
                                {turf.isOnboardedToday && (
                                  <span className="text-[10px] font-black bg-emerald-500 text-white px-1.5 py-0.2 rounded uppercase tracking-wider animate-pulse">
                                    New Today
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[160px]">{turf.location}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                                  {turf.sportType}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Owner Info */}
                        <td className="py-3.5 px-3">
                          <div className="text-[11px]">
                            <div className="font-bold text-slate-900 truncate max-w-[130px]">
                              {turf.ownerName || "N/A"}
                            </div>
                            <div className="text-slate-500 truncate max-w-[140px]">
                              {turf.ownerEmail || turf.ownerPhone || "—"}
                            </div>
                          </div>
                        </td>

                        {/* Hourly Rate */}
                        <td className="py-3.5 px-3 font-bold text-slate-800">
                          ₹{turf.pricePerHour || 0}
                          <span className="text-[10px] text-slate-400 font-normal">/hr</span>
                        </td>

                        {/* Booked Slots */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-black text-slate-900 text-sm">
                              {turf.confirmedBookings}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              ({turf.totalBookings} total)
                            </span>
                          </div>
                        </td>

                        {/* Cancelled Slots & Rate */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`font-black text-sm ${turf.cancelledBookings > 0 ? "text-rose-600" : "text-slate-400"}`}>
                              {turf.cancelledBookings}
                            </span>
                            {turf.totalBookings > 0 && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                turf.cancellationRate > 20 
                                  ? "bg-rose-100 text-rose-700" 
                                  : turf.cancelledBookings > 0 
                                  ? "bg-amber-100 text-amber-700" 
                                  : "bg-slate-100 text-slate-500"
                              }`}>
                                {turf.cancellationRate}%
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Reserved Slots */}
                        <td className="py-3.5 px-3 text-center font-bold text-amber-700">
                          {turf.reservedSlots || 0}
                        </td>

                        {/* Confirmed Revenue */}
                        <td className="py-3.5 px-3 text-right font-black text-emerald-700">
                          {formatCurrency(turf.totalRevenue)}
                        </td>

                        {/* Cancelled Loss */}
                        <td className="py-3.5 px-3 text-right font-semibold text-rose-600">
                          {turf.cancelledRevenue > 0 ? formatCurrency(turf.cancelledRevenue) : "₹0"}
                        </td>

                        {/* Onboarded Date */}
                        <td className="py-3.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {formatDateDisplay(turf.createdAt)}
                        </td>

                        {/* Action (View Ledger) */}
                        <td className="py-3.5 px-4 text-center">
                          <Button
                            onClick={() => handleOpenTurfModal(turf)}
                            size="sm"
                            variant="outline"
                            className="h-7 px-3 text-[11px] font-bold border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg cursor-pointer"
                            title="Open Detailed Performance Ledger"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View Ledger
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary Bar */}
            <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 font-semibold">
              <span>
                Showing <strong>{filteredTurfs.length}</strong> of <strong>{periodTurfsReports.length}</strong> venues ({globalPeriodLabel})
              </span>
              <div className="flex items-center gap-4 flex-wrap">
                <span>Bookings: <strong className="text-slate-900">{periodKPIs.totalBookings}</strong></span>
                <span>Confirmed ₹: <strong className="text-emerald-600">{formatCurrency(periodKPIs.totalRevenue)}</strong></span>
                <span>Cancelled Loss ₹: <strong className="text-rose-600">{formatCurrency(periodKPIs.cancelledRevenue)}</strong></span>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* TAB 2: SLOT CANCELLATIONS & DIAGNOSTICS */}
        <TabsContent value="cancellations" className="space-y-4 m-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cancellation Summary */}
            <Card className="border-slate-200/80 shadow-sm bg-white p-5">
              <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Cancellation Overview ({globalPeriodLabel})
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Cancelled Slots</span>
                  <span className="text-sm font-black text-rose-600">{periodKPIs.cancelledBookings}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Cancellation Rate</span>
                  <span className="text-sm font-black text-amber-600">{periodKPIs.cancellationRate}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Total Revenue Lost</span>
                  <span className="text-sm font-black text-rose-600">{formatCurrency(periodKPIs.cancelledRevenue)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-slate-500">Completion Rate</span>
                  <span className="text-sm font-black text-emerald-600">
                    {100 - periodKPIs.cancellationRate}%
                  </span>
                </div>
              </div>
            </Card>

            {/* Reasons for Cancellation Breakdown */}
            <Card className="border-slate-200/80 shadow-sm bg-white p-5 md:col-span-2">
              <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-500" />
                Reported Cancellation Reasons ({globalPeriodLabel})
              </h3>
              {periodCancellationReasons.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                  No cancelled bookings recorded for {globalPeriodLabel.toLowerCase()}.
                </div>
              ) : (
                <div className="space-y-3">
                  {periodCancellationReasons.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{item.reason || "Customer Requested / Unspecified"}</span>
                        <span className="text-slate-500">{item.count} slots ({item.percentage || Math.round((item.count / Math.max(periodKPIs.cancelledBookings, 1)) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-rose-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(5, (item.count / Math.max(periodKPIs.cancelledBookings, 1)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: MASTER BOOKINGS LEDGER */}
        <TabsContent value="bookings-ledger" className="space-y-4 m-0">
          <Card className="border-slate-200/80 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 border-b border-slate-200/80 bg-slate-50 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-black text-slate-900">
                  Comprehensive Bookings Ledger ({globalPeriodLabel})
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Real-time record of customer slot bookings, payments, and cancellations.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-bold">
                {periodBookings.length} Records
              </Badge>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 uppercase font-black tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Booking Code</th>
                    <th className="py-3 px-3">Turf Venue</th>
                    <th className="py-3 px-3">Customer Info</th>
                    <th className="py-3 px-3">Date & Slot</th>
                    <th className="py-3 px-3">Sport</th>
                    <th className="py-3 px-3 text-right">Amount</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-4 text-center">Status / Cancellation Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {periodBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No bookings found for {globalPeriodLabel.toLowerCase()}.
                      </td>
                    </tr>
                  ) : (
                    periodBookings.map((b) => {
                      const st = String(b.status || "").toLowerCase();
                      const isConfirmed = st === "confirmed" || st === "completed";
                      const isCancelled = st === "cancelled" || st === "canceled";
                      const isReserved = st === "reserved" || st === "maintenance" || st === "blocked";

                      return (
                        <tr key={b.id || b.booking_code} className="hover:bg-slate-50/80">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {b.booking_code || `#${b.id}`}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-800">
                            {b.turf_name}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{b.user_name || "Reserved"}</div>
                            <div className="text-[11px] text-slate-500">{b.user_email || b.user_phone || "—"}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">{formatDateDisplay(b.date)}</div>
                            <div className="text-[11px] text-slate-500">{b.time_slot || b.slot_time || "—"}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {b.sport || "General"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">
                            {formatCurrency(b.amount)}
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">
                            {b.payment_method || b.payment_type || "UPI"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isConfirmed && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                                Confirmed
                              </Badge>
                            )}
                            {isCancelled && (
                              <div className="inline-flex flex-col items-center">
                                <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px] font-bold">
                                  Cancelled
                                </Badge>
                                {b.cancellation_reason && (
                                  <span className="text-[10px] text-rose-600 max-w-[130px] truncate mt-0.5" title={b.cancellation_reason}>
                                    {b.cancellation_reason}
                                  </span>
                                )}
                              </div>
                            )}
                            {isReserved && (
                              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
                                Reserved / Blocked
                              </Badge>
                            )}
                            {!isConfirmed && !isCancelled && !isReserved && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] font-bold">
                                {b.status || "Pending"}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* INDIVIDUAL TURF DETAIL DRILLDOWN MODAL (With Date Pickers, Excel & PDF Export) */}
      <Dialog open={isTurfModalOpen} onOpenChange={setIsTurfModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTurf && modalFilteredTurfData && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 pr-12 sm:pr-14">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                      <Building2 className="w-6 h-6" />
                    </span>
                    <div className="min-w-0">
                      <DialogTitle className="text-xl font-black text-slate-900 flex items-center gap-2 truncate">
                        {selectedTurf.turfName} — Performance Ledger
                      </DialogTitle>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {selectedTurf.location} • Sport: {selectedTurf.sportType} • Rate: ₹{selectedTurf.pricePerHour}/hr
                      </p>
                    </div>
                  </div>

                  {/* PDF and Excel Download Buttons in Modal */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleExportParticularTurfPDF(selectedTurf, true)}
                      className="h-8 px-3.5 inline-flex items-center gap-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white hover:text-white rounded-xl shadow-xs transition-colors cursor-pointer border-0 outline-none"
                    >
                      <FileText className="w-3.5 h-3.5 text-white" />
                      <span className="text-white">Download PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportParticularTurfCSV(selectedTurf, true)}
                      className="h-8 px-3.5 inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white hover:text-white rounded-xl shadow-xs transition-colors cursor-pointer border-0 outline-none"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
                      <span className="text-white">Export Excel (CSV)</span>
                    </button>
                  </div>
                </div>
              </DialogHeader>

              {/* Turf Date Filtering Control Toolbar inside Modal */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                  <span className="font-extrabold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Date Filter:
                  </span>
                  <select
                    value={modalPeriodFilter}
                    onChange={(e) => setModalPeriodFilter(e.target.value)}
                    className="h-8 px-2.5 font-bold bg-white border border-slate-200 rounded-lg text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="inherit">Same as Dashboard ({globalPeriodLabel})</option>
                    <option value="all">All Time</option>
                    <option value="today">Today Only</option>
                    <option value="1month">This Month (1 Month)</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="custom">Custom Date Range...</option>
                  </select>

                  {/* Status filter inside modal */}
                  <select
                    value={modalStatusFilter}
                    onChange={(e) => setModalStatusFilter(e.target.value)}
                    className="h-8 px-2.5 font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="confirmed">Confirmed Only</option>
                    <option value="cancelled">Cancelled Only</option>
                    <option value="reserved">Reserved / Blocked Only</option>
                  </select>
                </div>

                {/* Custom Date Pickers inside Modal */}
                {modalPeriodFilter === "custom" && (
                  <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500 font-semibold">From:</span>
                      <Input
                        type="date"
                        value={modalCustomStart}
                        onChange={(e) => setModalCustomStart(e.target.value)}
                        className="h-8 text-xs rounded-lg bg-white border-slate-200 w-32"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500 font-semibold">To:</span>
                      <Input
                        type="date"
                        value={modalCustomEnd}
                        onChange={(e) => setModalCustomEnd(e.target.value)}
                        className="h-8 text-xs rounded-lg bg-white border-slate-200 w-32"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Turf Mini KPI Matrix (Period-reactive inside modal) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Bookings</span>
                  <p className="text-xl font-black text-slate-900">{modalFilteredTurfData.kpis.total}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Confirmed Slots</span>
                  <p className="text-xl font-black text-emerald-600">{modalFilteredTurfData.kpis.confirmed}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Cancelled Slots</span>
                  <p className="text-xl font-black text-rose-600">
                    {modalFilteredTurfData.kpis.cancelled}
                    <span className="text-xs font-bold text-rose-500 ml-1">({modalFilteredTurfData.kpis.cancellationRate}%)</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Revenue</span>
                  <p className="text-xl font-black text-emerald-700">{formatCurrency(modalFilteredTurfData.kpis.totalRevenue)}</p>
                </div>
              </div>

              {/* Owner Info Bar */}
              <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-800">Owner: {selectedTurf.ownerName}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 flex-wrap">
                  {selectedTurf.ownerEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      {selectedTurf.ownerEmail}
                    </span>
                  )}
                  {selectedTurf.ownerPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      {selectedTurf.ownerPhone}
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Bookings Search & Table */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Slot Bookings Ledger ({modalFilteredTurfData.visibleBookings.length} records)
                  </h4>
                  <div className="relative w-56">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search code or customer..."
                      value={modalSearchTerm}
                      onChange={(e) => setModalSearchTerm(e.target.value)}
                      className="pl-8 h-7 text-xs rounded-lg bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                {modalFilteredTurfData.visibleBookings.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    No slot booking records found for this turf in the selected date period.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Date & Time</th>
                          <th className="py-2.5 px-3">Payment</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {modalFilteredTurfData.visibleBookings.map((b) => (
                          <tr key={b.id || b.booking_code} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                              {b.booking_code || `#${b.id}`}
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-800">{b.user_name || "Reserved"}</div>
                              <div className="text-[10px] text-slate-400">{b.user_phone || b.user_email || ""}</div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              <div>{formatDateDisplay(b.date)}</div>
                              <div className="text-[10px] text-slate-400">{b.time_slot || b.slot_time || "Slot"}</div>
                            </td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-600">
                              {b.payment_method || b.payment_type || "UPI"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              {formatCurrency(b.amount)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <Badge
                                className={`text-[10px] font-bold ${
                                  String(b.status).toLowerCase() === "confirmed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : String(b.status).toLowerCase() === "cancelled"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {b.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">
                  Showing <strong>{modalFilteredTurfData.visibleBookings.length}</strong> of{" "}
                  <strong>{modalFilteredTurfData.allPeriodBookings.length}</strong> bookings ({getPeriodLabel(activeModalPeriod, activeModalCustomStart, activeModalCustomEnd)})
                </span>
                <button
                  type="button"
                  onClick={() => setIsTurfModalOpen(false)}
                  className="h-9 px-4 inline-flex items-center justify-center bg-slate-900 text-white hover:text-white hover:bg-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors border-0 outline-none"
                >
                  Close Ledger
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
