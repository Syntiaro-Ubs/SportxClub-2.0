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
} from "lucide-react";
import { motion } from "motion/react";
import { Container } from "../components/ui/container";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
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
      ? (bookingData.venue.location || "123 Sports Complex, MG Road, Mumbai")
      : (bookingData?.location || "123 Sports Complex, MG Road, Mumbai");
  const dateStr = bookingData?.selectedDate || bookingData?.date || "June 18, 2026";
  const timeStr = bookingData?.startTime
    ? `${bookingData.startTime} (${bookingData.playHours || 1} hr)`
    : (bookingData?.time || "6:00 PM - 7:00 PM");
  const price = bookingData?.price || bookingData?.amount || 1200;
  const sportStr = bookingData?.sport || "Football";

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
              user_name: bookingData?.userName || localStorage.getItem("userName") || "SportX Player",
              user_email: bookingData?.userEmail || localStorage.getItem("userEmail") || "user@sportxclub.com",
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
          } catch (e) {}
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
                user_name: bookingData?.userName || localStorage.getItem("userName") || "SportX Player",
                user_email: bookingData?.userEmail || localStorage.getItem("userEmail") || "user@sportxclub.com",
                status: "Confirmed",
                timestamp: Date.now(),
              };
              const exists = confirmedList.some((b) => b.booking_code === newBooking.booking_code || (b.turf_name === newBooking.turf_name && b.date === newBooking.date && b.time_slot === newBooking.time_slot));
              if (!exists) {
                confirmedList.unshift(newBooking);
                localStorage.setItem("sportxclub_confirmed_bookings", JSON.stringify(confirmedList.slice(0, 50)));
              }
              sessionStorage.setItem("sportxclub_last_booking_status", "Confirmed");
            } catch (e) {}

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
                  user_name: bookingData?.userName || localStorage.getItem("userName") || "SportX Player",
                  user_email: bookingData?.userEmail || localStorage.getItem("userEmail") || "user@sportxclub.com",
                  status: "Confirmed",
                  timestamp: Date.now(),
                };
                const exists = confirmedList.some((b) => b.booking_code === newBooking.booking_code || (b.turf_name === newBooking.turf_name && b.date === newBooking.date && b.time_slot === newBooking.time_slot));
                if (!exists) {
                  confirmedList.unshift(newBooking);
                  localStorage.setItem("sportxclub_confirmed_bookings", JSON.stringify(confirmedList.slice(0, 50)));
                }
                sessionStorage.setItem("sportxclub_last_booking_status", "Confirmed");
              } catch (e) {}

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
              user_name: bookingData?.userName || localStorage.getItem("userName") || "SportX Player",
              user_email: bookingData?.userEmail || localStorage.getItem("userEmail") || "user@sportxclub.com",
              status: "Confirmed",
              timestamp: Date.now(),
            };
            confirmedList.unshift(newBooking);
            localStorage.setItem("sportxclub_confirmed_bookings", JSON.stringify(confirmedList.slice(0, 50)));
            sessionStorage.setItem("sportxclub_last_booking_status", "Confirmed");
          } catch (e) {}

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

  const handleDownloadReceipt = async () => {
    const loadingToastId = toast.loading("Generating SportX Entry Pass PDF...");
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Page background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 297, "F");

      // Center Ticket Card Container
      const cardX = 25;
      const cardY = 30;
      const cardW = 160;
      const cardH = 215;

      // Outer Card Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, "FD");

      // 1. Header Section
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text("SPORTX ENTRY PASS", cardX + 10, cardY + 14);

      // Status Badge (Paid / Active)
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(cardX + cardW - 38, cardY + 7, 28, 8, 4, 4, "FD");

      doc.setTextColor(5, 150, 105);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("PAID / ACTIVE", cardX + cardW - 24, cardY + 12.5, { align: "center" });

      // Divider Line
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(cardX + 10, cardY + 20, cardX + cardW - 10, cardY + 20);

      // 2. Details 2-Column Grid
      const col1X = cardX + 10;
      const col2X = cardX + 85;

      // Row 1: Venue & Sport
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("VENUE", col1X, cardY + 30);
      doc.text("SPORT", col2X, cardY + 30);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(String(venueName || "SportX Arena"), col1X, cardY + 37);
      doc.text(String(sportStr || "Football"), col2X, cardY + 37);

      // Row 2: Date & Time Slot
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("DATE", col1X, cardY + 49);
      doc.text("TIME SLOT", col2X, cardY + 49);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(String(dateStr || ""), col1X, cardY + 56);
      doc.text(String(timeStr || ""), col2X, cardY + 56);

      // Row 3: Cashfree Order / Booking ID
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text("CASHFREE ORDER ID", col1X, cardY + 68);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont("courier", "bold");
      doc.text(String(orderId || verificationResult?.order_id || "SPX-BK"), col1X, cardY + 75);

      // Dashed Separator Line
      doc.setLineDashPattern([2, 2], 0);
      doc.setDrawColor(226, 232, 240);
      doc.line(cardX + 10, cardY + 86, cardX + cardW - 10, cardY + 86);
      doc.setLineDashPattern([], 0);

      // 3. QR Code Box
      const qrBoxX = cardX + 35;
      const qrBoxY = cardY + 95;
      const qrBoxW = 90;
      const qrBoxH = 88;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(241, 245, 249);
      doc.roundedRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 6, 6, "FD");

      try {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(orderId || "SportXClub-Pass")}`;
        const res = await fetch(qrUrl);
        if (res.ok) {
          const blob = await res.blob();
          const base64data = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          doc.addImage(base64data, "PNG", qrBoxX + 15, qrBoxY + 8, 60, 60);
        }
      } catch (qrErr) {
        console.warn("Client QR Add Error:", qrErr);
      }

      // Subtitle below QR
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("SCAN AT RECEPTION", cardX + (cardW / 2), qrBoxY + 78, { align: "center" });

      // 4. Subtle Card Footer Information
      doc.setTextColor(148, 163, 184);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(
        `SportXClub Verified Match Pass • Paid: INR ${Number(price || 0).toLocaleString("en-IN")}`,
        cardX + (cardW / 2),
        cardY + cardH - 10,
        { align: "center" }
      );

      doc.save(`SportXClub_Pass_${orderId || "booking"}.pdf`);
      toast.dismiss(loadingToastId);
      toast.success("SportX Entry Pass downloaded successfully!");
    } catch (e) {
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
      <Container className="pt-12 pb-12 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-6 max-w-lg w-full"
        >
          {/* Header Status Badge & Icon */}
          {isSuccess ? (
            <div className="space-y-4">
              <div className="flex justify-center relative">
                <div className="relative h-20 w-20 rounded-full bg-emerald-500/10 dark:bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center shadow-xl">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ⚡ Cashfree Live Payment Successful
                </span>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                  Booking Confirmed!
                </h1>
                <p className="text-slate-500 dark:text-white/70 text-sm font-medium max-w-md mx-auto">
                  Your reservation at <span className="font-extrabold text-emerald-600">{venueName}</span> has been confirmed & locked.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-center relative">
                <div className="relative h-20 w-20 rounded-full bg-rose-500/10 dark:bg-rose-600/10 border border-rose-500/30 flex items-center justify-center shadow-xl">
                  <XCircle className="h-10 w-10 text-rose-600 dark:text-rose-500" />
                </div>
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  ⚠️ Cashfree Payment Failed
                </span>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                  Payment Failed
                </h1>
                <p className="text-slate-500 dark:text-white/70 text-sm font-medium max-w-md mx-auto">
                  {verificationResult?.message || "Your transaction was cancelled or declined on Cashfree."} <span className="font-bold text-rose-600">The slot has not been reserved.</span>
                </p>
              </div>
            </div>
          )}

          {/* Ticket / Status Card */}
          <Card className="border-border/40 shadow-xl overflow-hidden bg-white dark:bg-[#101216] rounded-3xl text-left">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <span className="text-xs font-black tracking-widest uppercase text-slate-400">
                  {isSuccess ? "SportX Entry Pass" : "Payment Attempt Info"}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${isSuccess ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
                  {isSuccess ? "Paid / Active" : "Failed / Cancelled"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Venue</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm">{venueName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Sport</p>
                  <p className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm">{sportStr}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Date</p>
                  <div className="flex items-center gap-1 text-slate-800 dark:text-white font-semibold text-xs">
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{dateStr}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Time Slot</p>
                  <div className="flex items-center gap-1 text-slate-800 dark:text-white font-semibold text-xs">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{timeStr}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Cashfree Order ID</p>
                  <p className="font-mono text-xs font-bold text-slate-800 dark:text-white">{orderId || verificationResult?.order_id || "—"}</p>
                </div>
              </div>

              {isSuccess && (
                <div className="pt-2 border-t border-dashed border-border/40 flex flex-col items-center">
                  <div className="bg-slate-50 dark:bg-black/40 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-white/[0.05] shadow-inner w-full max-w-[200px]">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SportXClub-Cashfree-Pass" alt="QR Code" className="h-24 w-24 object-contain mix-blend-multiply dark:mix-blend-normal" />
                    <span className="text-[8px] font-mono text-slate-500 mt-2 font-semibold tracking-widest uppercase">
                      Scan at Reception
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Navigation Buttons */}
          <div className="space-y-3 pt-2">
            {isSuccess ? (
              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadReceipt}
                  className="flex-1 cursor-pointer text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl h-11 gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <Download className="h-4 w-4" />
                  Download Receipt
                </Button>
                <Link to="/venues" className="flex-1">
                  <Button variant="outline" className="w-full cursor-pointer text-xs sm:text-sm font-bold border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50/20 rounded-xl h-11">
                    Book Another Turf
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate(-1)}
                  className="flex-1 cursor-pointer text-xs sm:text-sm font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-xl h-11 gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
                <Link to="/venues" className="flex-1">
                  <Button variant="outline" className="w-full cursor-pointer text-xs sm:text-sm font-bold border-2 border-slate-300 dark:border-white/20 text-slate-700 dark:text-white rounded-xl h-11">
                    Explore Turfs
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </Container>
      <GlobalFooter />
    </>
  );
}

