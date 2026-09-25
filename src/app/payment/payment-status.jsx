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
  const timeStr = bookingData?.startTime
    ? `${bookingData.startTime} (${bookingData.playHours || 1} hr)`
    : (bookingData?.time || "06:00 PM - 07:00 PM");
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
              user_name: playerName,
              user_email: bookingData?.userEmail || localStorage.getItem("userEmail") || "player@sportxclub.com",
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
    const loadingToastId = toast.loading("Generating SportX Official Entry Pass PDF...");
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Page background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 297, "F");

      // Center Ticket Card Container
      const cardX = 30;
      const cardY = 25;
      const cardW = 150;
      const cardH = 225;

      // Outer Card Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, "FD");

      // 1. Header Section (Clean White Background with Center Checkmark)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(cardX, cardY, cardW, cardH, 8, 8, "FD");

      // Outer Green Accent Frame
      doc.setDrawColor(5, 150, 105);
      doc.setLineWidth(0.8);
      doc.roundedRect(cardX + 2, cardY + 2, cardW - 4, cardH - 4, 7, 7, "D");

      // Checkmark Icon Circle
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      doc.circle(cardX + (cardW / 2), cardY + 16, 7, "FD");
      doc.setTextColor(5, 150, 105);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("✓", cardX + (cardW / 2), cardY + 18.5, { align: "center" });

      // Payment Successful Title
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 150, 105);
      doc.text("Payment Successful!", cardX + (cardW / 2), cardY + 29, { align: "center" });

      // SPORTX PASS
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("SPORTX PASS", cardX + (cardW / 2), cardY + 35.5, { align: "center" });

      // Official Entry Ticket
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Official Entry Ticket", cardX + (cardW / 2), cardY + 40, { align: "center" });

      // 2. Venue & Sport Header Row
      const venueRowY = cardY + 50;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(String(venueName || "JP Cricket Club"), cardX + 12, venueRowY);

      // Sport Badge Pill (Right)
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(cardX + cardW - 38, venueRowY - 5, 26, 7, 3.5, 3.5, "FD");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.text(String(sportStr || "Cricket").toUpperCase(), cardX + cardW - 25, venueRowY - 0.5, { align: "center" });

      // 3. 2×2 Detail Cards Grid
      const gridStartY = cardY + 58;
      const boxW = 60;
      const boxH = 17;
      const col1 = cardX + 12;
      const col2 = cardX + cardW - 12 - boxW;

      // Card 1: Date (Row 1, Col 1)
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(col1, gridStartY, boxW, boxH, 3, 3, "FD");
      // Icon Box
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(col1 + 2.5, gridStartY + 2.5, 12, 12, 2, 2, "F");
      doc.setTextColor(5, 150, 105);
      doc.setFontSize(8);
      doc.text("📅", col1 + 8.5, gridStartY + 10.5, { align: "center" });
      // Text
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text("Date:", col1 + 17, gridStartY + 6.5);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text(String(dateStr || ""), col1 + 17, gridStartY + 12);

      // Card 2: Time Slot (Row 1, Col 2)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(col2, gridStartY, boxW, boxH, 3, 3, "FD");
      // Icon Box
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(col2 + 2.5, gridStartY + 2.5, 12, 12, 2, 2, "F");
      doc.setTextColor(5, 150, 105);
      doc.setFontSize(8);
      doc.text("⏰", col2 + 8.5, gridStartY + 10.5, { align: "center" });
      // Text
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text("Time Slot:", col2 + 17, gridStartY + 6.5);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(String(timeStr || ""), col2 + 17, gridStartY + 12);

      // Card 3: Pass Holder (Row 2, Col 1)
      const row2Y = gridStartY + 21;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(col1, row2Y, boxW, boxH, 3, 3, "FD");
      // Icon Box
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(col1 + 2.5, row2Y + 2.5, 12, 12, 2, 2, "F");
      doc.setTextColor(5, 150, 105);
      doc.setFontSize(8);
      doc.text("👤", col1 + 8.5, row2Y + 10.5, { align: "center" });
      // Text
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text("Pass Holder:", col1 + 17, row2Y + 6.5);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text(String(playerName || "Shri W"), col1 + 17, row2Y + 12);

      // Card 4: Amount Paid (Row 2, Col 2)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(col2, row2Y, boxW, boxH, 3, 3, "FD");
      // Icon Box
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(col2 + 2.5, row2Y + 2.5, 12, 12, 2, 2, "F");
      doc.setTextColor(5, 150, 105);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("₹", col2 + 8.5, row2Y + 11, { align: "center" });
      // Text
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.text("Amount Paid:", col2 + 17, row2Y + 6.5);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`INR ${Number(price || 0).toLocaleString("en-IN")}`, col2 + 17, row2Y + 12);

      // 4. Perforated Notch Tear Line
      const tearY = cardY + 106;
      doc.setLineDashPattern([2, 2], 0);
      doc.setDrawColor(203, 213, 225);
      doc.line(cardX + 8, tearY, cardX + cardW - 8, tearY);
      doc.setLineDashPattern([], 0);

      // Semicircle punches
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(5, 150, 105);
      doc.circle(cardX, tearY, 4.5, "FD");
      doc.circle(cardX + cardW, tearY, 4.5, "FD");

      // 5. Bottom Stub (Split Order ID on left + QR Code on right)
      const stubY = tearY + 12;
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("Cashfree Order ID:", col1, stubY);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont("courier", "bold");
      doc.text(String(orderId || verificationResult?.order_id || "SPX-PASS"), col1, stubY + 7);

      // QR Code Container on Right
      const qrW = 44;
      const qrH = 44;
      const qrX = cardX + cardW - 12 - qrW;
      const qrY = stubY - 4;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(qrX, qrY, qrW, qrH, 3, 3, "FD");

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
          doc.addImage(base64data, "PNG", qrX + 3, qrY + 3, qrW - 6, qrH - 6);
        }
      } catch (qrErr) {
        console.warn("Client QR Add Error:", qrErr);
      }

      // Barcode & Scan Text at bottom
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text("||||||||||||||||||||||||||||||||||||||||||||||||||||||||", cardX + (cardW / 2), cardY + cardH - 12, { align: "center" });
      doc.setFontSize(6.5);
      doc.text("SCAN AT RECEPTION / GATE FOR ENTRY", cardX + (cardW / 2), cardY + cardH - 7, { align: "center" });

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
      <Container className="pt-8 pb-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="text-center space-y-6 max-w-md w-full"
        >
          {/* 🎟️ Exact Matching SportX Official Match Entry Ticket */}
          <div className="relative w-full max-w-md mx-auto select-none">
            {/* Emerald Accent Outer Frame Container */}
            <div className="relative bg-white dark:bg-[#0f172a] rounded-[32px] p-1.5 border-2 border-emerald-600/70 dark:border-emerald-500/60 shadow-2xl overflow-hidden transition-all">
              
              {/* Inner White Ticket Body */}
              <div className="relative bg-white dark:bg-[#111827] rounded-[26px] p-5 sm:p-6 space-y-5">
                
                {/* 1. Header: Green Checkmark + Payment Successful + SPORTX PASS */}
                <div className="flex flex-col items-center justify-center text-center space-y-1.5 pt-1">
                  {/* Large Green Checkmark Circle */}
                  <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/40 flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="h-9 w-9 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
                  </div>

                  {/* Payment Successful Title */}
                  <h1 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    Payment Successful!
                  </h1>

                  {/* SPORTX PASS Bold Label */}
                  <div className="space-y-0.5">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-wider uppercase">
                      SPORTX PASS
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Official Entry Ticket
                    </p>
                  </div>
                </div>

                {/* 2. Venue & Sport Tag Row */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                      {venueName}
                    </h3>
                  </div>

                  {/* Sport Badge Pill */}
                  <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black uppercase text-slate-800 dark:text-slate-200 shadow-2xs">
                    <span>{getSportEmoji(sportStr)}</span>
                    <span>{sportStr}</span>
                  </span>
                </div>

                {/* 3. 2×2 Detail Cards Grid */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  {/* Date Card */}
                  <div className="bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 flex items-center gap-3 shadow-2xs">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-none mb-1">
                        Date:
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {dateStr}
                      </p>
                    </div>
                  </div>

                  {/* Time Slot Card */}
                  <div className="bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 flex items-center gap-3 shadow-2xs">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-none mb-1">
                        Time Slot:
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {timeStr}
                      </p>
                    </div>
                  </div>

                  {/* Pass Holder Card */}
                  <div className="bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 flex items-center gap-3 shadow-2xs">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-none mb-1">
                        Pass Holder:
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {playerName}
                      </p>
                    </div>
                  </div>

                  {/* Amount Paid Card */}
                  <div className="bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 flex items-center gap-3 shadow-2xs">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base leading-none">
                        ₹
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-none mb-1">
                        Amount Paid:
                      </p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        ₹{Number(price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Realistic Perforation Notches & Dashed Tear Line */}
                <div className="relative flex items-center justify-center py-1">
                  <div className="absolute -left-6 sm:-left-7 w-7 h-7 rounded-full bg-slate-50 dark:bg-[#030712] border-r-2 border-emerald-600/70 dark:border-emerald-500/60 z-10" />
                  <div className="w-full border-b-2 border-dashed border-slate-200 dark:border-slate-700/80" />
                  <div className="absolute -right-6 sm:-right-7 w-7 h-7 rounded-full bg-slate-50 dark:bg-[#030712] border-l-2 border-emerald-600/70 dark:border-emerald-500/60 z-10" />
                </div>

                {/* 5. Bottom Stub: Left Order ID + Right Bracketed QR Code */}
                <div className="flex items-center justify-between gap-4 pt-1 text-left">
                  {/* Left Column: Cashfree Order ID */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Cashfree Order ID:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 break-all">
                        {orderId || verificationResult?.order_id || "SPX_1790336281335_823"}
                      </span>
                      <button
                        onClick={handleCopyOrderId}
                        className="text-slate-400 hover:text-emerald-600 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shrink-0"
                        title="Copy Order ID"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: QR Code with 4 Emerald Corner Scan Brackets */}
                  <div className="relative p-2.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-md shrink-0">
                    {/* Top-Left Corner Bracket */}
                    <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-600 rounded-tl-sm pointer-events-none" />
                    {/* Top-Right Corner Bracket */}
                    <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-600 rounded-tr-sm pointer-events-none" />
                    {/* Bottom-Left Corner Bracket */}
                    <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-600 rounded-bl-sm pointer-events-none" />
                    {/* Bottom-Right Corner Bracket */}
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-600 rounded-br-sm pointer-events-none" />

                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(orderId || "SportXClub-Pass")}`}
                      alt="Gate Pass QR"
                      className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
                    />
                  </div>
                </div>

                {/* 6. Barcode Strip & Reception Note */}
                <div className="flex flex-col items-center justify-center pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-[2.5px] opacity-70 dark:opacity-60">
                    {Array.from({ length: 38 }).map((_, i) => (
                      <div
                        key={i}
                        className={`bg-slate-900 dark:bg-slate-200 rounded-xs ${
                          i % 5 === 0 ? "w-1 h-6" : i % 3 === 0 ? "w-0.5 h-6" : "w-[1px] h-5"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    SCAN AT RECEPTION / GATE FOR ENTRY
                  </span>
                </div>

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
            )}
          </div>
        </motion.div>
      </Container>
      <GlobalFooter />
    </>
  );
}

