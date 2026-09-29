import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { cashfreeService } from "./cashfree-service";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  Download,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
  Loader2,
  CreditCard,
  Building2,
  Ticket,
  QrCode,
  ShieldCheck,
  User,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { Container } from "../components/ui/container";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { downloadSportXPassPdf, parseBookingSlots } from "../utils/ticket-pdf-generator";
import { GlobalFooter } from "../components/layout/GlobalFooter";

/* ============================================================
   AUTHENTIC SPORT SVG ICON (Matches PDF)
============================================================ */
const SportIcon = ({ sport, className = "w-3.5 h-3.5" }) => {
  const s = String(sport || "").toLowerCase();
  if (s.includes("cricket")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <line x1="3.5" y1="3.5" x2="8" y2="8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <polygon points="7,9.5 9.5,7 20.5,18 18,20.5" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
        <line x1="8.5" y1="8.5" x2="19" y2="19" stroke="white" strokeWidth="0.9" />
        <circle cx="18" cy="6" r="3.2" fill="currentColor" stroke="currentColor" strokeWidth="0.8" />
        <path d="M15.5 6 C17 7.5, 19 7.5, 20.5 6" stroke="white" strokeWidth="0.8" fill="none" />
      </svg>
    );
  }
  if (s.includes("football") || s.includes("soccer")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9.5" />
        <polygon points="12,7.5 15.8,10.2 14.3,14.8 9.7,14.8 8.2,10.2" fill="currentColor" stroke="currentColor" />
        <line x1="12" y1="7.5" x2="12" y2="2.5" />
        <line x1="15.8" y1="10.2" x2="20.5" y2="8.5" />
        <line x1="14.3" y1="14.8" x2="17.5" y2="19.5" />
        <line x1="9.7" y1="14.8" x2="6.5" y2="19.5" />
        <line x1="8.2" y1="10.2" x2="3.5" y2="8.5" />
      </svg>
    );
  }
  if (s.includes("tennis")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9.5" />
        <path d="M6 3.5 C9 8, 9 16, 6 20.5" strokeWidth="1.5" />
        <path d="M18 3.5 C15 8, 15 16, 18 20.5" strokeWidth="1.5" />
      </svg>
    );
  }
  if (s.includes("badminton")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="19" r="2.5" fill="currentColor" />
        <polygon points="9.5,16.5 4,5 20,5 14.5,16.5" stroke="currentColor" fill="none" />
        <line x1="12" y1="5" x2="12" y2="16.5" />
        <line x1="7" y1="10" x2="17" y2="10" />
      </svg>
    );
  }
  if (s.includes("basketball")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9.5" />
        <line x1="2.5" y1="12" x2="21.5" y2="12" />
        <line x1="12" y1="2.5" x2="12" y2="21.5" />
        <path d="M5.5 5.5 C8.5 8.5, 8.5 15.5, 5.5 18.5" />
        <path d="M18.5 5.5 C15.5 8.5, 15.5 15.5, 18.5 18.5" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9.5" />
      <polygon points="12,7.5 15.8,10.2 14.3,14.8 9.7,14.8 8.2,10.2" fill="currentColor" stroke="currentColor" />
      <line x1="12" y1="7.5" x2="12" y2="2.5" />
      <line x1="15.8" y1="10.2" x2="20.5" y2="8.5" />
      <line x1="14.3" y1="14.8" x2="17.5" y2="19.5" />
      <line x1="9.7" y1="14.8" x2="6.5" y2="19.5" />
      <line x1="8.2" y1="10.2" x2="3.5" y2="8.5" />
    </svg>
  );
};

