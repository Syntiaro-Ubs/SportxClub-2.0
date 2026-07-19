import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Bell,
  Bookmark,
  ChevronRight,
  CreditCard,
  Edit,
  Heart,
  HelpCircle,
  LogOut,
  MapPin,
  Medal,
  Settings,
  Ticket,
  Trophy,
  Wallet,
  QrCode,
  Coffee,
  Share2,
  Ban,
  Play,
  Flame,
  CheckCircle2,
  UserPlus,
  ShoppingBag,
  Calendar,
  Check,
  Minus,
  History,
  MessageSquare,
  Clock,
  Lock,
  MessageCircle,
  ArrowLeft,
  Edit3,
  Target,
  TrendingUp,
  Award,
  Zap
} from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Container } from "../components/ui/container";
import { useAuth } from "../providers/auth-provider";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Progress } from "../components/ui/progress";

const sportsOptions = [
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "cricket", name: "Cricket", emoji: "🏏" },
  { id: "badminton", name: "Badminton", emoji: "🏸" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "swimming", name: "Swimming", emoji: "🏊" },
  { id: "gym", name: "Gym & Fitness", emoji: "🏋️" },
  { id: "volleyball", name: "Volleyball", emoji: "🏐" },
];

const getInitials = (name) => {
  if (!name) return "RV";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getHandle = (user) => {
  if (!user) return "@rohanv";
  if (user.fullName) {
    return "@" + user.fullName.toLowerCase().replace(/\s+/g, "");
  }
  if (user.email) {
    return "@" + user.email.split("@")[0];
  }
  return "@user";
};

const getMappedSports = (selectedSports) => {
  if (!selectedSports || selectedSports.length === 0) {
    return ["Cricket", "Football", "Tennis"];
  }
  return selectedSports.map((id) => {
    const found = sportsOptions.find((s) => s.id === id);
    return found ? found.name : id.charAt(0).toUpperCase() + id.slice(1);
  });
};

const achievements = [
  { title: "100 Matches", icon: Trophy, color: "text-[#6DFF3B]" },
  { title: "Top Scorer", icon: Medal, color: "text-[#6DFF3B]" },
  { title: "Team Captain", icon: Bookmark, color: "text-[#6DFF3B]" },
];

const matchHistory = [
  {
    id: 1,
    venue: "Elite Sports Arena",
    sport: "Cricket",
    date: "Jun 15, 2026",
    result: "Won",
    score: "156/4 vs 142/8",
  },
  {
    id: 2,
    venue: "Champions Complex",
    sport: "Football",
    date: "Jun 12, 2026",
    result: "Won",
    score: "3-1",
  },
  {
    id: 3,
    venue: "Ace Tennis Academy",
    sport: "Tennis",
    date: "Jun 10, 2026",
    result: "Lost",
    score: "6-4, 4-6, 5-7",
  },
];

const shopItems = [
  {
    id: 1,
    name: "SportX Pro Grip Socks",
    price: 350,
    image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1080",
  },
  {
    id: 2,
    name: "Elite Match Ball",
    price: 1200,
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1080",
  },
  {
    id: 3,
    name: "SportX Water Bottle 1L",
    price: 450,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=1080",
  },
  {
    id: 4,
    name: "Premium Wrist Bands",
    price: 250,
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1080",
  },
];

const amenitiesList = [
  {
    id: "bibs",
    name: "Training Bibs (Set of 10)",
    price: 150,
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=150",
    label: "Neon mesh bibs",
  },
  {
    id: "drinks",
    name: "Energy Drinks (x4)",
    price: 200,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=150",
    label: "Chilled Gatorade",
  },
  {
    id: "shoes",
    name: "Pro Soccer Cleats (Rent)",
    price: 250,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=150",
    label: "Nike sizes 7-11",
  },
];

function ConfettiCelebration({ active }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(60)].map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const duration = 1.5 + Math.random() * 2;
        const color = ["#6DFF3B", "#FFD700", "#FF4500", "#00BFFF", "#FF69B4", "#8A2BE2"][Math.floor(Math.random() * 6)];
        const size = 6 + Math.random() * 8;
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${left}vw`, opacity: 1, rotate: 0 }}
            animate={{
              y: "105vh",
              x: `${left + (Math.random() * 14 - 7)}vw`,
              rotate: 360,
              opacity: 0
            }}
            transition={{
              duration: duration,
              delay: delay,
              ease: "easeOut"
            }}
            style={{
              position: "absolute",
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? "50%" : "0%",
              top: 0,
            }}
          />
        );
      })}
    </div>
  );
}


export function UserProfile() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Shared state values
  const [walletBalance, setWalletBalance] = useState(1200);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [txHistoryOpen, setTxHistoryOpen] = useState(false);
  const [transactions, setTransactions] = useState([
    { id: "tx-1", type: "Refund", label: "Match Booking Cancelled", amount: 150, date: "Today, 9:30 AM", status: "Success", isCredit: true },
    { id: "tx-2", type: "Pro Shop", label: "SportX Water Bottle 1L", amount: 450, date: "Yesterday, 2:15 PM", status: "Success", isCredit: false },
    { id: "tx-3", type: "Booking", label: "Split Share - Elite Turf Arena", amount: 150, date: "Jul 11, 2026", status: "Success", isCredit: false },
    { id: "tx-4", type: "Top Up", label: "Wallet Direct UPI Topup", amount: 1000, date: "Jul 10, 2026", status: "Success", isCredit: true },
    { id: "tx-5", type: "Rent", label: "Addon - Pro Soccer Cleats", amount: 250, date: "Jul 09, 2026", status: "Success", isCredit: false },
  ]);

  const [playerXp, setPlayerXp] = useState(8450);
  const [matchStatus, setMatchStatus] = useState("CONFIRMED");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [addonsPaid, setAddonsPaid] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [addonsOpen, setAddonsOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [playerPayments, setPlayerPayments] = useState({
    0: true, // You (Host)
    1: false, // Player 2
    2: false, // Player 3
  });

  const [showConfetti, setShowConfetti] = useState(false);
  const [purchasedItemId, setPurchasedItemId] = useState(null);

  // Auto Payment Simulator Trigger (Teammates pay)
  useEffect(() => {
    if (matchStatus === "CONFIRMED") {
      const timer = setTimeout(() => {
        setPlayerPayments(prev => ({
          ...prev,
          1: true,
          2: true,
        }));
        toast.success("Vikram M. (2), Arjun K. (3) paid their share!");
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [matchStatus]);



  const handleCancelBooking = () => {
    if (matchStatus === "CONFIRMED") {
      setWalletBalance((prev) => prev + 150);
      setMatchStatus("CANCELLED");
      setCancelOpen(false);
      
      const newTx = {
        id: "tx-" + Date.now(),
        type: "Refund",
        label: "Refund - Booking Cancelled SX-92841",
        amount: 150,
        date: "Today, Just Now",
        status: "Success",
        isCredit: true,
      };
      setTransactions(prev => [newTx, ...prev]);
      toast.success("Booking cancelled. ₹150 refunded to wallet.");
    }
  };

  const handlePayAddons = () => {
    const total = selectedAmenities.reduce((acc, id) => {
      const item = amenitiesList.find((x) => x.id === id);
      return acc + (item ? item.price : 0);
    }, 0);
    if (walletBalance >= total) {
      setWalletBalance((prev) => prev - total);
      setAddonsPaid(true);
      
      const newTx = {
        id: "tx-" + Date.now(),
        type: "Rent",
        label: "Reserved Addons (Drinks/Bibs/Cleats)",
        amount: total,
        date: "Today, Just Now",
        status: "Success",
        isCredit: false,
      };
      setTransactions(prev => [newTx, ...prev]);
      toast.success("Add-ons reserved and paid successfully!");
      
      setTimeout(() => {
        setAddonsOpen(false);
      }, 1500);
    } else {
      toast.error("Insufficient wallet balance. Please top up.");
    }
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText("https://payment.sportx.club/split/SX-92841");
    toast.success("Split payment link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const displayName = currentUser?.fullName || "Rohan Verma";
  const displayHandle = getHandle(currentUser);
  const displayCity = currentUser?.city ? `${currentUser.city}, India` : "Mumbai, India";
  const displayInitials = getInitials(currentUser?.fullName);
  const displaySports = getMappedSports(currentUser?.selectedSports);

  return (
    <>
      <ConfettiCelebration active={showConfetti} />
      
      {/* Dialog Modals */}
      <Dialog open={txHistoryOpen} onOpenChange={setTxHistoryOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Wallet className="h-5 w-5 text-[#6DFF3B]" /> Wallet Transactions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center bg-card p-3.5 border border-border/60 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                      tx.isCredit ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {tx.isCredit ? "+" : "-"}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-xs leading-tight">{tx.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{tx.date} • {tx.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold text-sm ${tx.isCredit ? "text-emerald-400" : "text-foreground"}`}>
                      {tx.isCredit ? "+" : "-"}₹{tx.amount}
                    </span>
                    <span className="block text-[8px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-muted-foreground text-sm">No transactions found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Top Up Wallet</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            {[500, 1000, 2000].map((amt) => (
              <Button
                key={amt}
                variant="outline"
                className="border-border bg-card hover:bg-muted text-foreground"
                onClick={() => {
                  setWalletBalance((prev) => prev + amt);
                  const newTx = {
                    id: "tx-" + Date.now(),
                    type: "Top Up",
                    label: `Wallet UPI Topup`,
                    amount: amt,
                    date: "Today, Just Now",
                    status: "Success",
                    isCredit: true,
                  };
                  setTransactions(prev => [newTx, ...prev]);
                  setTopUpOpen(false);
                  toast.success(`Successfully added ₹${amt} to your wallet!`);
                }}
              >
                ₹{amt}
              </Button>
            ))}
          </div>
          <Input
            id="customTopupVal"
            placeholder="Enter custom amount"
            className="bg-card border-border text-foreground rounded-xl"
            type="number"
          />
          <Button 
            className="w-full bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-xl mt-4 h-11 cursor-pointer"
            onClick={() => {
              const customVal = parseInt(document.getElementById("customTopupVal")?.value);
              if (!customVal || customVal <= 0) {
                toast.error("Please enter a valid amount.");
                return;
              }
              setWalletBalance((prev) => prev + customVal);
              const newTx = {
                id: "tx-" + Date.now(),
                type: "Top Up",
                label: `Custom Wallet Topup`,
                amount: customVal,
                date: "Today, Just Now",
                status: "Success",
                isCredit: true,
              };
              setTransactions(prev => [newTx, ...prev]);
              setTopUpOpen(false);
              toast.success(`Successfully added ₹${customVal} to your wallet!`);
            }}
          >
            Proceed to Pay
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={addonsOpen} onOpenChange={setAddonsOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold text-xl">
              <Coffee className="h-5 w-5 text-amber-500" /> Pre-Book Accessories
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground text-left mt-1">
              Select any additional gear or drinks to be kept ready at the turf reception.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {amenitiesList.map((item) => {
              const isSelected = selectedAmenities.includes(item.id);
              return (
                <div key={item.id} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isSelected ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-card"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 bg-muted rounded-xl overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-xs leading-tight text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{item.label}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-1.5">
                    <p className="font-mono text-sm font-bold text-foreground">₹{item.price}</p>
                    <Button
                      size="sm"
                      disabled={addonsPaid}
                      onClick={() => setSelectedAmenities(prev =>
                        prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]
                      )}
                      className={`h-7 px-3 text-[10px] rounded-lg font-bold border ${
                        isSelected ? "bg-amber-500 text-black border-none" : "border-border bg-transparent text-foreground"
                      }`}
                    >
                      {isSelected ? "Selected" : "Add"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter className="border-t border-border/40 pt-4 flex-col gap-3">
            <div className="flex justify-between items-center text-xs w-full">
              <span className="text-muted-foreground">Total Add-on Cost:</span>
              <span className="font-mono font-bold text-sm text-foreground">
                ₹{selectedAmenities.reduce((tot, id) => tot + (amenitiesList.find(x => x.id === id)?.price || 0), 0)}
              </span>
            </div>
            <Button
              className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:opacity-95 rounded-xl font-bold text-xs cursor-pointer"
              disabled={selectedAmenities.length === 0 || addonsPaid}
              onClick={handlePayAddons}
            >
              {addonsPaid ? "✓ Reserved & Paid" : `Confirm & Pay from Wallet (₹${selectedAmenities.reduce((tot, id) => tot + (amenitiesList.find(x => x.id === id)?.price || 0), 0)})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-bold text-xl">
              <Ban className="h-5 w-5 text-red-500" /> Cancel Slot Booking
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground text-left mt-1">
              Are you sure you want to cancel your slot reservation for today's match?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 text-left">
            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl text-xs text-red-400 leading-relaxed">
              <strong>Notice:</strong> Cancelling within 4 hours of match time incurs a minor convenience fee deduction. A refund of <strong>₹150</strong> will be credited directly to your SportX wallet.
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl h-10 text-xs" onClick={() => setCancelOpen(false)}>
              Keep Booking
            </Button>
            <Button variant="destructive" className="flex-1 rounded-xl h-10 text-xs" onClick={handleCancelBooking}>
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Consolidated Profile Page Layout */}
      <Container className="py-6 space-y-8 max-w-4xl">
        {/* 1. Profile Header with Avatar, Sports & XP Progress */}
        <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-card overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#6DFF3B]/5 blur-[80px] pointer-events-none" />
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start justify-between">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <Avatar className="h-24 w-24 border border-primary/15 bg-background shadow-inner">
                  <AvatarImage src={currentUser?.profilePicture} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-2xl text-primary font-black">
                    {displayInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.24em] text-primary font-bold">Athlete Profile</p>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">{displayName}</h1>
                  <p className="text-sm text-muted-foreground">{displayHandle}</p>
                  <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-xs font-semibold">
                    <MapPin className="h-4 w-4 text-primary" />
                    {displayCity} • Active since May 2025
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-1.5">
                    {displaySports.map((sport) => (
                      <Badge key={sport} variant="outline" className="text-[10px] py-0.5 px-2.5 rounded-full border-border/80 text-muted-foreground font-semibold">
                        {sport}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* XP Progression Card */}
              <div className="bg-background/50 border border-border/60 rounded-2xl p-4 w-full md:w-80 space-y-3 relative z-10 text-left">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-foreground font-semibold flex items-center gap-1.5">
                    <Flame className="h-4 w-4 text-[#6DFF3B]" /> LEVEL 14 STRIKER
                  </span>
                  <span className="text-[#6DFF3B] font-mono font-bold">
                    {playerXp} / 10000 XP
                  </span>
                </div>
                <Progress value={(playerXp / 10000) * 100} className="h-2 bg-muted" indicatorColor="bg-[#6DFF3B]" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>LVL 14</span>
                  <span>LVL 15 (Earn +1550 XP to Level Up)</span>
                </div>
              </div>
            </div>

            {/* Logout button at header level */}
            <div className="mt-6 flex justify-end gap-2 border-t border-border/40 pt-4">
              <Link to="/edit-profile">
                <Button size="sm" variant="outline" className="text-xs rounded-xl gap-1">
                  <Edit className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </Link>
              <Button size="sm" variant="destructive" className="text-xs rounded-xl gap-1 cursor-pointer" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" /> Logout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2. Interactive Wallet Banner */}
        <div className="bg-gradient-to-br from-card to-card/95 border border-border shadow-sm rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden text-left">
          <div className="absolute right-0 top-0 w-44 h-44 bg-[#6DFF3B]/5 blur-[60px] pointer-events-none" />
          <div className="flex items-center gap-4 z-10">
            <div className="bg-[#6DFF3B]/10 p-3.5 rounded-2xl border border-[#6DFF3B]/20 text-[#6DFF3B]">
              <Wallet className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">SportX Wallet Balance</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground mt-0.5">₹{walletBalance}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6DFF3B] font-semibold md:max-w-xs z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6DFF3B] shrink-0" />
            UPI & Card top-ups enabled. 100% refund-safe.
          </div>
          <div className="flex gap-3 w-full md:w-auto shrink-0 z-10">
            <Button variant="outline" className="rounded-2xl border-border px-6 h-12 text-sm font-semibold bg-muted/20 hover:bg-muted text-foreground cursor-pointer" onClick={() => setTxHistoryOpen(true)}>
              <History className="h-4 w-4 mr-2" /> Transaction History
            </Button>
            <Button className="rounded-2xl bg-[#6DFF3B] text-black hover:bg-[#86ff60] px-6 h-12 text-sm font-bold cursor-pointer" onClick={() => setTopUpOpen(true)}>
              + Top Up Wallet
            </Button>
          </div>
        </div>

        {/* 3. Achievements Badge List */}
        <div className="grid gap-4 sm:grid-cols-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div key={achievement.title} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card p-4 shadow-sm text-left">
                <div className="flex h-12 w-12 items-center justify-center">
                  <Icon className={`h-6 w-6 ${achievement.color}`} />
                </div>
                <p className="font-bold text-sm text-foreground">{achievement.title}</p>
              </div>
            );
          })}
        </div>

        <hr className="border-border/60" />

        {/* 4. Active Match Center (Stacked) */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-left flex items-center gap-2 text-slate-800 dark:text-white">
            <Calendar className="h-5 w-5 text-primary" /> Active Match Center
          </h2>
          {matchStatus === "CONFIRMED" ? (
            <div className="bg-gradient-to-br from-card to-card/95 border border-border shadow-md rounded-[24px] overflow-hidden flex flex-col md:flex-row text-left">
              {/* Image Block */}
              <div className="relative w-full md:w-1/3 min-h-[200px] overflow-hidden p-3 shrink-0">
                <div className="relative w-full h-full rounded-2xl overflow-hidden min-h-[180px]">
                  <img src="https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=1080" alt="Venue" className="w-full h-full object-cover opacity-75 mix-blend-luminosity absolute inset-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1">
                    <Badge className="bg-[#6DFF3B] text-black font-bold text-[9px] py-0.5 px-2.5 rounded-full border-0">5-a-side Football</Badge>
                    <h3 className="text-base font-black text-white leading-tight">Elite Turf Arena</h3>
                    <p className="text-[#6DFF3B] font-mono font-bold text-xs flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Today, 6:00 PM</p>
                  </div>
                </div>
              </div>
              {/* Actions & Details Grid */}
              <div className="w-full md:w-2/3 p-6 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#6DFF3B]/10 p-2.5 rounded-full border border-[#6DFF3B]/20 text-[#6DFF3B]"><Trophy className="h-5 w-5" /></div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm leading-tight">7-a-side Football Friendly</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Booking ID: SX-92841</p>
                    </div>
                  </div>
                  <span className="text-[#6DFF3B] font-black tracking-wider text-xs uppercase">CONFIRMED</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Entry Pass Trigger */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-card hover:border-[#6DFF3B]/50 transition-all cursor-pointer group h-32 flex flex-col justify-between select-none shadow-sm shadow-[#6DFF3B]/5">
                        <div className="w-full h-18 relative overflow-hidden bg-muted">
                          <img src="https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?q=80&w=300" alt="Pass" className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute top-2 right-2 z-20 bg-background/95 backdrop-blur-md p-1.5 rounded-lg border border-border text-[#6DFF3B] group-hover:bg-[#6DFF3B] group-hover:text-black transition-colors"><QrCode className="h-4 w-4" /></div>
                        </div>
                        <div className="p-2.5 bg-card border-t border-border/40 text-left">
                          <span className="block text-xs font-bold text-foreground">Entry Pass</span>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="bg-white text-black sm:max-w-xs text-center border-0 p-8 rounded-2xl">
                      <div className="space-y-4">
                        <h3 className="font-bold text-xl uppercase tracking-wider">{displayName}</h3>
                        <div className="bg-zinc-100 p-4 rounded-2xl mx-auto w-fit"><QrCode className="h-40 w-40 text-black" /></div>
                        <p className="text-sm font-semibold text-muted-foreground">Scan at Elite Turf Arena gate</p>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Add-ons Trigger */}
                  <div onClick={() => setAddonsOpen(true)} className="relative overflow-hidden rounded-2xl border border-border bg-card hover:border-amber-500/50 transition-all cursor-pointer group h-32 flex flex-col justify-between select-none shadow-sm shadow-amber-500/5">
                    <div className="w-full h-18 relative overflow-hidden bg-muted">
                      <img src="https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=300" alt="Amenities" className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 right-2 z-20 bg-background/95 backdrop-blur-md p-1.5 rounded-lg border border-border text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors"><Coffee className="h-4 w-4" /></div>
                    </div>
                    <div className="p-2.5 bg-card border-t border-border/40 text-left">
                      <span className="block text-xs font-bold text-foreground">Add-ons</span>
                    </div>
                  </div>

                  {/* Split Status Tracker */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative overflow-hidden rounded-2xl border border-border bg-card hover:border-emerald-500/50 transition-all cursor-pointer group h-32 flex flex-col justify-between select-none shadow-sm shadow-emerald-500/5">
                        <div className="w-full h-18 relative overflow-hidden bg-muted">
                          <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=300" alt="Split" className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute top-2 right-2 z-20 bg-background/95 backdrop-blur-md p-1.5 rounded-lg border border-border text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition-colors"><Share2 className="h-4 w-4" /></div>
                        </div>
                        <div className="p-2.5 bg-card border-t border-border/40 text-left">
                          <span className="block text-xs font-bold text-foreground">Split Tracker</span>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="bg-background border-border text-foreground sm:max-w-md max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center justify-between text-xl font-bold">
                          <span>Split Tracker Status</span>
                          <Button variant="outline" size="sm" onClick={handleCopyLink} className="h-8 rounded-lg text-xs font-bold border-border cursor-pointer">
                            {copiedLink ? "Copied" : "Copy Split Link"}
                          </Button>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 py-4">
                        {["You (Host)", "Vikram M. (2)", "Arjun K. (3)"].map((name, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-card border border-border/60">
                            <span className="text-xs font-bold">{name}</span>
                            {playerPayments[idx] ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px] border-none px-2.5 py-1 rounded-full">Paid</Badge>
                            ) : (
                              <Badge className="bg-amber-500/10 text-amber-500 font-bold text-[10px] border-none px-2.5 py-1 rounded-full">Pending</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Cancel Booking card */}
                  <div onClick={() => setCancelOpen(true)} className="relative overflow-hidden rounded-2xl border border-border bg-card hover:border-red-500/50 transition-all cursor-pointer group h-32 flex flex-col justify-between select-none shadow-sm shadow-red-500/5">
                    <div className="w-full h-18 relative overflow-hidden bg-muted">
                      <img src="https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=300" alt="Cancel" className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 right-2 z-20 bg-background/95 backdrop-blur-md p-1.5 rounded-lg border border-border text-red-500 group-hover:bg-red-500 group-hover:text-black transition-colors"><Ban className="h-4 w-4" /></div>
                    </div>
                    <div className="p-2.5 bg-card border-t border-border/40 text-left">
                      <span className="block text-xs font-bold text-foreground">Cancel Slot</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card className="border-border/50 p-8 text-center text-muted-foreground text-sm">
              Active slot reservation has been cancelled. Refunded ₹150 to your wallet.
            </Card>
          )}
        </div>

        <hr className="border-border/60" />

        {/* 6. Pro Shop Merchandise */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-left flex items-center gap-2 text-slate-800 dark:text-white">
            <ShoppingBag className="h-5 w-5 text-primary" /> Pro Shop Merchandise
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {shopItems.map((item) => (
              <div key={item.id} className="border border-border/80 bg-card rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-[#6DFF3B]/30 transition-all">
                <div className="h-32 w-full bg-muted rounded-xl overflow-hidden shadow-inner">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-foreground line-clamp-1">{item.name}</h5>
                  <p className="text-base font-extrabold text-[#6DFF3B] mt-1">₹{item.price}</p>
                </div>
                <Button size="sm" className="w-full bg-white border border-slate-200 text-slate-900 hover:bg-[#6DFF3B] hover:border-[#6DFF3B] hover:text-black rounded-xl font-bold h-10 cursor-pointer transition-all duration-200" onClick={() => {
                  setPurchasedItemId(item.id);
                  setWalletBalance(prev => {
                    if (prev >= item.price) {
                      toast.success(`Purchased ${item.name}!`);
                      return prev - item.price;
                    }
                    toast.error("Insufficient wallet balance.");
                    return prev;
                  });
                }}>
                  Purchase Item
                </Button>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-border/60" />

        {/* 8. Match Logs / History */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-left flex items-center gap-2 text-slate-800 dark:text-white">
            <History className="h-5 w-5 text-primary" /> Match Logs & History
          </h2>
          <div className="space-y-4">
            {matchHistory.map((match) => {
              const isWon = match.result === "Won";
              const sportColors = {
                Cricket: { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
                Football: { bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
                Tennis: { bg: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
              };
              const colors = sportColors[match.sport] || { bg: "bg-primary/10 text-primary border-primary/20" };

              return (
                <div
                  key={match.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md hover:border-border text-left gap-4 relative overflow-hidden ${
                    isWon ? "border-l-4 border-l-[#6DFF3B]" : "border-l-4 border-l-rose-500"
                  }`}
                >
                  {/* Left Column: Sport Icon + Details */}
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${colors.bg} border`}>
                      {match.sport.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-white leading-tight">
                          {match.venue}
                        </h4>
                        <Badge variant="outline" className={`text-[9px] font-bold tracking-wider py-0.5 px-2 rounded-md ${colors.bg}`}>
                          {match.sport}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{match.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Result + Score details */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
                    <div className="text-left sm:text-right space-y-0.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Match Score</p>
                      <p className="font-mono text-sm font-extrabold text-slate-800 dark:text-white">
                        {match.score}
                      </p>
                    </div>
                    
                    <div className="shrink-0">
                      <Badge
                        className={`text-xs font-black px-3.5 py-1.5 rounded-xl border-0 ${
                          isWon
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-[#6DFF3B] hover:bg-emerald-500/15"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/15"
                        }`}
                      >
                        {isWon ? "✓ WON" : "✗ LOST"}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <hr className="border-border/60" />

        {/* 9. Teammate Reviews */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-left flex items-center gap-2 text-slate-800 dark:text-white">
            <MessageSquare className="h-5 w-5 text-primary" /> Teammate Reviews & Ratings
          </h2>
          <Card className="border-border/50 bg-card">
            <CardContent className="space-y-4 p-6">
              {[
                { from: "Rahul Sharma", rating: 5, comment: "Great player! Excellent teamwork and sportsmanship.", date: "2 weeks ago" },
                { from: "Priya Patel", rating: 5, comment: "Very skilled and reliable. Would play with again!", date: "1 month ago" },
              ].map((review, i) => (
                <div key={i} className="border-b border-border/50 pb-4 last:border-0 text-left space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-foreground">{review.from}</p>
                    <div className="flex gap-1">
                      {Array.from({ length: review.rating }).map((_, sIdx) => (
                        <Trophy key={sIdx} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
                  <p className="text-[10px] text-muted-foreground/60">{review.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Container>
    </>
  );
}
