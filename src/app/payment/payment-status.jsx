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
          {/* 🎟️ Exact 1:1 Matching SportX Official Match Entry Ticket (Image 3) */}
          <div className="relative w-full max-w-[480px] mx-auto select-none pt-8">
            {/* Outer Pure White Ticket Card (No Outer Dark Border, Soft Shadow) */}
            <div className="relative bg-white dark:bg-[#111827] rounded-[28px] p-6 sm:p-8 pt-9 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800/60 space-y-4 text-center transition-all">

              {/* 🟢 Top Elevated Circular Checkmark Disc Badge */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20">
                <div className="h-14 w-14 rounded-full bg-white dark:bg-[#111827] flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-100 dark:border-slate-800">
                  <div className="h-11 w-11 rounded-full border-[2.5px] border-emerald-500 flex items-center justify-center">
                    <Check className="h-6 w-6 text-emerald-500 stroke-[3px]" />
                  </div>
                </div>
              </div>

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

              {/* 2. Sport Badge Pill */}
              <div className="flex justify-center pt-0.5 pb-1">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-slate-800 dark:border-slate-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider shadow-2xs">
                  <span>{getSportEmoji(sportStr)}</span>
                  <span>{sportStr || "FOOTBALL"}</span>
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

              {/* 4. Green Center Divider with Solid Emerald Dot */}
              <div className="relative flex items-center justify-center my-3 px-2">
                <div className="w-full border-t-[1.5px] border-emerald-500" />
                <div className="absolute h-3 w-3 rounded-full bg-emerald-500 shadow-xs" />
              </div>

              {/* 5. 3 Rounded Detail Cards Grid (Side by Side) */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center pt-1">
                {/* Card 1: Event Date */}
                <div className="bg-white dark:bg-slate-800/90 py-2.5 px-1.5 sm:px-2 rounded-xl border border-slate-700 dark:border-slate-500 shadow-2xs">
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium leading-none mb-1.5">
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
                <div className="bg-white dark:bg-slate-800/90 py-2.5 px-1.5 sm:px-2 rounded-xl border border-slate-700 dark:border-slate-500 shadow-2xs">
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium leading-none mb-1.5">
                    Event Time Slot:
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {parsedSlot.rangeText || timeStr}
                  </p>
                </div>

                {/* Card 3: Amount Paid */}
                <div className="bg-white dark:bg-slate-800/90 py-2.5 px-1.5 sm:px-2 rounded-xl border border-slate-700 dark:border-slate-500 shadow-2xs">
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 font-medium leading-none mb-1.5">
                    Amount Paid:
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    ₹{Number(price || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* 6. Ticket Perforation Notches & Dashed Tear Line */}
              <div className="relative flex items-center justify-center my-4">
                <div className="absolute -left-6 sm:-left-8 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#030712] shadow-inner z-10" />
                <div className="w-full border-b border-dashed border-slate-300 dark:border-slate-700" />
                <div className="absolute -right-6 sm:-right-8 w-6 h-6 rounded-full bg-slate-50 dark:bg-[#030712] shadow-inner z-10" />
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
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-slate-800 dark:border-slate-300 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wider shadow-2xs">
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