/* ============================================================
   TOP CHECKMARK BADGE (1:1 with PDF drawCheckBadge)
============================================================ */
function CheckBadge() {
  return (
    <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
      <div className="relative h-14 w-14 flex items-center justify-center">
        {/* White Knockout Circle to cleanly mask ticket border behind badge */}
        <div className="absolute inset-0 rounded-full bg-white dark:bg-[#111827]" />
        {/* SVG open circle + checkmark extending out top-right */}
        <svg className="w-14 h-14 relative z-10" viewBox="0 0 56 56" fill="none">
          {/* Open Circle Arc with symmetric gap at top-right (-20° to 294°) */}
          <path
            d="M 46.79 21.16 A 20 20 0 1 1 36.13 9.73"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Checkmark short leg */}
          <line
            x1="18.5"
            y1="27"
            x2="26"
            y2="34.2"
            stroke="#10B981"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          {/* Checkmark long leg extending right through opening center */}
          <line
            x1="26"
            y1="34.2"
            x2="43.6"
            y2="13.2"
            stroke="#10B981"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId =
    searchParams.get("order_id") ||
    searchParams.get("orderId") ||
    searchParams.get("txnid") ||
    searchParams.get("merchantTransactionId") ||
    (typeof window !== "undefined" ? sessionStorage.getItem("sportxclub_cashfree_order_id") : "") ||
    (typeof window !== "undefined" ? localStorage.getItem("sportxclub_cashfree_order_id") : "") ||
    "";

  const queryStatus = searchParams.get("status") || "";
  const failureReason = searchParams.get("reason") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const verifyingRef = useRef(false);

  // Read saved booking payload (checks both session and local storage for mobile redirects)
  let bookingData = null;
  try {
    const saved =
      sessionStorage.getItem("sportxclub_last_booking") ||
      sessionStorage.getItem("sportxclub_pending_booking") ||
      sessionStorage.getItem("sportxclub_booking") ||
      localStorage.getItem("sportxclub_last_booking") ||
      localStorage.getItem("sportxclub_pending_booking") ||
      localStorage.getItem("sportxclub_booking");
    if (saved) {
      bookingData = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error parsing pending booking data:", e);
  }

  const venueName =
    typeof bookingData?.venue === "object"
      ? (bookingData.venue.name || "Elite Sports Arena")
      : (bookingData?.venue || "Elite Sports Arena");
  const venueAddress =
    typeof bookingData?.venue === "object"
      ? (bookingData.venue.location || "123 Sports Complex, MG Road, Pune")
      : (bookingData?.location || "123 Sports Complex, MG Road, Pune");
  const dateStr = bookingData?.selectedDate || bookingData?.date || "2026-09-25";
  const rawTimeStr =
    verificationResult?.booking?.time_slot ||
    verificationResult?.booking?.slot_time ||
    (bookingData?.startTime
      ? `${bookingData.startTime} (${bookingData.playHours || 1} hr)`
      : bookingData?.time) ||
    "06:00 PM - 07:00 PM";
  const parsedSlot = parseBookingSlots(rawTimeStr);
  const timeStr = parsedSlot.displaySlotText || rawTimeStr;
  const price = bookingData?.price || bookingData?.amount || 1200;
  const sportStr = bookingData?.sport || "Cricket";
  const playerName =
    bookingData?.userName ||
    localStorage.getItem("userName") ||
    (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}")?.name : "") ||
    "SportX Player";

  const getSportEmoji = (sport) => {
    const s = String(sport || "").toLowerCase();
    if (s.includes("cricket")) return "🏏";
    if (s.includes("football") || s.includes("soccer")) return "⚽";
    if (s.includes("badminton")) return "🏸";
    if (s.includes("tennis")) return "🎾";
    if (s.includes("basketball")) return "🏀";
    if (s.includes("pickleball")) return "🏓";
    if (s.includes("swimming")) return "🏊";
    if (s.includes("volleyball")) return "🏐";
    return "⚡";
  };

  const handleCopyOrderId = () => {
    const codeToCopy = orderId || verificationResult?.order_id || verificationResult?.booking?.booking_code || "SPX-PASS";
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      toast.success("Order ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };



  useEffect(() => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;

    async function verify() {
      setIsLoading(true);
      try {
        if (orderId && (orderId.startsWith("WAL-") || searchParams.get("method") === "wallet" || searchParams.get("paymentMethod") === "SportX Wallet")) {
          const bookingCode = searchParams.get("booking_code") || searchParams.get("bookingCode") || orderId;
          const paymentId = searchParams.get("payment_id") || `WAL-${Date.now()}`;
          setVerificationResult({
            status: "Success",
            success: true,
            transactionId: paymentId,
            order_id: orderId,
            payment: { payment_method: "SportX Wallet", payment_status: "SUCCESS", payment_currency: "INR", payment_amount: price },
            booking: {
              booking_code: bookingCode,
              turf_name: venueName,
              amount: price,
              date: dateStr,
              time_slot: timeStr,
              payment_method: "SportX Wallet",
            },
          });
          try {
            const confirmedList = JSON.parse(localStorage.getItem("sportxclub_confirmed_bookings") || "[]");
            const newBooking = {
              booking_code: bookingCode,
              turf_name: venueName,
              venue: venueName,
              turf_id: bookingData?.venueId,
              date: dateStr,
              time_slot: timeStr,
              slot_time: timeStr,
              time: timeStr,
              sport: sportStr,
              amount: price,
              user_name: playerName,
              user_email: bookingData?.userEmail || localStorage.getItem("userEmail") || "player@sportxclub.com",
              payment_method: "SportX Wallet",
              status: "Confirmed",
              timestamp: Date.now(),
            };
            const exists = confirmedList.some((b) => b.booking_code === newBooking.booking_code);
            if (!exists) {
              confirmedList.unshift(newBooking);
              localStorage.setItem("sportxclub_confirmed_bookings", JSON.stringify(confirmedList.slice(0, 50)));
            }
            sessionStorage.setItem("sportxclub_last_booking_status", "Confirmed");
          } catch (e) { }
          setIsLoading(false);
          toast.success("⚡ SportX Wallet Payment Confirmed!");
          return;
        }

        if (orderId) {
          console.log("[PaymentStatus] Verifying Cashfree order:", orderId);
          const statusRes = await cashfreeService.getOrderStatus(orderId);

          if (statusRes.success && (statusRes.isPaid || statusRes.status === "Success")) {
            setVerificationResult({
              status: "Success",
              success: true,
              transactionId: statusRes.transactionId || statusRes.cf_payment_id || orderId,
              order_id: statusRes.order_id || orderId,
              payment: statusRes.paymentDetails,
              booking: statusRes.booking,
            });

            try {
              const confirmedList = JSON.parse(localStorage.getItem("sportxclub_confirmed_bookings") || "[]");
              const newBooking = {
                booking_code: statusRes.booking?.booking_code || orderId,
                turf_name: venueName,
                venue: venueName,
                turf_id: bookingData?.venueId,
                date: dateStr,
                time_slot: timeStr,
                slot_time: timeStr,
                time: timeStr,
                sport: sportStr,
                amount: price,
                user_name: playerName,
                user_email: bookingData?.userEmail || localStorage.getItem("userEmail") || "player@sportxclub.com",
                status: "Confirmed",
                timestamp: Date.now(),
              };
              const exists = confirmedList.some((b) => b.booking_code === newBooking.booking_code || (b.turf_name === newBooking.turf_name && b.date === newBooking.date && b.time_slot === newBooking.time_slot));
              if (!exists) {
                confirmedList.unshift(newBooking);
                localStorage.setItem("sportxclub_confirmed_bookings", JSON.stringify(confirmedList.slice(0, 50)));
              }
              sessionStorage.setItem("sportxclub_last_booking_status", "Confirmed");
            } catch (e) { }

            toast.success("Cashfree Payment Verified & Booking Confirmed!");
          } else if (statusRes.status === "Pending") {
            // Try fallback verification
            const verifyRes = await cashfreeService.verifyPayment(
              orderId,
              bookingData || { venue: venueName, date: dateStr, time: timeStr, price, sport: sportStr }
            );

            if (verifyRes.success && verifyRes.status === "Success") {
              setVerificationResult(verifyRes);

              try {
                const confirmedList = JSON.parse(localStorage.getItem("sportxclub_confirmed_bookings") || "[]");
                const newBooking = {
                  booking_code: verifyRes.booking?.booking_code || orderId,
                  turf_name: venueName,
                  venue: venueName,
                  turf_id: bookingData?.venueId,
                  date: dateStr,
                  time_slot: timeStr,
                  slot_time: timeStr,
                  time: timeStr,
                  sport: sportStr,
                  amount: price,
                  user_name: playerName,
                  user_email: bookingData?.userEmail || localStorage.getItem("userEmail") || "player@sportxclub.com",
                  status: "Confirmed",
                  timestamp: Date.now(),
                };
                const exists = confirmedList.some((b) => b.booking_code === newBooking.booking_code || (b.turf_name === newBooking.turf_name && b.date === newBooking.date && b.time_slot === newBooking.time_slot));
                if (!exists) {
                  confirmedList.unshift(newBooking);
                  localStorage.setItem("sportxclub_confirmed_bookings", JSON.stringify(confirmedList.slice(0, 50)));
                }
                sessionStorage.setItem("sportxclub_last_booking_status", "Confirmed");
              } catch (e) { }

              toast.success("Cashfree Payment Verified & Booking Confirmed!");
            } else {
              setVerificationResult({
                status: "Pending",
                success: false,
                message: "Payment is pending or awaiting bank settlement.",
              });
              toast.info("Payment is being processed by your bank.");
            }
          } else {
            setVerificationResult({
              status: "Failed",
              success: false,
              message: statusRes.message || failureReason || "Payment was not completed on Cashfree.",
            });
            toast.error("Payment Failed. The slot was not reserved.");
          }
        } else if (queryStatus.toLowerCase() === "success") {
          setVerificationResult({
            status: "Success",
            success: true,
            transactionId: `CF_${Date.now()}`,
          });

          try {
            const confirmedList = JSON.parse(localStorage.getItem("sportxclub_confirmed_bookings") || "[]");
            const newBooking = {
              booking_code: `CF_${Date.now()}`,
              turf_name: venueName,
              venue: venueName,
              turf_id: bookingData?.venueId,
              date: dateStr,
              time_slot: timeStr,
              slot_time: timeStr,
              time: timeStr,
              sport: sportStr,
              amount: price,
              user_name: playerName,
              user_email: bookingData?.userEmail || localStorage.getItem("userEmail") || "player@sportxclub.com",
              status: "Confirmed",
              timestamp: Date.now(),
            };
            confirmedList.unshift(newBooking);
            localStorage.setItem("sportxclub_confirmed_bookings", JSON.stringify(confirmedList.slice(0, 50)));
            sessionStorage.setItem("sportxclub_last_booking_status", "Confirmed");
          } catch (e) { }

          toast.success("Payment Confirmed!");
        } else {
          setVerificationResult({
            status: "Failed",
            success: false,
            message: failureReason || "No order reference found.",
          });
        }
      } catch (err) {
        console.error("Verification error:", err);
        setVerificationResult({
          status: "Failed",
          success: false,
          message: err.message || "Failed verifying transaction.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    verify();
  }, [orderId, queryStatus]);

  const isSuccess =
    verificationResult?.status === "Success" ||
    verificationResult?.success === true ||
    queryStatus.toLowerCase() === "success";

  const currentPaymentDate = (() => {
    try {
      const now = new Date();
      return now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) + ", " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "26 Sep 2026, 08:30 PM";
    }
  })();

  const handleDownloadReceipt = async () => {
    const loadingToastId = toast.loading("Generating SportX Official Entry Pass PDF...");
    try {
      await downloadSportXPassPdf({
        orderId: orderId || verificationResult?.order_id || verificationResult?.booking?.booking_code || "SPX-PASS",
        userName: playerName || "SportX Player",
        userPhone: bookingData?.phone || bookingData?.userPhone || localStorage.getItem("userPhone") || "7410507803",
        turfName: venueName || "MODI PUBLIC GROUND",
        location: venueAddress?.split(",")?.slice(-2)?.[0]?.trim() || venueAddress?.split(",")?.slice(-1)?.[0]?.trim() || "Nagpur",
        sport: sportStr || "Football",
        date: (() => {
          try {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) {
              return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
            }
          } catch {}
          return dateStr || "25 Sep 2026";
        })(),
        timeSlot: parsedSlot.rangeText || timeStr || "10:00 PM - 11:00 PM",
        amount: price || 1,
        paymentDate: currentPaymentDate,
      }, `SportXClub_Pass_${orderId || "booking"}.pdf`);

      toast.dismiss(loadingToastId);
      toast.success("SportX Entry Pass downloaded successfully!");
    } catch (e) {
      console.error("PDF generation error:", e);
      toast.dismiss(loadingToastId);
      toast.error("Failed to generate PDF pass.");
    }
  };

  if (isLoading) {
    return (
      <Container className="py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-700 dark:text-white font-bold text-lg">Verifying Cashfree Live Payment...</p>
        <p className="text-slate-400 text-sm mt-1">Confirming transaction with Cashfree gateway...</p>
      </Container>
    );
  }

  return (
    <>
      <Container className="pt-8 pb-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="text-center space-y-6 max-w-[490px] w-full"
        >
          {/* 🎟️ Exact 1:1 Matching SportX Official Match Entry Ticket (Matches match-pass-pdf.js) */}
          <div className="relative w-full max-w-[480px] mx-auto select-none pt-8">
            {/* Outer Ticket Card with 1:1 PDF Navy Border */}
            <div className="relative bg-white dark:bg-[#111827] rounded-[24px] p-6 sm:p-8 pt-9 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border-[1.5px] border-[#0F2A43] dark:border-slate-300 space-y-4 text-center transition-all">

              {/* 🟢 Top Elevated Circular Checkmark Disc Badge (Exact 1:1 match with PDF) */}
              <CheckBadge />

              {/* 1. Header: Payment Successful + Venue Name + City + Order ID */}
              <div className="flex flex-col items-center justify-center text-center space-y-1 pt-2">
                {/* Payment Successful */}
                <h1 className="text-2xl sm:text-[26px] font-bold text-emerald-500 tracking-normal">
                  Payment Successful!
                </h1>

                {/* Venue Name */}
                <h2 className="text-xl sm:text-[22px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wide pt-1">
                  {venueName}
                </h2>

                {/* Location / City */}
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {venueAddress?.split(",")?.slice(-2)?.[0]?.trim() || venueAddress?.split(",")?.slice(-1)?.[0]?.trim() || "Nagpur"}
                </p>

                {/* Order ID */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono pt-0.5">
                  <span>{orderId || verificationResult?.order_id || "order_spx_1790347058513_950"}</span>
                  <button
                    onClick={handleCopyOrderId}
                    className="text-slate-400 hover:text-emerald-600 transition-colors p-0.5 rounded cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* 2. Sport Badge Pill (Snug & Centered 1:1 with PDF) */}
              <div className="flex justify-center pt-0.5 pb-1">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border-[1.2px] border-[#0F2A43] dark:border-slate-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider">
                  <SportIcon sport={sportStr} className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                  <span>{String(sportStr || "FOOTBALL").toUpperCase()}</span>
                </div>
              </div>

              {/* 3. Player Full Name & Mobile Number */}
              <div className="space-y-1 text-center pt-0.5">
                <h3 className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {playerName}
                </h3>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Mobile Number: {bookingData?.phone || bookingData?.userPhone || localStorage.getItem("userPhone") || "7410507803"}
                </p>
              </div>

              {/* 4. Center Divider with Solid Emerald Dot (Exact 1:1 with PDF) */}
              <div className="relative flex items-center justify-center my-3.5 w-3/5 mx-auto">
                <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                <div className="absolute h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>

              {/* 5. 3 Rounded Detail Cards Grid (Side by Side 1:1 with PDF) */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center pt-1">
                {/* Card 1: Event Date */}
                <div className="bg-white dark:bg-slate-800/90 py-2.5 px-1.5 sm:px-2 rounded-xl border-[1.2px] border-[#0F2A43] dark:border-slate-600 shadow-2xs">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-none mb-1.5">
                    Event Date:
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {(() => {
                      try {
                        const d = new Date(dateStr);
                        if (!isNaN(d.getTime())) {
                          return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                        }
                      } catch (e) { }
                      return dateStr;
                    })()}
                  </p>
                </div>

                {/* Card 2: Event Time Slot */}
                <div className="bg-white dark:bg-slate-800/90 py-2.5 px-1.5 sm:px-2 rounded-xl border-[1.2px] border-[#0F2A43] dark:border-slate-600 shadow-2xs">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-none mb-1.5">
                    Event Time Slot:
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {parsedSlot.rangeText || timeStr}
                  </p>
                </div>

                {/* Card 3: Amount Paid */}
                <div className="bg-white dark:bg-slate-800/90 py-2.5 px-1.5 sm:px-2 rounded-xl border-[1.2px] border-[#0F2A43] dark:border-slate-600 shadow-2xs">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-none mb-1.5">
                    Amount Paid:
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Rs. {Number(price || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* 6. Ticket Perforation Notches & Dashed Tear Line (Exact 1:1 with match-pass-pdf.js) */}
              <div className="relative flex items-center justify-center my-4 -mx-6 sm:-mx-8">
                {/* Left Inward Notch (Cleanly breaks ticket border & indents inward) */}
                <svg
                  className="absolute -left-[1.5px] top-1/2 -translate-y-1/2 z-10 overflow-visible pointer-events-none"
                  width="16"
                  height="32"
                  viewBox="0 0 16 32"
                >
                  {/* Knockout fill to erase straight card border behind notch */}
                  <polygon points="-3,-2 3,-2 14,16 3,34 -3,34" className="fill-white dark:fill-[#0b0f19]" />
                  {/* Inward Notch Chevron Line */}
                  <polyline
                    points="0,0 13,16 0,32"
                    fill="none"
                    className="stroke-[#0F2A43] dark:stroke-slate-300"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Dashed Tear Line */}
                <div className="w-full border-b border-dashed border-slate-300 dark:border-slate-700 mx-5" />

                {/* Right Inward Notch (Cleanly breaks ticket border & indents inward) */}
                <svg
                  className="absolute -right-[1.5px] top-1/2 -translate-y-1/2 z-10 overflow-visible pointer-events-none"
                  width="16"
                  height="32"
                  viewBox="0 0 16 32"
                >
                  {/* Knockout fill to erase straight card border behind notch */}
                  <polygon points="19,-2 13,-2 2,16 13,34 19,34" className="fill-white dark:fill-[#0b0f19]" />
                  {/* Inward Notch Chevron Line */}
                  <polyline
                    points="16,0 3,16 16,32"
                    fill="none"
                    className="stroke-[#0F2A43] dark:stroke-slate-300"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* 7. Bottom Section: Payment Date, Official Pass Badge & Bracketed QR Code */}
              <div className="flex items-center justify-between gap-4 text-left pt-1 px-1">
                {/* Left Side Details */}
                <div className="space-y-3.5 flex-1 min-w-0">
                  {/* Payment Date & Time */}
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-normal">Payment Date:</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white pt-0.5 leading-tight">
                      {currentPaymentDate}
                    </p>
                  </div>

                  {/* Stadium Pill: OFFICIAL PASS 🟢 */}
                  <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border-[1.2px] border-[#0F2A43] dark:border-slate-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider">
                      <span>OFFICIAL PASS</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Right Side: Bracketed Square QR Code */}
                <div className="relative p-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm shrink-0">
                  {/* 4 Corner Scan Brackets */}
                  <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-slate-900 dark:border-white rounded-tl-[2px] pointer-events-none" />
                  <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-slate-900 dark:border-white rounded-tr-[2px] pointer-events-none" />
                  <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-slate-900 dark:border-white rounded-bl-[2px] pointer-events-none" />
                  <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-slate-900 dark:border-white rounded-br-[2px] pointer-events-none" />

                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(orderId || "SportXClub-Pass")}`}
                    alt="Gate Pass QR"
                    className="h-24 w-24 sm:h-28 sm:w-28 object-contain"
                  />
                </div>
              </div>

              {/* 8. Footer Gate Desk Note */}
              <div className="pt-3 text-center border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-normal">
                  Please present this PDF Pass at the gate entry desk on match day.
                </p>
              </div>

            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="space-y-3 pt-2 max-w-[480px] mx-auto w-full">
            {isSuccess ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDownloadReceipt}
                  className="flex-1 cursor-pointer text-sm font-bold border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 bg-transparent rounded-xl h-12 gap-2 shadow-xs transition-all hover:scale-[1.01]"
                >
                  <Download className="h-4 w-4" />
                  Download Entry Pass
                </Button>
                <Link to="/venues" className="flex-1">
                  <Button variant="outline" className="w-full cursor-pointer text-xs sm:text-sm font-bold border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50/30 rounded-xl h-12">
                    Book Another Turf
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5 w-full">
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate(-1)}
                    className="flex-1 cursor-pointer text-xs sm:text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-xl h-12 gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                  </Button>
                  <Link to="/venues" className="flex-1">
                    <Button variant="outline" className="w-full cursor-pointer text-xs sm:text-sm font-bold border-2 border-slate-300 dark:border-white/20 text-slate-700 dark:text-white rounded-xl h-12">
                      Explore Turfs
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </Container>
      <GlobalFooter />
    </>
  );
}

