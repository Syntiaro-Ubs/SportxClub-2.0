import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../providers/auth-provider";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  CreditCard,
  Gift,
  Lock,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Separator } from "../components/ui/separator";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";

const asset = (path) => `/assets${path}`;

const getBookingData = () => {
  try {
    const saved = sessionStorage.getItem("sportxclub_booking");
    if (saved) {
      const data = JSON.parse(saved);
      return {
        venue: data.venue,
        location: "Powai, Mumbai",
        sport: data.sport,
        date: data.date,
        time: data.time,
        price: data.price,
      };
    }
  } catch (e) {
    console.error(e);
  }
  return {
    venue: "Elite Turf Arena",
    location: "Powai, Mumbai",
    sport: "Football",
    date: "June 18, 2026",
    time: "7:00 PM - 8:00 PM",
    price: 1200,
  };
};

const methods = [
  {
    id: "upi",
    title: "UPI",
    description: "Google Pay, PhonePe, Paytm",
    icon: Smartphone,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Visa, Mastercard, RuPay",
    icon: CreditCard,
  },
  {
    id: "wallet",
    title: "Wallets",
    description: "Amazon Pay, Mobikwik",
    icon: Wallet,
  },
];

const checkoutFlow = [
  "Select sport",
  "Select date",
  "Select time slot",
  "Review and pay",
];

