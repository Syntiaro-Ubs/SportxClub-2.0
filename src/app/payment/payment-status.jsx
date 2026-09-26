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

export function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId =
    searchParams.get("order_id") ||
    searchParams.get("orderId") ||
    searchParams.get("txnid") ||
    searchParams.get("merchantTransactionId") ||
    (typeof window !== "undefined" ? sessionStorage.getItem("sportxclub_cashfree_order_id") : "") ||
    "";

  const queryStatus = searchParams.get("status") || "";
  const failureReason = searchParams.get("reason") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const verifyingRef = useRef(false);

  // Read saved booking payload
  let bookingData = null;
  try {
    const saved =
      sessionStorage.getItem("sportxclub_last_booking") ||
      sessionStorage.getItem("sportxclub_pending_booking") ||
      sessionStorage.getItem("sportxclub_booking");
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
          {/* 🎟️ Exact Matching SportX Official Match Entry Ticket */}
          <div className="relative w-full max-w-[490px] mx-auto select-none pt-6">
            {/* Outer Frame Card */}
            <div className="relative bg-white dark:bg-[#111827] rounded-[24px] p-6 sm:p-7 pt-8 border-2 border-slate-700 dark:border-slate-600 shadow-2xl space-y-4 text-center transition-all">

              {/* 🟢 Top Intersecting Green Checkmark Circle Badge (Slender / Thinner Outline) */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                <div className="h-12 w-12 rounded-full bg-white dark:bg-[#111827] flex items-center justify-center shadow-xs">
                  <svg viewBox="0 0 52 52" className="h-11 w-11 text-emerald-500" fill="none">
                    {/* Circle Ring */}
                    <circle cx="23" cy="27" r="17" stroke="currentColor" strokeWidth="2.0" />
                    {/* Thinner Checkmark with tip extending out top-right */}
                    <path
                      d="M15 26.5L22 33.5L37 15"
                      stroke="currentColor"
                      strokeWidth="2.0"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* 1. Header: Payment Successful + Venue Name + City + Order ID */}
              <div className="flex flex-col items-center justify-center text-center space-y-0.5 pt-1">
                {/* Payment Successful */}
                <h1 className="text-xl sm:text-2xl font-medium text-emerald-500 tracking-normal">
                  Payment Successful!
                </h1>

                {/* Venue Name */}
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                  {venueName}
                </h2>

                {/* Location / City */}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {venueAddress?.split(",")?.slice(-2)?.[0]?.trim() || venueAddress?.split(",")?.slice(-1)?.[0]?.trim() || "Nagpur"}
                </p>

                {/* Order ID */}
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono pt-0.5">
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

              {/* 2. User Info (Full Width - Blood Group & Bold Removed) */}
              <div className="space-y-1.5 text-left pt-1">
                {/* Category / Sport Pill Tag */}
                <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-normal">
                  {sportStr} Match Pass
                </span>

                {/* User Full Name */}
                <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 tracking-normal leading-tight">
                  {playerName}
                </h3>

                {/* Info Row: Mobile Number */}
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400 dark:text-slate-500">Mobile Number: </span>
                  <span>{bookingData?.phone || bookingData?.userPhone || localStorage.getItem("userPhone") || "7410507803"}</span>
                </div>
              </div>

              {/* Center Dot Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                <div className="absolute h-2 w-2 rounded-full bg-emerald-500" />
              </div>

              {/* 3. 3 Rounded Detail Cards Grid (Regular Font, No Heavy Bold) */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                {/* Card 1 */}
                <div className="bg-white dark:bg-slate-800/90 py-2 px-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal leading-none mb-1">
                    Date:
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">
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

                {/* Card 2 */}
                <div className="bg-white dark:bg-slate-800/90 py-2 px-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal leading-none mb-1">
                    Time Slot:
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">
                    {parsedSlot.rangeText || timeStr}
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-white dark:bg-slate-800/90 py-2 px-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-2xs">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-normal leading-none mb-1">
                    Amount Paid:
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight">
                    ₹{Number(price || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* 4. Ticket Perforation Notches & Dashed Tear Line */}
              <div className="relative flex items-center justify-center my-3">
                <div className="absolute -left-7 sm:-left-8 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#030712] border-r-2 border-slate-700 dark:border-slate-600 z-10" />
                <div className="w-full border-b-2 border-dashed border-slate-300 dark:border-slate-700" />
                <div className="absolute -right-7 sm:-right-8 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#030712] border-l-2 border-slate-700 dark:border-slate-600 z-10" />
              </div>

              {/* 5. Bottom Stub: Event Date, Time Slot & Big Bracketed QR Code */}
              <div className="flex items-center justify-between gap-4 text-left pt-1">
                {/* Left Column: Event Date, Time & Official Pass Pill */}
                <div className="space-y-3 flex-1 min-w-0">
                  {/* Event Date */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>EVENT DATE</span>
                    </div>
                    <p className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 pt-0.5 leading-tight">
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

                  {/* Match Time */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>MATCH TIME</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 pt-0.5 leading-tight">
                      {parsedSlot.rangeText || timeStr}
                    </p>
                  </div>

                  {/* Payment Date & Time */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      <CreditCard className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>PAYMENT DATE</span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 pt-0.5 leading-tight">
                      {currentPaymentDate}
                    </p>
                  </div>

                  {/* Official Pass Pill */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[11px] font-normal tracking-wide">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      OFFICIAL PASS
                    </span>
                  </div>
                </div>

                {/* Right Column: Bracketed Large QR Code */}
                <div className="relative p-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-md shrink-0">
                  {/* 4 Corner Scan Brackets */}
                  <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-slate-900 dark:border-white rounded-tl-sm pointer-events-none" />
                  <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-slate-900 dark:border-white rounded-tr-sm pointer-events-none" />
                  <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-slate-900 dark:border-white rounded-bl-sm pointer-events-none" />
                  <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-slate-900 dark:border-white rounded-br-sm pointer-events-none" />

                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(orderId || "SportXClub-Pass")}`}
                    alt="Gate Pass QR"
                    className="h-28 w-28 sm:h-32 sm:w-32 object-contain"
                  />
                </div>
              </div>

              {/* 6. Footer Gate Desk Note */}
              <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-800/80">
                <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-normal">
                  Please present this PDF Pass at the gate entry desk on match day.
                </p>
              </div>

            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="space-y-3 pt-2">
            {isSuccess ? (
              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadReceipt}
                  className="flex-1 cursor-pointer text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl h-12 gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.01]"
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

