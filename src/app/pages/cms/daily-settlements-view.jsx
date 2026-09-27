import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Landmark,
  IndianRupee,
  Calendar,
  Clock,
  Search,
  RefreshCw,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Building2,
  Phone,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Percent,
  FileSpreadsheet,
  FileText,
  Loader2,
  ExternalLink,
  Copy,
  Layers,
  Send,
  SlidersHorizontal,
  CreditCard,
  User,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { adminApi } from "../../services/admin-api";

function formatINR(val) {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function getTodayStr() {
  const d = new Date();
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
}

export function DailySettlementsView() {
  const [settlements, setSettlements] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [turfOwners, setTurfOwners] = useState([]);
  const [turfs, setTurfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filters & State
  const [activeTab, setActiveTab] = useState("settlements"); // "settlements" | "queued" | "owners"
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL | SUCCESS | PENDING | FAILED

  // Modals
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [settlementBookings, setSettlementBookings] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Load all data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [settleRes, bookingRes, ownersRes, turfsRes] = await Promise.allSettled([
        fetch("/api/settlements").then((r) => r.json()),
        adminApi.getAll("bookings"),
        adminApi.getAll("turf-owners"),
        adminApi.getAll("turfs"),
      ]);

      if (settleRes.status === "fulfilled" && settleRes.value?.settlements) {
        setSettlements(settleRes.value.settlements || []);
      }
      if (bookingRes.status === "fulfilled") setBookings(bookingRes.value || []);
      if (ownersRes.status === "fulfilled") setTurfOwners(ownersRes.value || []);
      if (turfsRes.status === "fulfilled") setTurfs(turfsRes.value || []);
    } catch (err) {
      console.error("Error loading settlements view data:", err);
      toast.error("Failed loading settlements data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Trigger manual 12:00 AM Settlement batch
  const handleTriggerSettlement = async (targetDateToRun = null) => {
    const dateToRun = targetDateToRun || selectedDate || getTodayStr();
    try {
      setIsProcessing(true);
      toast.info(`Processing automated 12:00 AM settlements for ${dateToRun}...`);
      
      const res = await fetch("/api/settlements/process-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetDate: dateToRun }),
      });

      const result = await res.json();

      if (result.success) {
        const settledCount = result.data?.successCount || 0;
        const totalNet = result.data?.totalNetPayout || 0;
        toast.success(
          `✓ Settlements Completed! ${settledCount} turfs settled (Total: ${formatINR(totalNet)}) & emails sent.`
        );
        loadData();
      } else {
        toast.error(result.message || "Failed running settlement batch.");
      }
    } catch (err) {
      toast.error(`Settlement Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Open details for a settlement
  const handleViewDetails = async (settlement) => {
    setSelectedSettlement(settlement);
    setIsDetailModalOpen(true);
    setIsLoadingDetails(true);

    try {
      const res = await fetch(`/api/settlements/${settlement.settlement_id}`);
      const data = await res.json();
      if (data.success) {
        setSettlementBookings(data.bookings || []);
      } else {
        // Fallback: match from local bookings
        const matched = bookings.filter(
          (b) => b.payout_id === settlement.settlement_id || (b.date === settlement.settlement_date && b.turf_name === settlement.turf_name)
        );
        setSettlementBookings(matched);
      }
    } catch (e) {
      const matched = bookings.filter(
        (b) => b.payout_id === settlement.settlement_id || (b.date === settlement.settlement_date && b.turf_name === settlement.turf_name)
      );
      setSettlementBookings(matched);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Copy helper
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  // Filtered settlements list
  const filteredSettlements = useMemo(() => {
    return settlements.filter((st) => {
      const matchesSearch =
        !searchQuery ||
        st.settlement_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.turf_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.owner_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.utr_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        st.settlement_date?.includes(searchQuery);

      const matchesStatus =
        statusFilter === "ALL" || st.status?.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [settlements, searchQuery, statusFilter]);

  // Queued Bookings for Today (Confirmed slots for today waiting for 12:00 AM payout)
  const todayDateStr = getTodayStr();
  const queuedTodayBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        (b.date === todayDateStr || b.date?.startsWith(todayDateStr)) &&
        (b.status === "Confirmed" || b.status === "Paid" || b.status === "Completed") &&
        (!b.payout_status || b.payout_status === "PENDING")
    );
  }, [bookings, todayDateStr]);

  // Overall Financial Metrics
  const metrics = useMemo(() => {
    const totalGross = settlements.reduce((acc, s) => acc + Number(s.gross_amount || 0), 0);
    const totalFee = settlements.reduce((acc, s) => acc + Number(s.platform_fee || 0), 0);
    const totalNet = settlements.reduce((acc, s) => acc + Number(s.net_payout_amount || 0), 0);
    const totalSlots = settlements.reduce((acc, s) => acc + Number(s.total_bookings || 0), 0);

    const queuedGross = queuedTodayBookings.reduce((acc, b) => acc + Number(b.amount || 0), 0);
    const queuedEstimatedNet = queuedGross * 0.95;

    return {
      totalGross,
      totalFee,
      totalNet,
      totalSlots,
      totalSettlements: settlements.length,
      queuedCount: queuedTodayBookings.length,
      queuedGross,
      queuedEstimatedNet,
    };
  }, [settlements, queuedTodayBookings]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredSettlements.length === 0) {
      toast.info("No settlements to export.");
      return;
    }

    const headers = [
      "Settlement ID",
      "Slot Date",
      "Turf Name",
      "Owner Email",
      "Slots Count",
      "Gross Total (INR)",
      "Platform Fee (INR)",
      "Net Payout (INR)",
      "Bank Name",
      "Account / UPI",
      "IFSC Code",
      "Cashfree UTR",
      "Status",
      "Email Sent",
    ];

    const rows = filteredSettlements.map((s) => [
      s.settlement_id,
      s.settlement_date,
      `"${s.turf_name || ""}"`,
      s.owner_email,
      s.total_bookings,
      s.gross_amount,
      s.platform_fee,
      s.net_payout_amount,
      `"${s.bank_name || ""}"`,
      s.account_number ? `="'${s.account_number}'"` : s.upi_id || "",
      s.ifsc_code || "",
      s.utr_number || "",
      s.status,
      s.email_sent ? "Yes" : "No",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SportXClub_Settlements_${getTodayStr()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Settlements exported to CSV!");
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* 1. TOP HEADER & AUTOMATED ENGINE STATUS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black tracking-tight text-[#0f172a] flex items-center gap-2">
              <Landmark className="w-5 h-5 text-emerald-600" />
              Daily Payment Settlements & Turf Payouts
            </h2>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5">
              12:00 AM Auto Engine
            </Badge>
          </div>
          <p className="text-xs text-[#64748b] mt-0.5">
            Post-Match Settlements Engine: Automatically settles all confirmed & completed matches of the day to turf owner bank accounts at 12:00 AM Midnight with itemized email reports.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none pr-2 py-0.5 cursor-pointer"
            />
          </div>

          <Button
            size="sm"
            disabled={isProcessing}
            onClick={() => handleTriggerSettlement(selectedDate)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-3.5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-white" />
                Run 12:00 AM Settlement Batch
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            className="border-slate-300 hover:bg-slate-50 text-slate-700 text-xs h-9 px-2.5 rounded-xl cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* 2. FINANCIAL METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Net Payouts */}
        <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Total Net Payouts
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0f172a] mt-1.5">{formatINR(metrics.totalNet)}</div>
          <p className="text-[10px] font-semibold text-[#64748b] mt-1">
            Transferred to {metrics.totalSettlements} turf batches ({metrics.totalSlots} slots)
          </p>
        </Card>

        {/* Platform Commission Earned */}
        <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-400">
              Platform Commission (5%)
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1.5">{formatINR(metrics.totalFee)}</div>
          <p className="text-[10px] font-semibold text-[#64748b] mt-1">
            Retained SportXClub platform revenue
          </p>
        </Card>

        {/* Total Gross Volume */}
        <Card className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Total Gross Bookings
            </span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0f172a] mt-1.5">{formatINR(metrics.totalGross)}</div>
          <p className="text-[10px] font-semibold text-[#64748b] mt-1">
            Gross player payments collected via Cashfree
          </p>
        </Card>

        {/* Queued Today's Payouts */}
        <Card className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">
              Today's Queued Slots
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1.5">
            {metrics.queuedCount} Slots ({formatINR(metrics.queuedGross)})
          </div>
          <p className="text-[10px] font-semibold text-amber-700/80 mt-1">
            Auto-executing tonight at 12:00 AM (Est: {formatINR(metrics.queuedEstimatedNet)})
          </p>
        </Card>
      </div>

      {/* 3. TABS & FILTER BAR */}
      <Card className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex p-1 bg-slate-200/70 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("settlements")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "settlements"
                  ? "bg-white text-slate-900 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🏦 Completed Settlements ({settlements.length})
            </button>
            <button
              onClick={() => setActiveTab("queued")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "queued"
                  ? "bg-white text-slate-900 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ⏳ Today's Queued Slots ({queuedTodayBookings.length})
            </button>
            <button
              onClick={() => setActiveTab("owners")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "owners"
                  ? "bg-white text-slate-900 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              👤 Turf Owners & Banks ({turfOwners.length})
            </button>
          </div>

          {/* Search & Export Buttons */}
          <div className="flex items-center gap-2">
            {activeTab === "settlements" && (
              <>
                <div className="relative min-w-[160px] sm:min-w-[220px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input
                    placeholder="Search UTR, Turf, Owner..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8.5 text-xs bg-white rounded-xl border-slate-200"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-8.5 px-2.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-700 outline-none cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="PENDING">Processing</option>
                  <option value="FAILED">Failed</option>
                </select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportCSV}
                  className="h-8.5 px-3 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  CSV
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 4. TAB CONTENTS */}
        <CardContent className="p-0">
          {/* TAB 1: COMPLETED SETTLEMENTS */}
          {activeTab === "settlements" && (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[950px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                    <th className="px-4 py-3">Settlement ID</th>
                    <th className="px-4 py-3">Slot Date</th>
                    <th className="px-4 py-3">Turf & Owner</th>
                    <th className="px-4 py-3">Destination Bank</th>
                    <th className="px-3 py-3 text-center">Slots</th>
                    <th className="px-4 py-3 text-right">Gross (₹)</th>
                    <th className="px-4 py-3 text-right">Fee (5%)</th>
                    <th className="px-4 py-3 text-right">Net Payout (₹)</th>
                    <th className="px-4 py-3">Cashfree UTR</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-center">Email</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 text-xs">
                  {filteredSettlements.length > 0 ? (
                    filteredSettlements.map((st) => (
                      <tr key={st.id || st.settlement_id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Settlement ID */}
                        <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span>{st.settlement_id}</span>
                            <button
                              onClick={() => handleCopy(st.settlement_id, "Settlement ID")}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                              title="Copy ID"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                          {st.settlement_date}
                        </td>

                        {/* Turf & Owner */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{st.turf_name || "SportXClub Turf"}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[170px]">{st.owner_email}</div>
                        </td>

                        {/* Destination Bank */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800 text-[11px]">
                            {st.bank_name || (st.upi_id ? "UPI Direct" : "Bank Transfer")}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500">
                            {st.account_number ? `•••• ${st.account_number.slice(-4)}` : st.upi_id || "Registered"}
                          </div>
                        </td>

                        {/* Slots Count */}
                        <td className="px-3 py-3 text-center font-bold text-slate-900">
                          {st.total_bookings}
                        </td>

                        {/* Gross */}
                        <td className="px-4 py-3 text-right font-bold text-slate-800">
                          ₹{Number(st.gross_amount || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Platform Fee */}
                        <td className="px-4 py-3 text-right font-bold text-rose-600">
                          -₹{Number(st.platform_fee || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Net Payout */}
                        <td className="px-4 py-3 text-right font-black text-emerald-700 text-sm">
                          ₹{Number(st.net_payout_amount || 0).toLocaleString("en-IN")}
                        </td>

                        {/* Cashfree UTR */}
                        <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-700 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="text-emerald-700">{st.utr_number || "TRANSFERRED"}</span>
                            {st.utr_number && (
                              <button
                                onClick={() => handleCopy(st.utr_number, "UTR Reference")}
                                className="text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                                title="Copy UTR"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 text-center">
                          <Badge
                            className={`text-[9px] font-bold rounded-md px-2 py-0.5 ${
                              st.status === "SUCCESS" || st.status === "PAID"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : st.status === "PENDING" || st.status === "PROCESSING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {st.status}
                          </Badge>
                        </td>

                        {/* Email Dispatch */}
                        <td className="px-3 py-3 text-center">
                          {st.email_sent ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200" title="Report emailed to owner">
                              <Mail className="w-3 h-3" /> Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                              Queued
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetails(st)}
                            className="h-7 px-2.5 text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            View Slots
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="py-14 text-center text-slate-500 text-xs">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                          <Landmark className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-slate-700 text-sm">No settlement records found</p>
                        <p className="text-slate-500 text-xs mt-1">
                          Settlement batches auto-generate every midnight at 12:00 AM or when clicking "Run 12:00 AM Settlement Batch".
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: QUEUED TODAY'S BOOKINGS (PRE-SETTLEMENT) */}
          {activeTab === "queued" && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900">
                      Confirmed Slots for Today ({todayDateStr}) Awaiting Midnight Payout
                    </h4>
                    <p className="text-[11px] text-amber-700">
                      These player bookings are confirmed and will be automatically settled to the turf owners at <strong>12:00 AM Midnight</strong> tonight.
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleTriggerSettlement(todayDateStr)}
                  disabled={isProcessing || queuedTodayBookings.length === 0}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold h-8 px-3 rounded-lg shadow-xs"
                >
                  Settle Today's Slots Now
                </Button>
              </div>

              <div className="w-full overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full min-w-[750px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100 text-[11px] font-extrabold uppercase text-slate-600">
                      <th className="px-4 py-2.5">Booking ID</th>
                      <th className="px-4 py-2.5">Turf Arena</th>
                      <th className="px-4 py-2.5">Player Name</th>
                      <th className="px-4 py-2.5">Sport</th>
                      <th className="px-4 py-2.5">Slot Time</th>
                      <th className="px-4 py-2.5 text-right">Amount (₹)</th>
                      <th className="px-4 py-2.5 text-right">Platform Fee (5%)</th>
                      <th className="px-4 py-2.5 text-right">Owner Payout (95%)</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {queuedTodayBookings.length > 0 ? (
                      queuedTodayBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{b.booking_code || `BK-${b.id}`}</td>
                          <td className="px-4 py-2.5 font-bold text-slate-800">{b.turf_name}</td>
                          <td className="px-4 py-2.5 text-slate-700">{b.user_name || "Player"}</td>
                          <td className="px-4 py-2.5 text-slate-600">{b.sport}</td>
                          <td className="px-4 py-2.5 text-slate-700">{b.time_slot || b.slot_time}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">₹{Number(b.amount || 0).toLocaleString("en-IN")}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-rose-600">-₹{(Number(b.amount || 0) * 0.05).toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right font-black text-emerald-700">₹{(Number(b.amount || 0) * 0.95).toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">
                              Awaiting 12:00 AM
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="py-8 text-center text-slate-500 text-xs">
                          No pending slot bookings queued for today.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TURF OWNERS & BANK BENEFICIARIES */}
          {activeTab === "owners" && (
            <div className="p-4 space-y-4">
              <div className="w-full overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full min-w-[800px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100 text-[11px] font-extrabold uppercase text-slate-600">
                      <th className="px-4 py-2.5">Owner ID / Name</th>
                      <th className="px-4 py-2.5">Email & Phone</th>
                      <th className="px-4 py-2.5">Registered Bank</th>
                      <th className="px-4 py-2.5">Account Number / UPI</th>
                      <th className="px-4 py-2.5">IFSC Code</th>
                      <th className="px-4 py-2.5 text-center">Payout Cycle</th>
                      <th className="px-4 py-2.5 text-center">Bank Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {turfOwners.map((owner) => {
                      let setupData = {};
                      try {
                        setupData = typeof owner.setup_data === "string" ? JSON.parse(owner.setup_data) : (owner.setup_data || {});
                      } catch (e) {}
                      const bank = setupData.bank || {};
                      const hasBank = Boolean(bank.accountNumber || bank.upiId || owner.account_number);

                      return (
                        <tr key={owner.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{owner.name || owner.full_name}</div>
                            <div className="font-mono text-[10px] text-slate-500">#{owner.owner_id || owner.id}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">{owner.email}</div>
                            <div className="text-[11px] text-slate-500">{owner.phone || "N/A"}</div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {bank.bankName || "HDFC Bank"}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-700">
                            {bank.accountNumber ? `•••• ${bank.accountNumber.slice(-4)}` : (bank.upiId || "Not Added")}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-700">
                            {bank.ifscCode || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px]">
                              12:00 AM Daily
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {hasBank ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                                Bank Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. ITEMIZED SETTLEMENT BREAKDOWN MODAL */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-base font-black">
              <span>Settlement Breakdown: {selectedSettlement?.settlement_id}</span>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                {selectedSettlement?.status || "SUCCESS"}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedSettlement && (
            <div className="space-y-4 text-xs">
              {/* Summary Header Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Turf Venue</span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">{selectedSettlement.turf_name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Slot Match Date</span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">{selectedSettlement.settlement_date}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Gross Total</span>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">{formatINR(selectedSettlement.gross_amount)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">Net Transferred</span>
                  <p className="font-black text-emerald-700 text-sm mt-0.5">{formatINR(selectedSettlement.net_payout_amount)}</p>
                </div>
              </div>

              {/* UTR & Bank Reference */}
              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Cashfree UTR Reference</span>
                  <p className="font-mono font-bold text-emerald-800 text-xs">{selectedSettlement.utr_number || "CF_TRANSFERRED"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Beneficiary Bank / Account</span>
                  <p className="font-bold text-slate-800 text-xs">
                    {selectedSettlement.bank_name || "Bank Account"} ({selectedSettlement.account_number ? `•••• ${selectedSettlement.account_number.slice(-4)}` : selectedSettlement.upi_id})
                  </p>
                </div>
              </div>

              {/* Itemized Bookings Table */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2">Itemized Slot Bookings in this Batch:</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                        <th className="p-2.5">Booking Code</th>
                        <th className="p-2.5">Player</th>
                        <th className="p-2.5">Sport</th>
                        <th className="p-2.5">Time Slot</th>
                        <th className="p-2.5 text-right">Amount (₹)</th>
                        <th className="p-2.5 text-right">Owner Share (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {settlementBookings.length > 0 ? (
                        settlementBookings.map((b) => (
                          <tr key={b.id}>
                            <td className="p-2.5 font-mono font-bold">{b.booking_code || `BK-${b.id}`}</td>
                            <td className="p-2.5 text-slate-800 font-medium">{b.user_name || "Player"}</td>
                            <td className="p-2.5 text-slate-600">{b.sport}</td>
                            <td className="p-2.5 text-slate-700">{b.time_slot || b.slot_time}</td>
                            <td className="p-2.5 text-right font-bold">₹{Number(b.amount || 0).toLocaleString("en-IN")}</td>
                            <td className="p-2.5 text-right font-bold text-emerald-700">₹{Number(b.owner_payout_amount || b.amount * 0.95).toLocaleString("en-IN")}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="p-4 text-center text-slate-500">
                            {isLoadingDetails ? "Loading slots..." : "No itemized slot records attached."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-slate-200 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailModalOpen(false)}
              className="text-xs"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
