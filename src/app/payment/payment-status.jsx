import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { phonepeService } from "./phonepe-service";
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
} from "lucide-react";
import { motion } from "motion/react";
import { Container } from "../components/ui/container";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { GlobalFooter } from "../components/layout/GlobalFooter";

export function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const merchantTxnId = searchParams.get("merchantTransactionId") || searchParams.get("txnId") || `M22W_${Date.now()}`;

  const [isLoading, setIsLoading] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);

  // Read saved booking payload
  let bookingData = null;
  try {
    const saved = sessionStorage.getItem("sportxclub_last_booking") || sessionStorage.getItem("sportxclub_pending_booking") || sessionStorage.getItem("sportxclub_booking");
    if (saved) {
      bookingData = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error parsing pending booking data:", e);
  }

  const venueName = typeof bookingData?.venue === "object" ? (bookingData.venue.name || "Elite Sports Arena") : (bookingData?.venue || "Elite Sports Arena");
  const venueAddress = typeof bookingData?.venue === "object" ? (bookingData.venue.location || "123 Sports Complex, MG Road, Mumbai") : (bookingData?.location || "123 Sports Complex, MG Road, Mumbai");
  const dateStr = bookingData?.selectedDate || bookingData?.date || "June 18, 2026";
  const timeStr = bookingData?.startTime ? `${bookingData.startTime} (${bookingData.playHours || 1} hr)` : (bookingData?.time || "6:00 PM - 7:00 PM");
  const price = bookingData?.price || bookingData?.amount || 1200;
  const sportStr = bookingData?.sport || "Football";

  useEffect(() => {
    async function verify() {
      setIsLoading(true);
      try {
        const phonePeStatus = await phonepeService.getPaymentStatus(merchantTxnId);
        const isPaid = phonePeStatus.paymentStatus === "PAYMENT_SUCCESS";
        const result = await phonepeService.verifyPayment(
          merchantTxnId,
          isPaid ? "SUCCESS" : "FAILED",
          bookingData || { venue: venueName, date: dateStr, time: timeStr, price, sport: sportStr }
        );
        setVerificationResult(result);
        if (isPaid) {
          toast.success("PhonePe Payment Verified & Booking Saved!");
        } else {
          toast.error("Payment Failed. Slot was not reserved.");
        }
      } catch (err) {
        console.error("Verification error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    verify();
  }, [merchantTxnId]);

  const isSuccess = verificationResult?.status === "Success";

  const handleDownloadReceipt = () => {
    const loadingToastId = toast.loading("Generating receipt PDF...");
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      doc.setFont("Helvetica", "bold");
      doc.setFillColor(16, 18, 22);
      doc.rect(0, 0, 210, 40, "F");

      doc.setTextColor(5, 150, 105);
      doc.setFontSize(20);
      doc.text("SPORTXCLUB RECEIPT", 20, 25);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("Helvetica", "normal");
      doc.text(`Transaction Ref: ${verificationResult?.transactionId || merchantTxnId}`, 120, 25);

      doc.setTextColor(16, 18, 22);
      doc.setFontSize(12);
      doc.setFont("Helvetica", "bold");
      doc.text("BOOKING & PAYMENT SUMMARY", 20, 55);
      doc.line(20, 58, 190, 58);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Status: Paid / Confirmed (PhonePe Business PG)`, 20, 66);
      doc.text(`Venue: ${venueName}`, 20, 74);
      doc.text(`Address: ${venueAddress}`, 20, 82);
      doc.text(`Sport: ${sportStr}`, 20, 90);
      doc.text(`Date: ${dateStr}`, 120, 66);
      doc.text(`Time Slot: ${timeStr}`, 120, 74);
      doc.text(`Amount Paid: INR ${price}`, 120, 82);

      doc.save("PhonePe-SportXClub-Receipt.pdf");
      toast.dismiss(loadingToastId);
      toast.success("Receipt downloaded successfully!");
    } catch (e) {
      toast.dismiss(loadingToastId);
      toast.error("Failed to generate PDF receipt.");
    }
  };

  if (isLoading) {
    return (
      <Container className="py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-700 dark:text-white font-bold text-lg">Verifying PhonePe Transaction...</p>
        <p className="text-slate-400 text-sm mt-1">Updating payment record in database...</p>
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
                  ⚡ PhonePe Transaction Successful
                </span>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                  Booking Confirmed!
                </h1>
                <p className="text-slate-500 dark:text-white/70 text-sm font-medium max-w-md mx-auto">
                  Your reservation at <span className="font-extrabold text-emerald-600">{venueName}</span> has been confirmed & saved.
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
                  ⚠️ PhonePe Transaction Failed
                </span>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                  Payment Failed
                </h1>
                <p className="text-slate-500 dark:text-white/70 text-sm font-medium max-w-md mx-auto">
                  Your transaction was cancelled or declined on PhonePe. <span className="font-bold text-rose-600">The slot has not been reserved.</span>
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
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Merchant Ref ID</p>
                  <p className="font-mono text-xs font-bold text-slate-800 dark:text-white">{merchantTxnId}</p>
                </div>
              </div>

              {isSuccess && (
                <>
                  <div className="pt-2 border-t border-dashed border-border/40 flex flex-col items-center">
                    <div className="bg-slate-50 dark:bg-black/40 p-3 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-white/[0.05] shadow-inner w-full max-w-[200px]">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SportXClub-PhonePe-Ticket" alt="QR Code" className="h-24 w-24 object-contain mix-blend-multiply dark:mix-blend-normal" />
                      <span className="text-[8px] font-mono text-slate-500 mt-2 font-semibold tracking-widest uppercase">
                        Scan at Reception
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-center">
                    <Button
                      onClick={handleDownloadReceipt}
                      variant="outline"
                      className="w-full bg-transparent border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-bold rounded-xl gap-2 h-10 cursor-pointer text-xs"
                    >
                      <Download className="h-4 w-4" />
                      Download Receipt
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Navigation Buttons */}
          <div className="space-y-3 pt-2">
            {isSuccess ? (
              <div className="flex gap-3">
                <Link to="/profile" className="flex-1">
                  <Button className="w-full cursor-pointer text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl h-11">
                    Go to Profile
                  </Button>
                </Link>
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
