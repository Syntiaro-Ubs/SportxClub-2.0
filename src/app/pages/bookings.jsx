import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  IndianRupee,
  Activity,
  Ticket,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../providers/auth-provider";
import { profileService } from "../services/profile.service";
import { downloadSportXPassPdf } from "../utils/ticket-pdf-generator";
import { toast } from "sonner";

export function BookingsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchUserBookings = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      let token = null;
      try {
        const pUser = JSON.parse(sessionStorage.getItem("playerUser") || localStorage.getItem("playerUser") || "{}");
        token = sessionStorage.getItem("playerToken") || localStorage.getItem("playerToken") || pUser.token || localStorage.getItem("token") || localStorage.getItem("authToken");
      } catch (e) {
        token = localStorage.getItem("token") || localStorage.getItem("authToken");
      }

      let fetchedList = [];

      // 1. Try fetching via /api/turf/bookings
      if (token) {
        try {
          const res = await fetch("/api/turf/bookings", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          const json = await res.json();
          if (json && json.success && Array.isArray(json.data)) {
            fetchedList = json.data;
          }
        } catch (e) {
          console.error("Error calling /api/turf/bookings:", e);
        }
      }

      // 2. Fallback to profile API if no bookings found yet
      if (fetchedList.length === 0 && currentUser) {
        try {
          const profData = await profileService.get(currentUser);
          if (profData?.activeBooking) {
            fetchedList.push(profData.activeBooking);
          }
        } catch (e) {
          console.error("Error fetching profile bookings:", e);
        }
      }

      setBookings(fetchedList);
    } catch (err) {
      console.error("Failed to load user bookings:", err);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [currentUser]);

  const filteredBookings = useMemo(() => {
    if (filterTab === "all") return bookings;
    if (filterTab === "upcoming") {
      return bookings.filter(
        (b) => String(b.status || "").toLowerCase() === "confirmed" || String(b.status || "").toLowerCase() === "upcoming"
      );
    }
    if (filterTab === "completed") {
      return bookings.filter((b) => String(b.status || "").toLowerCase() === "completed");
    }
    if (filterTab === "cancelled") {
      return bookings.filter(
        (b) => String(b.status || "").toLowerCase() === "cancelled" || String(b.status || "").toLowerCase() === "canceled"
      );
    }
    return bookings;
  }, [bookings, filterTab]);

  const handleDownloadTicket = (booking) => {
    try {
      const passData = {
        bookingId: booking.id || booking.booking_id,
        turfName: booking.turf_name || booking.venue || "SportX Arena",
        customerName: booking.user_name || currentUser?.fullName || currentUser?.name || "Player",
        customerEmail: booking.user_email || currentUser?.email || "",
        customerPhone: booking.user_phone || currentUser?.phone || "",
        date: booking.date || "Scheduled Date",
        timeSlot: booking.time_slot || booking.timeSlot || "Scheduled Slot",
        amountPaid: Number(booking.amount || booking.price || 0),
        sportType: booking.sport_type || booking.sport || "Football",
        status: booking.status || "Confirmed",
        paymentMethod: booking.payment_method || "Online",
      };
      downloadSportXPassPdf(passData);
      toast.success("Downloading match ticket pass...");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Could not generate ticket PDF.");
    }
  };

  if (!currentUser && !localStorage.getItem("token") && !localStorage.getItem("playerToken")) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#10131c] p-8 md:p-12 backdrop-blur-xl shadow-xl"
        >
          <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
            <Ticket className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your SportX Bookings</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Log in with your account to view your confirmed sessions, upcoming match slots, and download your match passes.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => navigate("/player-login")}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 h-11"
            >
              Sign In to View Bookings
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/venues")}
              className="rounded-xl border-slate-300 dark:border-white/20 font-semibold px-6 h-11"
            >
              Browse Venues
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6 px-4 space-y-6">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-50 to-slate-100 dark:from-emerald-950/20 dark:via-[#10131c] dark:to-[#0c0e14] p-5 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span>Player Console</span>
          </div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Venue Bookings
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Track your confirmed sports sessions, view turf details, and download digital tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUserBookings(true)}
            disabled={isRefreshing}
            className="rounded-xl border-slate-300 dark:border-white/10 h-10 px-3.5 gap-2 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-500" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={() => navigate("/venues")}
            variant="outline"
            className="rounded-xl border border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-500/10 text-xs font-bold h-10 px-4 gap-1.5 cursor-pointer shadow-none"
          >
            <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Book New Slot</span>
          </Button>
        </div>
      </motion.div>

      {/* Filter Tabs & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "all", label: "All Bookings", count: bookings.length },
            {
              id: "upcoming",
              label: "Upcoming",
              count: bookings.filter(
                (b) => String(b.status || "").toLowerCase() === "confirmed" || String(b.status || "").toLowerCase() === "upcoming"
              ).length,
            },
            {
              id: "completed",
              label: "Completed",
              count: bookings.filter((b) => String(b.status || "").toLowerCase() === "completed").length,
            },
            {
              id: "cancelled",
              label: "Cancelled",
              count: bookings.filter(
                (b) => String(b.status || "").toLowerCase() === "cancelled" || String(b.status || "").toLowerCase() === "canceled"
              ).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                filterTab === tab.id
                  ? "border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent shadow-none"
                  : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 bg-transparent hover:border-slate-300 dark:hover:border-white/20"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Showing {filteredBookings.length} {filteredBookings.length === 1 ? "booking" : "bookings"}
        </span>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Syncing your bookings from database...
          </p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-16 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-center flex flex-col items-center justify-center">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3">
            <CalendarDays className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {filterTab === "all" ? "No bookings found" : `No ${filterTab} bookings`}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {filterTab === "all"
              ? "You have not made any venue bookings yet. Explore top sports turfs and reserve your preferred slots!"
              : `There are currently no bookings under the '${filterTab}' filter.`}
          </p>
          <Button
            onClick={() => navigate("/venues")}
            variant="outline"
            className="mt-5 rounded-xl border border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-500/10 font-bold text-xs h-10 px-5 shadow-none cursor-pointer"
          >
            Explore Sports Venues
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const statusStr = String(b.status || "Confirmed").toLowerCase();
            const isConfirmed = statusStr === "confirmed" || statusStr === "upcoming";
            const isCompleted = statusStr === "completed";
            const isCancelled = statusStr === "cancelled" || statusStr === "canceled";

            const turfImg = b.turf_image || b.image_url || b.image || "/assets/venues/turf-1.webp";
            const amountVal = Number(b.amount || b.price || b.total_price || 0);

            return (
              <motion.div
                key={b.id || `booking-${b.date}-${b.time_slot}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#10131c] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Turf Photo & Details */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
                    <ImageWithFallback
                      src={turfImg}
                      alt={b.turf_name || "Turf"}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                        {b.turf_name || b.venue || "Sports Arena"}
                      </h3>
                      <Badge
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                          isConfirmed
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : isCompleted
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {b.status || "Confirmed"}
                      </Badge>
                    </div>

                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {b.sport_type || b.sport || "Football"} Match Slot
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        <span>{b.date || "Date scheduled"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                        <span>{b.time_slot || b.timeSlot || "Time Slot"}</span>
                      </div>
                      {b.booking_id && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                          <span>Ref: #{b.booking_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/5 shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Amount Paid</p>
                    <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      ₹{amountVal.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadTicket(b)}
                      className="rounded-xl border-slate-300 dark:border-white/20 h-9 px-3 gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Ticket PDF</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/venues")}
                      className="rounded-xl border border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent hover:bg-emerald-500/10 h-9 px-3.5 text-xs font-bold cursor-pointer shadow-none"
                    >
                      Book Again
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
