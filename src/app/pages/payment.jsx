import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../providers/auth-provider";
import { useTheme } from "next-themes";
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
  X,
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
import { cn } from "../components/ui/utils";

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [coupon, setCoupon] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [teammates, setTeammates] = useState([]);
  const [teammateInput, setTeammateInput] = useState("");
  const booking = useMemo(() => getBookingData(), []);

  const addTeammate = () => {
    if (!teammateInput.trim()) return;
    if (teammates.includes(teammateInput.trim())) {
      toast.error("Teammate already added.");
      return;
    }
    setTeammates([...teammates, teammateInput.trim()]);
    setTeammateInput("");
    toast.success("Teammate added!");
  };

  const removeTeammate = (email) => {
    setTeammates(teammates.filter((item) => item !== email));
  };

  const formatBookingDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

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
    <div className={cn(
      "min-h-screen transition-colors duration-300 isolate",
      isDark ? "bg-[#060813] text-white" : "bg-slate-50 text-slate-900"
    )}>
      <div className="mx-auto max-w-[1400px] px-4 py-6 pb-6 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        <Button
          variant="ghost"
          className={cn(
            "mb-6 -ml-2 inline-flex gap-2 rounded-full border px-4 py-2 cursor-pointer transition-all",
            isDark
              ? "border-white/[0.08] bg-white/[0.03] text-white/80 hover:bg-white/[0.06] hover:text-white"
              : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
          )}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to venue</span>
        </Button>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={cn(
              "text-[10px] uppercase tracking-widest font-black",
              isDark ? "text-[#6DFF3B]" : "text-emerald-600"
            )}>
              Checkout
            </p>
            <h1 className={cn(
              "mt-2 text-3xl tracking-tight font-black md:text-4xl lg:text-5xl",
              isDark ? "text-white" : "text-slate-900"
            )}>
              Secure booking and payment
            </h1>
            <p className={cn(
              "mt-3 max-w-2xl text-sm leading-relaxed",
              isDark ? "text-white/60" : "text-slate-500"
            )}>
              Review the venue, apply an offer, choose a payment method, and confirm with confidence.
            </p>
          </div>

          <div className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-wider",
            isDark
              ? "border-[#6DFF3B]/20 bg-[#6DFF3B]/10 text-[#6DFF3B]"
              : "border-emerald-300 bg-emerald-50 text-emerald-700"
          )}>
            <ShieldCheck className="h-4.5 w-4.5" />
            <span>Secure payment</span>
          </div>
        </div>

        {/* Sleek Stepper Timeline */}
        <div className="mb-12 relative flex items-center justify-between max-w-3xl mx-auto px-4 select-none">
          <div className={cn(
            "absolute left-8 right-8 top-1/2 h-0.5 -translate-y-1/2 pointer-events-none z-0",
            isDark ? "bg-white/[0.08]" : "bg-slate-200"
          )} />
          <div 
            className="absolute left-8 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-[#6DFF3B] dark:to-[#86ff60] transition-all duration-500 z-0" 
            style={{ width: "75%" }} 
          />

          {checkoutFlow.map((step, index) => {
            const isActive = index === 3;
            const isCompleted = index < 3;
            return (
              <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-extrabold text-sm shadow-md",
                    isCompleted
                      ? "bg-emerald-600 border-emerald-600 text-white dark:bg-[#6DFF3B] dark:border-[#6DFF3B] dark:text-black shadow-[0_0_15px_rgba(109,255,59,0.2)]"
                      : isActive
                        ? isDark
                          ? "bg-[#0d0f15] border-[#6DFF3B] text-[#6DFF3B] shadow-[0_0_20px_rgba(109,255,59,0.3)] scale-110"
                          : "bg-white border-emerald-600 text-emerald-600 shadow-md scale-110"
                        : isDark
                          ? "bg-[#101216] border-white/10 text-white/40"
                          : "bg-slate-100 border-slate-200 text-slate-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4.5 w-4.5 stroke-[3px]" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider hidden sm:block",
                    isActive
                      ? isDark ? "text-[#6DFF3B]" : "text-emerald-700"
                      : isDark ? "text-white/40" : "text-slate-400"
                  )}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_390px]">
          <div className="space-y-6">
            <Card className={cn(
              "rounded-[28px] border overflow-hidden backdrop-blur-xl transition-all duration-300",
              isDark ? "border-white/10 bg-[#101216]/60 shadow-2xl" : "border-slate-200 bg-white shadow-md"
            )}>
              <CardHeader className={cn(
                "border-b px-6 py-5",
                isDark ? "border-white/5" : "border-slate-100"
              )}>
                <CardTitle className={cn(
                  "text-lg font-extrabold tracking-tight",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  1. Choose a payment method
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {methods.map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "flex flex-col items-center text-center p-5 rounded-[22px] border transition-all duration-300 cursor-pointer select-none gap-3 relative overflow-hidden group",
                          isSelected
                            ? isDark
                              ? "border-[#6DFF3B] bg-[#6DFF3B]/10 text-white shadow-[0_0_20px_rgba(109,255,59,0.15)] scale-[1.02]"
                              : "border-emerald-600 bg-emerald-50/50 text-slate-800 shadow-md scale-[1.02]"
                            : isDark
                              ? "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/20 hover:text-white"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        )}
                      >
                        {isSelected && (
                          <div className={cn(
                            "absolute top-3 right-3 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold",
                            isDark ? "bg-[#6DFF3B] text-black" : "bg-emerald-600 text-white"
                          )}>
                            <Check className="h-3 w-3 stroke-[3px]" />
                          </div>
                        )}

                        <div className={cn(
                          "h-12 w-12 rounded-full border flex items-center justify-center transition-all duration-300",
                          isSelected
                            ? isDark
                              ? "border-[#6DFF3B]/30 bg-[#6DFF3B]/20 text-[#6DFF3B]"
                              : "border-emerald-500/30 bg-emerald-100 text-emerald-700"
                            : isDark
                              ? "border-white/10 bg-white/5 text-white/50 group-hover:text-white"
                              : "border-slate-200 bg-slate-100 text-slate-400 group-hover:text-slate-700"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="font-extrabold text-sm">{method.title}</p>
                          <p className={cn(
                            "text-[10px] mt-1 tracking-wide leading-normal",
                            isSelected
                              ? isDark ? "text-white/60" : "text-slate-500"
                              : isDark ? "text-white/40" : "text-slate-400"
                          )}>
                            {method.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "rounded-[28px] border overflow-hidden backdrop-blur-xl transition-all duration-300",
              isDark ? "border-white/10 bg-[#101216]/60 shadow-2xl" : "border-slate-200 bg-white shadow-md"
            )}>
              <CardHeader className={cn(
                "border-b px-6 py-5",
                isDark ? "border-white/5" : "border-slate-100"
              )}>
                <CardTitle className={cn(
                  "text-lg font-extrabold tracking-tight",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  2. Payment details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {paymentMethod === "upi" ? (
                  <div className="space-y-2">
                    <Label htmlFor="upi-id" className={cn(
                      "text-xs font-bold uppercase tracking-wider",
                      isDark ? "text-white/70" : "text-slate-600"
                    )}>
                      Enter UPI ID
                    </Label>
                    <Input
                      id="upi-id"
                      placeholder="example@okhdfcbank"
                      className={cn(
                        "h-12 rounded-[18px] border transition-all outline-none font-medium",
                        isDark
                          ? "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#6DFF3B]/50 focus:ring-1 focus:ring-[#6DFF3B]/50"
                          : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                      )}
                    />
                    <p className={cn(
                      "text-[10px] font-bold leading-normal",
                      isDark ? "text-white/40" : "text-slate-400"
                    )}>
                      A payment request will be sent to your UPI app.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="card-number" className={cn(
                        "text-xs font-bold uppercase tracking-wider",
                        isDark ? "text-white/70" : "text-slate-600"
                      )}>
                        Card number
                      </Label>
                      <Input
                        id="card-number"
                        placeholder="0000 0000 0000 0000"
                        className={cn(
                          "h-12 rounded-[18px] border transition-all outline-none font-medium",
                          isDark
                            ? "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#6DFF3B]/50 focus:ring-1 focus:ring-[#6DFF3B]/50"
                            : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                        )}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="expiry" className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          isDark ? "text-white/70" : "text-slate-600"
                        )}>
                          Expiry date
                        </Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          className={cn(
                            "h-12 rounded-[18px] border transition-all outline-none font-medium",
                            isDark
                              ? "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#6DFF3B]/50 focus:ring-1 focus:ring-[#6DFF3B]/50"
                              : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                          )}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          isDark ? "text-white/70" : "text-slate-600"
                        )}>
                          CVV
                        </Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          className={cn(
                            "h-12 rounded-[18px] border transition-all outline-none font-medium",
                            isDark
                              ? "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#6DFF3B]/50 focus:ring-1 focus:ring-[#6DFF3B]/50"
                              : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Trust SSL Badge Box */}
                <div className={cn(
                  "rounded-[22px] border p-4 transition-colors duration-300",
                  isDark
                    ? "border-[#6DFF3B]/20 bg-[#6DFF3B]/5"
                    : "border-emerald-500/20 bg-emerald-50/50"
                )}>
                  <div className="flex items-start gap-3.5">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                      isDark
                        ? "border-[#6DFF3B]/20 bg-[#0d0f15]/80 text-[#6DFF3B]"
                        : "border-emerald-500/20 bg-white text-emerald-600"
                    )}>
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className={cn(
                        "font-extrabold text-sm",
                        isDark ? "text-white" : "text-slate-800"
                      )}>
                        Secure 256-bit SSL encrypted payment
                      </p>
                      <p className={cn(
                        "mt-1 text-xs leading-relaxed",
                        isDark ? "text-white/60" : "text-slate-500"
                      )}>
                        Your payment details are never stored on our servers. Transactions are processed securely through trusted payment partners.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "rounded-[28px] border overflow-hidden backdrop-blur-xl transition-all duration-300",
              isDark ? "border-white/10 bg-[#101216]/60 shadow-2xl" : "border-slate-200 bg-white shadow-md"
            )}>
              <CardHeader className={cn(
                "border-b px-6 py-5",
                isDark ? "border-white/5" : "border-slate-100"
              )}>
                <CardTitle className={cn(
                  "flex items-center gap-2 text-lg font-extrabold tracking-tight",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  <Users className={cn("h-5 w-5", isDark ? "text-[#6DFF3B]" : "text-emerald-600")} />
                  <span>Split payment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-4">
                  <p className={cn(
                    "text-xs leading-relaxed",
                    isDark ? "text-white/60" : "text-slate-500"
                  )}>
                    Optionally split the cost with teammates after checkout.
                  </p>

                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <Input
                      placeholder="teammate@example.com"
                      value={teammateInput}
                      onChange={(e) => setTeammateInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTeammate();
                      }}
                      className={cn(
                        "h-12 flex-grow rounded-[18px] border transition-all outline-none font-medium",
                        isDark
                          ? "border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-[#6DFF3B]/50 focus:ring-1 focus:ring-[#6DFF3B]/50"
                          : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                      )}
                    />
                    <Button
                      onClick={addTeammate}
                      className={cn(
                        "h-12 rounded-[18px] px-6 font-bold cursor-pointer transition-all shrink-0",
                        isDark
                          ? "bg-white/10 text-white hover:bg-white/15"
                          : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                      )}
                    >
                      Add player
                    </Button>
                  </div>

                  {/* Teammates Chip list */}
                  {teammates.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {teammates.map((email) => (
                        <div
                          key={email}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors",
                            isDark
                              ? "bg-[#6DFF3B]/10 border-[#6DFF3B]/30 text-[#6DFF3B]"
                              : "bg-emerald-50 border-emerald-300 text-emerald-800"
                          )}
                        >
                          <span>{email}</span>
                          <button
                            type="button"
                            onClick={() => removeTeammate(email)}
                            className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className={cn(
              "overflow-hidden rounded-[28px] border shadow-2xl transition-colors duration-300",
              isDark ? "border-white/10 bg-[#101216]/60" : "border-slate-200 bg-white"
            )}>
              <div className="relative aspect-[16/10] overflow-hidden">
                <ImageWithFallback
                  src={asset("/venues/turf-1.webp")}
                  alt={booking.venue}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 image-overlay bg-[linear-gradient(180deg,rgba(5,5,5,0.08),rgba(5,5,5,0.82))]" />
                <div className={cn(
                  "absolute left-4 top-4 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider",
                  isDark
                    ? "border-[#6DFF3B]/20 bg-[#6DFF3B]/10 text-[#6DFF3B]"
                    : "border-emerald-300 bg-emerald-50 text-emerald-700"
                )}>
                  Booking summary
                </div>
              </div>

              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className={cn(
                    "text-xl font-extrabold tracking-tight",
                    isDark ? "text-white" : "text-slate-900"
                  )}>{booking.venue}</h2>
                  <p className={cn(
                    "mt-1.5 text-xs font-semibold",
                    isDark ? "text-white/50" : "text-slate-400"
                  )}>
                    {booking.location}
                  </p>
                </div>

                <div className={cn(
                  "grid gap-3 rounded-[22px] border p-4",
                  isDark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50/50"
                )}>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge className={cn(
                      "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none",
                      isDark
                        ? "bg-[#6DFF3B]/10 text-[#6DFF3B]"
                        : "bg-emerald-50 text-emerald-700"
                    )}>
                      {booking.sport}
                    </Badge>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 text-xs font-semibold",
                    isDark ? "text-white/70" : "text-slate-600"
                  )}>
                    <Calendar className={cn("h-4 w-4", isDark ? "text-[#6DFF3B]" : "text-emerald-600")} />
                    <span>{formatBookingDate(booking.date)}</span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-2 text-xs font-semibold",
                    isDark ? "text-white/70" : "text-slate-600"
                  )}>
                    <Clock className={cn("h-4 w-4", isDark ? "text-[#6DFF3B]" : "text-emerald-600")} />
                    <span>{booking.time}</span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className={cn(
                    "flex items-center justify-between text-sm",
                    isDark ? "text-white/60" : "text-slate-500"
                  )}>
                    <span>Venue booking</span>
                    <span className={isDark ? "text-white" : "text-slate-800"}>₹{booking.price.toLocaleString()}</span>
                  </div>
                  <div className={cn(
                    "flex items-center justify-between text-sm",
                    isDark ? "text-white/60" : "text-slate-500"
                  )}>
                    <span>Convenience fee</span>
                    <span className={isDark ? "text-white" : "text-slate-800"}>₹{convenienceFee}</span>
                  </div>
                  <div className={cn(
                    "flex items-center justify-between text-sm",
                    isDark ? "text-[#6DFF3B]" : "text-emerald-700"
                  )}>
                    <span className="inline-flex items-center gap-1.5">
                      <Gift className="h-4 w-4 shrink-0" />
                      Promo: FIRSTGAME
                    </span>
                    <span className="font-extrabold">-₹{discount}</span>
                  </div>
                  <div className={cn(
                    "flex items-center justify-between text-sm",
                    isDark ? "text-white/60" : "text-slate-500"
                  )}>
                    <span>GST (18%)</span>
                    <span className={isDark ? "text-white" : "text-slate-800"}>₹{tax}</span>
                  </div>
                </div>

                <Separator className={isDark ? "bg-white/5" : "bg-slate-100"} />

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className={cn(
                      "text-[10px] uppercase tracking-widest font-bold",
                      isDark ? "text-white/40" : "text-slate-400"
                    )}>
                      Total amount
                    </p>
                    <p className={cn(
                      "mt-1 text-3xl font-black",
                      isDark ? "text-white" : "text-slate-900"
                    )}>
                      ₹{total.toLocaleString()}
                    </p>
                  </div>
                  <Badge className={cn(
                    "rounded-full border-none px-3 py-1 text-xs uppercase tracking-wider font-extrabold",
                    isDark
                      ? "bg-[#6DFF3B]/10 text-[#6DFF3B]"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  )}>
                    Save ₹{discount}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className={cn(
                      "group h-14 w-fit px-10 mx-auto rounded-full font-extrabold text-sm uppercase tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 select-none",
                      isDark
                        ? "bg-gradient-to-r from-[#6DFF3B] to-[#4ade80] text-black hover:from-[#86ff60] hover:to-[#55ef6a] shadow-[0_4px_20px_rgba(109,255,59,0.25)] hover:shadow-[0_8px_30px_rgba(109,255,59,0.45)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-[0_4px_20px_rgba(5,150,105,0.2)] hover:shadow-[0_8px_30px_rgba(5,150,105,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97]"
                    )}
                  >
                    <span>{isProcessing ? "Processing..." : "Complete booking"}</span>
                    {!isProcessing && (
                      <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                    )}
                  </Button>

                  <p className={cn(
                    "text-center text-[10px] leading-relaxed",
                    isDark ? "text-white/40" : "text-slate-400"
                  )}>
                    Free cancellation up to 4 hours before the booking start time.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(
              "rounded-[28px] border overflow-hidden backdrop-blur-xl transition-all duration-300",
              isDark ? "border-white/10 bg-[#101216]/60" : "border-slate-200 bg-white"
            )}>
              <CardContent className="space-y-2.5 p-6">
                <p className={cn(
                  "text-xs font-bold uppercase tracking-wider",
                  isDark ? "text-white" : "text-slate-900"
                )}>Refund policy note</p>
                <p className={cn(
                  "text-xs leading-relaxed",
                  isDark ? "text-white/50" : "text-slate-500"
                )}>
                  Refund eligibility and cancellation windows are shown before payment, so there are no surprises after checkout.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3.5 backdrop-blur-2xl lg:hidden transition-colors duration-300",
          isDark
            ? "border-white/10 bg-[#050505]/90 text-white"
            : "border-slate-200 bg-white/90 text-slate-800 shadow-lg"
        )}>
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3">
            <div>
              <p className={cn(
                "text-[9px] uppercase tracking-widest font-bold",
                isDark ? "text-white/40" : "text-slate-400"
              )}>
                Total
              </p>
              <p className={cn(
                "mt-0.5 text-base font-black",
                isDark ? "text-[#6DFF3B]" : "text-emerald-700"
              )}>
                ₹{total.toLocaleString()}
              </p>
            </div>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className={cn(
                "group h-11 w-fit px-6 rounded-full font-extrabold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 select-none",
                isDark
                  ? "bg-gradient-to-r from-[#6DFF3B] to-[#4ade80] text-black hover:from-[#86ff60] hover:to-[#55ef6a] shadow-[0_3px_15px_rgba(109,255,59,0.2)] hover:shadow-[0_6px_22px_rgba(109,255,59,0.35)] active:scale-[0.97]"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-[0_3px_15px_rgba(5,150,105,0.15)] hover:shadow-[0_6px_22px_rgba(5,150,105,0.28)] active:scale-[0.97]"
              )}
            >
              <span>{isProcessing ? "Processing..." : "Pay now"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