export function Payment() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [coupon, setCoupon] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const booking = useMemo(() => getBookingData(), []);

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please login to proceed with payment.");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null; // Return null while redirecting
  }

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Booking confirmed! Check your email for details.");
      navigate("/booking-success");
    }, 2000);
  };

  const subtotal = booking.price;
  const convenienceFee = 45;
  const discount = 100;
  const tax = 135;
  const total = subtotal + convenienceFee + tax - discount;

  return (
    <div className="theme-adaptive bg-[#050505] text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6 pb-6 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        <Button
          variant="ghost"
          className="mb-6 -ml-2 inline-flex gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-white/72 hover:bg-white/[0.06]"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to venue
        </Button>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.72rem]  uppercase tracking-[0.36em] text-[#6DFF3B]/85">
              Checkout
            </p>
            <h1 className="mt-3 text-3xl  tracking-tight text-white md:text-5xl">
              Secure booking and payment
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/64 md:text-base">
              Review the venue, apply an offer, choose a payment method, and
              confirm with confidence.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600 dark:border-[#6DFF3B]/18 dark:bg-[#6DFF3B]/10 dark:text-[#6DFF3B]">
            <ShieldCheck className="h-4 w-4" />
            Secure payment
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {checkoutFlow.map((step, index) => (
            <div
              key={step}
              className={`rounded-[20px] border p-4 ${index === 3
                ? "border-[#6DFF3B]/30 bg-[#6DFF3B]/10"
                : "border-white/[0.08] bg-[#101216]"
                }`}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                Step {index + 1}
              </p>
              <p className="mt-2 text-sm  text-white">{step}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_390px]">
          <div className="space-y-6">
            <Card className="rounded-[28px] border-white/[0.08] bg-[#101216]">
              <CardHeader className="border-b border-white/[0.06] px-6 py-5">
                <CardTitle className="text-xl text-white">
                  1. Choose a payment method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid gap-3"
                >
                  {methods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <Label
                        key={method.id}
                        htmlFor={method.id}
                        className={`flex cursor-pointer items-center justify-between rounded-[20px] border p-4 transition ${paymentMethod === method.id
                          ? "border-[#6DFF3B]/30 bg-[#6DFF3B]/10"
                          : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <RadioGroupItem
                            value={method.id}
                            id={method.id}
                            className="sr-only"
                          />
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#6DFF3B]/18 bg-[#6DFF3B]/10">
                            <Icon className="h-5 w-5 text-[#6DFF3B]" />
                          </div>
                          <div>
                            <p className=" text-white">{method.title}</p>
                            <p className="mt-1 text-sm text-white/52">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        {paymentMethod === method.id ? (
                          <Check className="h-5 w-5 text-[#6DFF3B]" />
                        ) : null}
                      </Label>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-white/[0.08] bg-[#101216]">
              <CardHeader className="border-b border-white/[0.06] px-6 py-5">
                <CardTitle className="text-xl text-white">
                  2. Payment details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {paymentMethod === "upi" ? (
                  <div className="space-y-2">
                    <Label htmlFor="upi-id" className="text-sm text-white/78">
                      Enter UPI ID
                    </Label>
                    <Input
                      id="upi-id"
                      placeholder="example@okhdfcbank"
                      className="h-12 rounded-[18px] border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/35"
                    />

                    <p className="text-xs text-white/50">
                      A payment request will be sent to your UPI app.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="card-number"
                        className="text-sm text-white/78"
                      >
                        Card number
                      </Label>
                      <Input
                        id="card-number"
                        placeholder="0000 0000 0000 0000"
                        className="h-12 rounded-[18px] border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/35"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="expiry"
                          className="text-sm text-white/78"
                        >
                          Expiry date
                        </Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          className="h-12 rounded-[18px] border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/35"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-sm text-white/78">
                          CVV
                        </Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          className="h-12 rounded-[18px] border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/35"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-[22px] border border-[#6DFF3B]/18 bg-[#6DFF3B]/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#6DFF3B]/18 bg-[#050505]/60">
                      <Lock className="h-4 w-4 text-[#6DFF3B]" />
                    </div>
                    <div>
                      <p className=" text-white">
                        Secure 256-bit SSL encrypted payment
                      </p>
                      <p className="mt-1 text-sm leading-7 text-white/62">
                        Your payment details are never stored on our servers.
                        Transactions are processed securely through trusted
                        payment partners.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-white/[0.08] bg-[#101216]">
              <CardHeader className="border-b border-white/[0.06] px-6 py-5">
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Users className="h-5 w-5 text-[#6DFF3B]" />
                  Split payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <p className="text-sm leading-7 text-white/58">
                  Optionally split the cost with teammates after checkout.
                </p>
                <div className="flex flex-col gap-3 md:flex-row">
                  <Input
                    placeholder="teammate@example.com"
                    className="h-12 rounded-[18px] border-white/[0.08] bg-white/[0.03] text-white placeholder:text-white/35"
                  />

                  <Button className="h-12 rounded-[18px] bg-white/[0.08] px-5  text-white hover:bg-white/[0.12]">
                    Add player
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#101216] shadow-[0_18px_56px_-30px_rgba(0,0,0,0.85)]">
              <div className="relative aspect-[16/10] overflow-hidden">
                <ImageWithFallback
                  src={asset("/venues/turf-1.webp")}
                  alt={booking.venue}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 image-overlay bg-[linear-gradient(180deg,rgba(5,5,5,0.08),rgba(5,5,5,0.82))]" />
                <div className="absolute left-4 top-4 rounded-full border border-[#6DFF3B]/20 bg-[#6DFF3B]/10 px-3 py-1 text-xs  uppercase tracking-[0.22em] text-[#6DFF3B]">
                  Booking summary
                </div>
              </div>

              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className="text-2xl  text-white">{booking.venue}</h2>
                  <p className="mt-2 text-sm text-white/54">
                    {booking.location}
                  </p>
                </div>

                <div className="grid gap-3 rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3 text-sm text-white/72">
                    <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/10 dark:border-[#6DFF3B]/20 dark:bg-[#6DFF3B]/10 px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-emerald-600 dark:text-[#6DFF3B]">
                      {booking.sport}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/72">
                    <Calendar className="h-4 w-4 text-[#6DFF3B]" />
                    {booking.date}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/72">
                    <Clock className="h-4 w-4 text-[#6DFF3B]" />
                    {booking.time}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-white/62">
                    <span>Venue booking</span>
                    <span>₹{booking.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/62">
                    <span>Convenience fee</span>
                    <span>₹{convenienceFee}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm  text-[#6DFF3B]">
                    <span className="inline-flex items-center gap-1.5">
                      <Gift className="h-4 w-4" />
                      Promo: FIRSTGAME
                    </span>
                    <span>-₹{discount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/62">
                    <span>GST (18%)</span>
                    <span>₹{tax}</span>
                  </div>
                </div>

                <Separator className="bg-white/[0.08]" />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs  uppercase tracking-[0.28em] text-white/45">
                      Total amount
                    </p>
                    <p className="mt-1 text-3xl  text-white">
                      ₹{total.toLocaleString()}
                    </p>
                  </div>
                  <Badge className="rounded-full border-none bg-emerald-500/10 dark:bg-[#6DFF3B]/10 px-3 py-1 text-xs  uppercase tracking-[0.18em] text-emerald-600 dark:text-[#6DFF3B]">
                    Save ₹{discount}
                  </Badge>
                </div>

                <div className="space-y-3">

                  <Button
                    className="h-14 w-full rounded-[18px] bg-[#6DFF3B] text-base  text-[#050505] hover:bg-[#86ff60]"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Complete booking"}
                    {!isProcessing ? <ArrowRight className="h-5 w-5" /> : null}
                  </Button>

                  <p className="text-center text-xs leading-6 text-white/48">
                    Free cancellation up to 4 hours before the booking start
                    time.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-white/[0.08] bg-[#101216]">
              <CardContent className="space-y-3 p-6">
                <p className="text-sm  text-white">Refund policy note</p>
                <p className="text-sm leading-7 text-white/58">
                  Refund eligibility and cancellation windows are shown before
                  payment, so there are no surprises after checkout.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#050505]/94 px-4 py-3 backdrop-blur-2xl lg:hidden">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                Total
              </p>
              <p className="mt-1 text-sm  text-white">
                ₹{total.toLocaleString()}
              </p>
            </div>
            <Button
              className="h-11 rounded-[16px] bg-[#6DFF3B] px-5  text-[#050505] hover:bg-[#86ff60]"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Pay now"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
