import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Wallet,
  QrCode,
  MapPin,
  Users,
  Coffee,
  Share2,
  Ban,
  Play,
  Star,
  BrainCircuit,
  Trophy,
  Plus,
  Flame,
  CheckCircle2,
  UserPlus,
  ShoppingBag,
  Calendar,
  Check,
  Minus,
  History,
  MessageSquare,
  Edit3,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { useAuth } from "../../providers/auth-provider";
import { toast } from "sonner";


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

const getMappedSports = (selectedSports) => {
  if (!selectedSports || selectedSports.length === 0) {
    return ["Football", "Cricket", "Badminton"];
  }
  return selectedSports.map((id) => {
    const found = sportsOptions.find((s) => s.id === id);
    return found ? found.name : id.charAt(0).toUpperCase() + id.slice(1);
  });
};

// Mock data exactly matching the user's screenshot
const player = {
  name: "Rohan Das",
  xp: 8450,
  level: "LEVEL 14 STRIKER",
  nextLevelXp: 10000,
  walletBalance: 1200,
  sports: ["Football", "Cricket", "Badminton"],
};

const nextMatch = {
  venue: "Elite Turf Arena",
  sport: "7-a-side Football Friendly",
  bookingId: "SX-92841",
  date: "Today, 6:00 PM",
  costPerPlayer: 150,
  totalPlayers: 8,
};

const openMatches = [
  {
    id: 1,
    venue: "City Turf Central",
    sport: "Football",
    time: "Tomorrow, 7:00 AM",
    cost: 200,
    spotsLeft: 2,
    totalSpots: 14,
    distance: "2.3 km away",
    distanceKm: 2.3,
  },
  {
    id: 2,
    venue: "Powai Sports Ground",
    sport: "Cricket",
    time: "Today, 6:00 PM",
    cost: 150,
    spotsLeft: 3,
    totalSpots: 11,
    distance: "1.2 km away",
    distanceKm: 1.2,
  },
  {
    id: 3,
    venue: "Bandra Badminton Court",
    sport: "Badminton",
    time: "Tomorrow, 8:00 AM",
    cost: 180,
    spotsLeft: 1,
    totalSpots: 4,
    distance: "8.5 km away",
    distanceKm: 8.5,
  },
  {
    id: 4,
    venue: "Shivaji Park Ground",
    sport: "Cricket",
    time: "Sunday, 4:00 PM",
    cost: 100,
    spotsLeft: 5,
    totalSpots: 22,
    distance: "14.2 km away",
    distanceKm: 14.2,
  },
  {
    id: 5,
    venue: "Pune Turf Club",
    sport: "Football",
    time: "Next Saturday, 5:00 PM",
    cost: 400,
    spotsLeft: 4,
    totalSpots: 14,
    distance: "120 km away",
    distanceKm: 120.0,
  },
  {
    id: 6,
    venue: "Urban Tennis Arena",
    sport: "Tennis",
    time: "Today, 8:00 PM",
    cost: 300,
    spotsLeft: 1,
    totalSpots: 4,
    distance: "2.7 km away",
    distanceKm: 2.7,
  }
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


const shopItems = [
  {
    id: 1,
    name: "SportX Pro Grip Socks",
    price: 350,
    image:
      "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1080",
  },
  {
    id: 2,
    name: "Elite Match Ball",
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1551958219-acbc608c6377?q=80&w=1080",
  },
  {
    id: 3,
    name: "SportX Water Bottle 1L",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=1080",
  },
  {
    id: 4,
    name: "Premium Wrist Bands",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1080",
  },
  {
    id: 5,
    name: "SportX Training Bibs",
    price: 550,
    image:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1080",
  },
  {
    id: 6,
    name: "Agility Ladder 4m",
    price: 750,
    image:
      "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?q=80&w=1080",
  },
];

const amenitiesList = [
  {
    id: "bibs",
    name: "Training Bibs (Set of 10)",
    price: 150,
    image:
      "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=150",
    label: "Neon mesh bibs",
  },
  {
    id: "drinks",
    name: "Energy Drinks (x4)",
    price: 200,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=150",
    label: "Chilled Gatorade / Red Bull",
  },
  {
    id: "shoes",
    name: "Pro Soccer Cleats (Rent)",
    price: 250,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=150",
    label: "Adidas/Nike sizes 7-11",
  },
  {
    id: "gloves",
    name: "Goalkeeper Gloves (Rent)",
    price: 100,
    image:
      "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=150",
    label: "Adidas Predator Pro",
  },
];

export function PlayerDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const playerName = currentUser?.fullName || "Player";
  const playerCity = currentUser?.city || "Powai, Mumbai";
  const displaySports = getMappedSports(currentUser?.selectedSports);

  useEffect(() => {
    if (!currentUser) {
      toast.error("Please login to view your dashboard.");
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const [walletBalance, setWalletBalance] = useState(player.walletBalance);
  // Interactive States
  const [matchStatus, setMatchStatus] = useState("CONFIRMED");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [addonsPaid, setAddonsPaid] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Custom dialogs & validation states
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [addonsOpen, setAddonsOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [txHistoryOpen, setTxHistoryOpen] = useState(false);
  const [aiCoachOpen, setAiCoachOpen] = useState(false);
  const [sportsEditOpen, setSportsEditOpen] = useState(false);
  const [highlightsOpen, setHighlightsOpen] = useState(false);
  
  const [userSports, setUserSports] = useState(currentUser?.selectedSports || ["football", "cricket", "badminton"]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const [splitPlayers, setSplitPlayers] = useState(8);
  const [purchasedItemId, setPurchasedItemId] = useState(null);
  
  // Rating & MVP states
  const [playerXp, setPlayerXp] = useState(player.xp);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [mvpVoted, setMvpVoted] = useState(false);
  const [mvpDialogOpen, setMvpDialogOpen] = useState(false);

  // Inbound Team Invites list
  const [teamInvites, setTeamInvites] = useState([
    {
      id: "inv-1",
      teamName: "Powai Panthers FC",
      sport: "Football",
      roleInvited: "Striker",
      distance: "1.5 km away",
      distanceKm: 1.5,
    },
    {
      id: "inv-2",
      teamName: "Mumbai Cricket Club",
      sport: "Cricket",
      roleInvited: "All-rounder",
      distance: "4.2 km away",
      distanceKm: 4.2,
    },
    {
      id: "inv-3",
      teamName: "Pune Giants",
      sport: "Cricket",
      roleInvited: "Bowler",
      distance: "120 km away",
      distanceKm: 120.0,
    },
    {
      id: "inv-4",
      teamName: "Thane Badminton Smashers",
      sport: "Badminton",
      roleInvited: "Singles",
      distance: "18.5 km away",
      distanceKm: 18.5,
    }
  ]);

  // Wallet Transaction list
  const [transactions, setTransactions] = useState([
    { id: "tx-1", type: "Refund", label: "Match Booking Cancelled", amount: 150, date: "Today, 9:30 AM", status: "Success", isCredit: true },
    { id: "tx-2", type: "Pro Shop", label: "SportX Water Bottle 1L", amount: 450, date: "Yesterday, 2:15 PM", status: "Success", isCredit: false },
    { id: "tx-3", type: "Booking", label: "Split Share - Elite Turf Arena", amount: 150, date: "Jul 11, 2026", status: "Success", isCredit: false },
    { id: "tx-4", type: "Top Up", label: "Wallet Direct UPI Topup", amount: 1000, date: "Jul 10, 2026", status: "Success", isCredit: true },
    { id: "tx-5", type: "Rent", label: "Addon - Pro Soccer Cleats", amount: 250, date: "Jul 09, 2026", status: "Success", isCredit: false },
  ]);

  // AI Coach Chat messages
  const [aiMessages, setAiMessages] = useState([
    { sender: "coach", text: "Hey Rohan! I am your AI Coach. How can I help you prepare for today's match at Elite Turf?" }
  ]);

  const toggleAmenity = (id) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (!currentUser) {
    return null;
  }

  const calculateTotalAddons = () => {
    return selectedAmenities.reduce((total, id) => {
      const item = amenitiesList.find((x) => x.id === id);
      return total + (item ? item.price : 0);
    }, 0);
  };

  const handlePayAddons = () => {
    const total = calculateTotalAddons();
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
    }
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    navigator.clipboard.writeText("https://payment.sportx.club/split/SX-92841");
    toast.success("Split payment link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCancelBooking = () => {
    if (matchStatus === "CONFIRMED") {
      setWalletBalance((prev) => prev + nextMatch.costPerPlayer);
      setMatchStatus("CANCELLED");
      setCancelOpen(false);
      
      const newTx = {
        id: "tx-" + Date.now(),
        type: "Refund",
        label: "Refund - Booking Cancelled SX-92841",
        amount: nextMatch.costPerPlayer,
        date: "Today, Just Now",
        status: "Success",
        isCredit: true,
      };
      setTransactions(prev => [newTx, ...prev]);
      toast.success("Booking cancelled. ₹150 refunded to wallet.");
    }
  };

  const handleAcceptInvite = (team) => {
    // Remove from invites, add success toast, trigger confetti
    setTeamInvites(prev => prev.filter(inv => inv.id !== team.id));
    toast.success(`You have successfully joined the team: ${team.teamName}!`);
    
    // Add transaction log
    const newTx = {
      id: "tx-" + Date.now(),
      type: "Team Join",
      label: `Joined Team ${team.teamName}`,
      amount: 0,
      date: "Today, Just Now",
      status: "Success",
      isCredit: true,
    };
    setTransactions(prev => [newTx, ...prev]);
    
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4500);
  };

  const handleDeclineInvite = (inviteId, teamName) => {
    setTeamInvites(prev => prev.filter(inv => inv.id !== inviteId));
    toast.error(`Declined invitation to join ${teamName}.`);
  };

  const handleAskCoach = (questionText, answerText) => {
    setAiMessages(prev => [
      ...prev,
      { sender: "user", text: questionText },
      { sender: "coach", text: answerText }
    ]);
  };


  return (
    <div className="min-h-screen bg-background text-foreground pb-6">
      <ConfettiCelebration active={showConfetti} />
      {/* Full screen container */}
      <div className="w-full py-8 space-y-8">
        {/* 1. Header Area - Athlete Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -8, rotateX: 1, rotateY: -1, scale: 1.005 }}
          transition={{ duration: 0.3 }}
          style={{ perspective: 1000 }}
          className="border border-border/80 border-t-white/[0.12] dark:border-t-white/[0.08] bg-gradient-to-br from-card to-card/95 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#6DFF3B]/5 blur-[100px] rounded-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 w-full md:w-auto">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full border-2 border-[#6DFF3B] p-1 flex items-center justify-center bg-white/5">
                {currentUser?.profilePicture ? (
                  <ImageWithFallback
                    src={currentUser.profilePicture}
                    alt="Player"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {playerName !== "Player"
                      ? playerName.trim().split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase()
                      : "P"}
                  </span>
                )}
              </div>
            </div>

            <div className="text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {playerName}
                </h1>
                <Badge className="bg-[#6DFF3B]/15 text-[#6DFF3B] border border-[#6DFF3B]/30 font-bold py-0.5 px-3 text-[10px] rounded-full">
                  {player.level}
                </Badge>
              </div>
              <p className="text-muted-foreground text-xs font-medium">
                {playerCity} • Active since May 2025
              </p>
              <div className="flex flex-wrap gap-2 pt-2 items-center justify-center sm:justify-start">
                {getMappedSports(userSports).map((sport) => {
                  const sportObj = sportsOptions.find(
                    (s) => s.name.toLowerCase() === sport.toLowerCase()
                  );
                  return (
                    <Badge key={sport} className="bg-muted text-muted-foreground border border-border/80 text-[10px] py-0.5 px-2.5 rounded-full">
                      {sportObj ? sportObj.emoji + " " : ""} {sport}
                    </Badge>
                  );
                })}
                <Dialog open={sportsEditOpen} onOpenChange={setSportsEditOpen}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full border border-border hover:bg-muted text-muted-foreground transition-all">
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
                        <Edit3 className="h-5 w-5 text-[#6DFF3B]" /> Edit Preferred Sports
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-4">
                      {sportsOptions.map((sport) => {
                        const isSelected = userSports.includes(sport.id);
                        return (
                          <Button
                            key={sport.id}
                            variant={isSelected ? "default" : "outline"}
                            className={`rounded-xl h-11 text-xs justify-start gap-2 font-semibold ${
                              isSelected ? "bg-[#6DFF3B] text-black hover:bg-[#5ce630]" : "border-border text-foreground bg-card hover:bg-muted"
                            }`}
                            onClick={() => {
                              setUserSports(prev => 
                                prev.includes(sport.id) 
                                  ? prev.filter(x => x !== sport.id) 
                                  : [...prev, sport.id]
                              );
                            }}
                          >
                            <span className="text-base">{sport.emoji}</span> {sport.name}
                          </Button>
                        );
                      })}
                    </div>
                    <Button className="w-full bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-xl mt-2 h-11" onClick={() => {
                      if (userSports.length === 0) {
                        toast.error("Please select at least one sport.");
                        return;
                      }
                      toast.success("Sports preferences updated successfully!");
                      setSportsEditOpen(false);
                    }}>
                      Save Preferences
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* XP Progression Card */}
          <div className="bg-background/50 border border-border/60 rounded-2xl p-4 w-full md:w-80 space-y-3 relative z-10">
            <div className="flex justify-between items-center text-xs">
              <span className="text-foreground font-semibold flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-[#6DFF3B]" /> XP Progression
              </span>
              <span className="text-[#6DFF3B] font-mono font-bold">
                {playerXp} / {player.nextLevelXp} XP
              </span>
            </div>
            <Progress
              value={(playerXp / player.nextLevelXp) * 100}
              className="h-2 bg-muted"
              indicatorColor="bg-[#6DFF3B]"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>LVL 14</span>
              <span>LVL 15 (Earn +1550 XP to Level Up)</span>
            </div>
          </div>
        </motion.div>

        {/* 2. Wallet Card - Full Width Horizontal Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -8, rotateX: 1.5, rotateY: -1.5, scale: 1.005 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3 }}
          style={{ perspective: 1000 }}
          className="bg-gradient-to-br from-card to-card/95 border border-border/80 border-t-white/[0.12] dark:border-t-white/[0.08] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-44 h-44 bg-[#6DFF3B]/5 blur-[60px] pointer-events-none" />

          <div className="flex items-center gap-4 z-10">
            <div className="bg-[#6DFF3B]/10 p-3.5 rounded-2xl border border-[#6DFF3B]/20 text-[#6DFF3B]">
              <Wallet className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                SportX Wallet Balance
              </p>
              <h2 className="text-4xl font-extrabold tracking-tight text-foreground mt-0.5">
                ₹{walletBalance.toLocaleString()}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6DFF3B] font-semibold md:max-w-xs z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6DFF3B] shrink-0" />
            UPI & Card direct top-ups enabled. 100% refund-safe.
          </div>

          <div className="flex gap-3 w-full md:w-auto shrink-0 z-10">
            <Dialog open={txHistoryOpen} onOpenChange={setTxHistoryOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 md:flex-initial rounded-2xl border-border px-6 h-12 text-sm font-semibold bg-muted/20 hover:bg-muted text-foreground"
                >
                  <History className="h-4 w-4 mr-2" /> Transaction History
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background border-border text-foreground sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <Wallet className="h-5 w-5 text-[#6DFF3B]" /> Wallet Transactions
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center bg-card p-3.5 rounded-2xl border border-border/60 shadow-sm">
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
              <DialogTrigger asChild>
                <Button className="flex-1 md:flex-initial rounded-2xl bg-[#6DFF3B] text-black hover:bg-[#5ce630] px-6 h-12 text-sm font-semibold">
                  + Top Up Wallet
                </Button>
              </DialogTrigger>
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
                  className="w-full bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-xl mt-4 h-11"
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
          </div>
        </motion.div>

        {/* 3. Detailed Turf Booking Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -8, rotateX: 1.5, rotateY: -1.5, scale: 1.005 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3 }}
          style={{ perspective: 1000 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-foreground">
            Active Match Center
          </h2>

          <div
            className={`bg-gradient-to-br from-card to-card/95 border border-border/80 border-t-white/[0.12] dark:border-t-white/[0.08] shadow-[0_20px_40px_-5px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl overflow-hidden flex flex-col lg:flex-row transition-all duration-300 ${matchStatus === "CANCELLED" ? "opacity-60 saturate-50" : ""}`}
          >
            {/* Left Side: Turf Image (with elegant card-like border layout instead of sharp cut) */}
            <div className="relative w-full lg:w-1/3 min-h-[220px] lg:min-h-full overflow-hidden p-3 lg:p-4 shrink-0">
              <div className="relative w-full h-full rounded-2xl overflow-hidden min-h-[200px]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=1080"
                  alt="Venue"
                  className="w-full h-full object-cover opacity-75 mix-blend-luminosity absolute inset-0"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1.5">
                  <Badge className="bg-[#6DFF3B] text-black font-semibold text-[9px] py-0.5 px-2.5 rounded-full border-0">
                    5-a-side Football
                  </Badge>
                  <h3 className="text-xl font-black text-white leading-tight">
                    {nextMatch.venue}
                  </h3>
                  <p className="text-[#6DFF3B] font-mono font-bold text-xs flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> {nextMatch.date}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side: Actions & Details */}
            <div className="w-full lg:w-2/3 p-6 flex flex-col justify-between space-y-6">
              {/* Header Match info */}
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#6DFF3B]/10 p-2.5 rounded-full border border-[#6DFF3B]/20 text-[#6DFF3B]">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-base leading-tight">
                      {nextMatch.sport}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Booking ID: {nextMatch.bookingId}
                    </p>
                  </div>
                </div>

                <Badge
                  className={`font-bold px-3 py-1 rounded-full text-xs transition-colors duration-300 ${matchStatus === "CONFIRMED"
                      ? "bg-[#6DFF3B]/15 text-[#6DFF3B] border border-[#6DFF3B]/30"
                      : "bg-red-500/15 text-red-400 border border-red-500/30"
                    }`}
                >
                  {matchStatus}
                </Badge>
              </div>

              {/* Actions Grid */}
              <div
                className={`grid grid-cols-2 sm:grid-cols-4 gap-4 transition-opacity duration-300 ${matchStatus === "CANCELLED" ? "opacity-35 pointer-events-none" : ""}`}
              >
                {/* Digital QR Code Action */}
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card hover:border-[#6DFF3B]/50 transition-all cursor-pointer group h-44 flex flex-col justify-between select-none shadow-sm hover:shadow-md">
                      {/* Top Part: Image (Full clarity) */}
                      <div className="w-full h-28 relative overflow-hidden bg-muted">
                        <ImageWithFallback
                          src="https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?q=80&w=300"
                          alt="Entry Pass Demo"
                          className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Floating Icon */}
                        <div className="absolute top-2 right-2 z-20 bg-background/95 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-sm text-[#6DFF3B] group-hover:bg-[#6DFF3B] group-hover:text-black transition-colors">
                          <QrCode className="h-4 w-4" />
                        </div>
                      </div>
                      {/* Bottom Part: Text */}
                      <div className="p-3 bg-card flex flex-col justify-center flex-1 border-t border-border/40 text-left">
                        <span className="block text-xs font-bold text-foreground">
                          Entry Pass
                        </span>
                        <span className="block text-[9px] text-muted-foreground mt-0.5">
                          QR Gate Ticket
                        </span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-white text-black sm:max-w-xs text-center border-0 p-8">
                    <div className="space-y-4">
                      <h3 className="font-bold text-xl uppercase tracking-wider">
                        {playerName}
                      </h3>
                      <div className="bg-zinc-100 p-4 rounded-2xl mx-auto w-fit">
                        <QrCode className="h-40 w-40 text-black" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Scan at {nextMatch.venue} gate
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Pre-Book Amenities Action */}
                <Dialog open={addonsOpen} onOpenChange={setAddonsOpen}>
                  <DialogTrigger asChild>
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card hover:border-amber-500/50 transition-all cursor-pointer group h-44 flex flex-col justify-between select-none shadow-sm hover:shadow-md">
                      {/* Top Part: Image (Full clarity) */}
                      <div className="w-full h-28 relative overflow-hidden bg-muted">
                        <ImageWithFallback
                          src="https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=300"
                          alt="Add-ons Demo"
                          className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Floating Icon */}
                        <div className="absolute top-2 right-2 z-20 bg-background/95 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-sm text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                          <Coffee className="h-4 w-4" />
                        </div>
                      </div>
                      {/* Bottom Part: Text */}
                      <div className="p-3 bg-card flex flex-col justify-center flex-1 border-t border-border/40 text-left">
                        <span className="block text-xs font-bold text-foreground">
                          Add-ons
                        </span>
                        <span className="block text-[9px] text-muted-foreground mt-0.5">
                          Drinks & Bibs
                        </span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-background border-border text-foreground sm:max-w-md max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Rent & Pre-Book Amenities</DialogTitle>
                    </DialogHeader>
                    {addonsPaid ? (
                      <div className="py-8 text-center space-y-3">
                        <div className="w-16 h-16 bg-[#6DFF3B]/10 border border-[#6DFF3B]/30 text-[#6DFF3B] rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle2 className="h-10 w-10 animate-bounce" />
                        </div>
                        <h4 className="font-bold text-lg">Add-ons Reserved!</h4>
                        <p className="text-sm text-muted-foreground">
                          Items have been successfully reserved & paid.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 py-4">
                        {amenitiesList.map((item) => {
                          const isSelected = selectedAmenities.includes(
                            item.id,
                          );
                          return (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between bg-card p-3 rounded-xl border transition-all ${isSelected ? "border-[#6DFF3B] bg-[#6DFF3B]/5" : "border-border"}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                                  <ImageWithFallback
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-left">
                                  <p className="font-semibold text-xs leading-tight text-foreground">
                                    {item.name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5">
                                    {item.label}
                                  </p>
                                  <p className="text-xs font-bold text-[#6DFF3B] mt-1 font-mono">
                                    ₹{item.price}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant={isSelected ? "secondary" : "outline"}
                                className="rounded-lg h-8 text-xs font-semibold px-4 shrink-0"
                                onClick={() => toggleAmenity(item.id)}
                              >
                                {isSelected ? "Remove" : "Add"}
                              </Button>
                            </div>
                          );
                        })}

                        <div className="flex justify-between font-bold text-sm border-t border-border pt-4 mt-2">
                          <span>Total Amount</span>
                          <span className="text-[#6DFF3B] font-mono">
                            ₹{calculateTotalAddons()}
                          </span>
                        </div>

                        <Button
                          className="w-full bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-semibold mt-2 rounded-xl h-11"
                          disabled={
                            calculateTotalAddons() === 0 ||
                            walletBalance < calculateTotalAddons()
                          }
                          onClick={handlePayAddons}
                        >
                          {walletBalance >= calculateTotalAddons()
                            ? "Pay from Wallet"
                            : "Insufficient Balance"}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Split Bill Action */}
                <Dialog open={splitOpen} onOpenChange={setSplitOpen}>
                  <DialogTrigger asChild>
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-card hover:border-blue-500/50 transition-all cursor-pointer group h-44 flex flex-col justify-between select-none shadow-sm hover:shadow-md">
                      {/* Top Part: Image (Full clarity) */}
                      <div className="w-full h-28 relative overflow-hidden bg-muted">
                        <ImageWithFallback
                          src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=300"
                          alt="Split Bill Demo"
                          className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Floating Icon */}
                        <div className="absolute top-2 right-2 z-20 bg-background/95 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-sm text-blue-400 group-hover:bg-blue-500 group-hover:text-black transition-colors">
                          <Users className="h-4 w-4" />
                        </div>
                      </div>
                      {/* Bottom Part: Text */}
                      <div className="p-3 bg-card flex flex-col justify-center flex-1 border-t border-border/40 text-left">
                        <span className="block text-xs font-bold text-foreground">
                          Split Bill
                        </span>
                        <span className="block text-[9px] text-muted-foreground mt-0.5">
                          Invite & Share Cost
                        </span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Split the Cost</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-6 text-center">
                      {/* Interactive Counter */}
                      <div className="flex items-center justify-center gap-6 py-4 bg-muted/30 border border-border/60 rounded-2xl">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full border-border bg-background hover:bg-muted text-foreground shrink-0"
                          onClick={() =>
                            setSplitPlayers((prev) => Math.max(2, prev - 1))
                          }
                          disabled={splitPlayers <= 2}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="text-center w-24">
                          <span className="text-3xl font-extrabold text-foreground">
                            {splitPlayers}
                          </span>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                            Players
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full border-border bg-background hover:bg-muted text-foreground shrink-0"
                          onClick={() =>
                            setSplitPlayers((prev) => Math.min(14, prev + 1))
                          }
                          disabled={splitPlayers >= 14}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Dynamic Personal Share */}
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">
                          Your Personal Share
                        </p>
                        <p className="text-4xl font-black text-[#6DFF3B] font-mono">
                          ₹{Math.round(1200 / splitPlayers)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total: ₹1,200 divided by {splitPlayers} players
                        </p>
                      </div>

                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4 rounded-xl h-11 font-semibold flex items-center justify-center gap-2"
                        onClick={handleCopyLink}
                      >
                        {copiedLink ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Share2 className="h-4 w-4" />
                        )}
                        {copiedLink ? "Link Copied!" : "Copy Split Invite Link"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Directions Action */}
                <div
                  className="relative overflow-hidden rounded-2xl border border-border bg-card hover:border-rose-500/50 transition-all cursor-pointer group h-44 flex flex-col justify-between select-none shadow-sm hover:shadow-md"
                  onClick={() =>
                    window.open(
                      "https://maps.google.com/?q=Elite+Turf+Arena+Mumbai",
                      "_blank",
                    )
                  }
                >
                  {/* Top Part: Image (Full clarity) */}
                  <div className="w-full h-28 relative overflow-hidden bg-muted">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=300"
                      alt="Directions Demo"
                      className="w-full h-full object-cover opacity-100 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Floating Icon */}
                    <div className="absolute top-2 right-2 z-20 bg-background/95 backdrop-blur-md p-1.5 rounded-lg border border-border shadow-sm text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>
                  {/* Bottom Part: Text */}
                  <div className="p-3 bg-card flex flex-col justify-center flex-1 border-t border-border/40 text-left">
                    <span className="block text-xs font-bold text-foreground">
                      Directions
                    </span>
                    <span className="block text-[9px] text-muted-foreground mt-0.5">
                      Google Maps Link
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom row (Avatars & Cancel Booking) */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-border/40">
                {/* Mock portraits with better design */}
                <div className="flex -space-x-3 items-center">
                  <div className="w-10 h-10 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                    RD
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-bold text-blue-400">
                    AM
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-bold text-green-400">
                    SK
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-bold text-amber-400">
                    JD
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-card bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 z-10">
                    +3
                  </div>
                </div>

                {/* Cancel Booking dialog */}
                <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all ${matchStatus === "CANCELLED"
                          ? "opacity-0 pointer-events-none w-0 h-0 p-0"
                          : ""
                        }`}
                    >
                      <Ban className="mr-2 h-4 w-4" /> Cancel Booking
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background border-border text-foreground">
                    <DialogHeader>
                      <DialogTitle className="text-red-400 flex items-center gap-2">
                        <Ban className="h-5 w-5" /> Cancel Booking
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <p className="text-muted-foreground text-sm">
                        Are you sure? You are cancelling more than 4 hours
                        before the match.
                      </p>
                      <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl space-y-1">
                        <p className="text-sm font-semibold text-green-400 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4" /> 100% Refund
                          Guaranteed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₹{nextMatch.costPerPlayer} will be credited back to
                          your SportX Wallet instantly.
                        </p>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button
                          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl"
                          onClick={() => setCancelOpen(false)}
                        >
                          No, Keep Booking
                        </Button>
                        <Button
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl"
                          onClick={handleCancelBooking}
                        >
                          Yes, Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {matchStatus === "CANCELLED" && (
                  <span className="text-xs text-red-400 font-semibold flex items-center gap-1 bg-red-500/10 px-3.5 py-1.5 rounded-full border border-red-500/20">
                    Refunded ₹{nextMatch.costPerPlayer} to Wallet
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tournament & Event Organizer Block */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -8, rotateX: 1.5, rotateY: -1.5, scale: 1.005 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3 }}
          style={{ perspective: 1000 }}
          className="bg-gradient-to-br from-card to-card/95 border border-border/80 border-t-white/[0.12] dark:border-t-white/[0.08] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute left-0 top-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none" />

          <div className="flex items-center gap-4 z-10">
            <div className="bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/20 text-amber-500">
              <Trophy className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold">
                Tournaments & Events
              </p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">
                Host Your Own Event
              </h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Organize tournaments, create custom matches, manage teams, and invite players across the city.
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto shrink-0 z-10">
            <Button
              className="flex-1 md:flex-initial rounded-2xl bg-amber-500 text-black hover:bg-amber-400 px-8 h-12 text-sm font-semibold shadow-md"
              onClick={() => navigate("/organizer-dashboard")}
            >
              Go to Organizer Dashboard
            </Button>
          </div>
        </motion.div>

        {/* 4. Active Subscription Pass - Full Width Horizontal Banner */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -8, rotateX: 1.5, rotateY: -1.5, scale: 1.005 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3 }}
          style={{ perspective: 1000 }}
          className="bg-gradient-to-br from-card to-card/95 border border-border/80 border-t-white/[0.12] dark:border-t-white/[0.08] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 blur-[50px] pointer-events-none" />

          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-semibold">
                  Active Subscription Pass
                </span>
                <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/35 text-[9px] font-bold">
                  FOOTBALL
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Weekly Turf Pass
              </h3>
            </div>
          </div>

          <div className="flex-1 md:max-w-md space-y-2">
            <div className="flex justify-between text-xs font-semibold text-foreground">
              <span>Bookings Utilized</span>
              <span>2 of 5 Credits Used</span>
            </div>
            <Progress
              value={40}
              className="h-2 bg-muted"
              indicatorColor="bg-[#6DFF3B]"
            />
          </div>

          <div className="flex gap-8 text-xs text-muted-foreground border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-8 shrink-0">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Expires In
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">4 Days</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Remaining
              </p>
              <p className="text-sm font-bold text-[#6DFF3B] mt-0.5">
                3 Credits
              </p>
            </div>
          </div>
        </motion.div>

        {/* 5. AI Coach Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -6, rotateX: 2, rotateY: -2, scale: 1.01 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3 }}
          style={{ perspective: 1000 }}
          className="bg-gradient-to-r from-[#6DFF3B]/10 to-[#6DFF3B]/[0.02] border border-[#6DFF3B]/20 shadow-[0_12px_24px_-8px_rgba(109,255,59,0.15)] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex gap-4 items-start">
            <div className="bg-[#6DFF3B]/20 p-2 rounded-xl shrink-0 text-[#6DFF3B]">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                AI Coach Insight{" "}
                <Badge className="bg-[#6DFF3B] text-black text-[10px] uppercase px-1.5 py-0 h-4 border-0">
                  Beta
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-xl">
                The pitch at Elite Turf is synthetic 4G. Wear astro-turf trainers
                (TF) for best grip. High humidity today—hydrate well before the
                6:00 PM kick-off.
              </p>
            </div>
          </div>
          <Dialog open={aiCoachOpen} onOpenChange={setAiCoachOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-semibold rounded-xl text-xs px-5 h-10 shrink-0">
                <MessageSquare className="h-4 w-4 mr-2" /> Chat with Coach
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-border text-foreground sm:max-w-md max-h-[85vh] flex flex-col p-6 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <BrainCircuit className="h-5 w-5 text-[#6DFF3B]" /> AI Sports Coach
                </DialogTitle>
              </DialogHeader>
              
              {/* Message log */}
              <div className="flex-1 overflow-y-auto space-y-3.5 my-4 pr-1 min-h-[250px] max-h-[350px]">
                {aiMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      msg.sender === "user" 
                        ? "bg-[#6DFF3B]/10 border border-[#6DFF3B]/30 text-foreground rounded-tr-none" 
                        : "bg-muted text-foreground border border-border/80 rounded-tl-none"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Presets */}
              <div className="space-y-2 border-t border-border/40 pt-4">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Ask a Strategy Question:</p>
                <div className="flex flex-col gap-1.5">
                  <button 
                    className="text-left text-xs bg-muted/40 hover:bg-muted p-2 rounded-lg text-[#6DFF3B] font-medium border border-border/40 transition-colors"
                    onClick={() => handleAskCoach(
                      "What footwear is recommended for today's match?", 
                      "Elite Turf Arena has a 4G synthetic turf pitch. We highly recommend astro-turf trainers (TF) with small rubber studs for optimal grip. Avoid wearing firm-ground cleats (FG) with long plastic studs as they increase slipping and injury risk on dry synthetic grass."
                    )}
                  >
                    ⚽ What footwear is recommended?
                  </button>
                  <button 
                    className="text-left text-xs bg-muted/40 hover:bg-muted p-2 rounded-lg text-[#6DFF3B] font-medium border border-border/40 transition-colors"
                    onClick={() => handleAskCoach(
                      "What is the best hydration plan for this weather?", 
                      "Humidity is high today (around 78%). Start sipping water with electrolytes 3 hours before. Drink about 250ml every 20 minutes during warm-ups, and keep small sips during sub rotation. Avoid sugary sports drinks right before kick-off."
                    )}
                  >
                    💧 Hydration plan for high humidity?
                  </button>
                  <button 
                    className="text-left text-xs bg-muted/40 hover:bg-muted p-2 rounded-lg text-[#6DFF3B] font-medium border border-border/40 transition-colors"
                    onClick={() => handleAskCoach(
                      "Suggest a quick 10-minute pre-match warmup routine.", 
                      "Start with 5 mins of dynamic stretches (high knees, leg swings, lunge-walks) to activate your muscles. Follow with 3 mins of simple short-passing drills in triangles to get in touch with the ball. Finish with 2-3 short accelerations (shuttle runs) to raise your heart rate."
                    )}
                  >
                    🏃 pre-match warmup routine?
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* 6. Matchmaking & Pro Shop - Side by Side Grid */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Matchmaking Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-[#6DFF3B]" /> Open Matches Near You
              </h3>
              <Badge variant="outline" className="text-[9px] text-[#6DFF3B] border-[#6DFF3B]/30 bg-[#6DFF3B]/5 py-0 px-2 h-5 rounded-full">
                📍 🏏 10km & Sport Filter Active
              </Badge>
            </div>
            <div className="space-y-4 flex flex-col justify-between h-[calc(100%-2.5rem)]">
              {(() => {
                const filtered = openMatches.filter((match) => {
                  const isClose = match.distanceKm <= 10;
                  const matchesSport = userSports.some(sportId => {
                    const sportObj = sportsOptions.find(s => s.id === sportId);
                    const sportName = sportObj ? sportObj.name.toLowerCase() : sportId.toLowerCase();
                    return match.sport.toLowerCase().includes(sportName) || sportName.includes(match.sport.toLowerCase());
                  });
                  return isClose && matchesSport;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-8 text-center bg-card rounded-2xl border border-border/80 border-t-white/[0.12] dark:border-t-white/[0.08] shadow-sm flex flex-col justify-center items-center flex-1">
                      <p className="text-xs text-muted-foreground">No matching open matches within 10 km.</p>
                      <p className="text-[9px] text-muted-foreground/60 mt-1">(Filters out matches in Thane/Pune/Unrelated games)</p>
                    </div>
                  );
                }

                return filtered.map((match) => (
                  <motion.div
                    key={match.id}
                    whileHover={{ y: -6, rotateX: 1.5, rotateY: -1.5, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                    style={{ perspective: 1000 }}
                    className="bg-gradient-to-br from-card to-card/95 border border-border/80 border-t-white/[0.12] dark:border-t-white/[0.08] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)] p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between flex-1 animate-fadeIn"
                  >
                    <div className="text-left w-full sm:w-auto">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-muted text-muted-foreground border-border text-[9px] py-0.5 px-2">
                          {match.sport}
                        </Badge>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {match.distance}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-500 ml-auto sm:ml-0">
                          {match.spotsLeft} spots left
                        </span>
                      </div>
                      <h4 className="font-bold text-foreground text-base leading-snug">
                        {match.venue}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {match.time}
                      </p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto bg-[#6DFF3B]/10 hover:bg-[#6DFF3B]/20 text-[#6DFF3B] border border-[#6DFF3B]/20 rounded-xl px-4 text-xs font-semibold h-10">
                          Join • ₹{match.cost}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-background border-border text-foreground">
                        <DialogHeader>
                          <DialogTitle className="font-bold text-lg">Join Open Match</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <p className="text-muted-foreground text-sm">
                            You are joining {match.sport} at {match.venue}.
                          </p>
                          <div className="flex justify-between font-bold text-base border-t border-border pt-4 font-mono text-[#6DFF3B]">
                            <span>Total Cost</span>
                            <span>₹{match.cost}</span>
                          </div>
                          <Button
                            className="w-full bg-[#6DFF3B] text-black hover:bg-[#5ce630] rounded-xl font-bold h-11"
                            onClick={() => {
                              if (walletBalance >= match.cost) {
                                setWalletBalance((prev) => prev - match.cost);
                                const newTx = {
                                  id: "tx-" + Date.now(),
                                  type: "Booking",
                                  label: `Joined Match - ${match.venue}`,
                                  amount: match.cost,
                                  date: "Today, Just Now",
                                  status: "Success",
                                  isCredit: false,
                                };
                                setTransactions(prev => [newTx, ...prev]);
                                toast.success(`Successfully joined match at ${match.venue}!`);
                              } else {
                                toast.error("Insufficient wallet balance!");
                              }
                            }}
                          >
                            Confirm & Pay from Wallet
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </motion.div>
                ));
              })()}
            </div>
          </div>


          {/* Pro Shop Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-purple-400" /> SportX Pro
              Shop
            </h3>
            <div className="relative overflow-hidden w-full py-2">
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes marquee-shop {
                  0% { transform: translate3d(0, 0, 0); }
                  100% { transform: translate3d(-50%, 0, 0); }
                }
                .marquee-shop-container {
                  display: flex;
                  gap: 16px;
                  width: max-content;
                  animation: marquee-shop 25s linear infinite;
                }
                .marquee-shop-container:hover {
                  animation-play-state: paused;
                }
              `}} />
              <div className="marquee-shop-container">
                {[...shopItems, ...shopItems].map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="w-[170px] shrink-0 bg-gradient-to-br from-card to-card/95 border border-border/80 border-t-white/[0.12] dark:border-t-white/[0.08] shadow-[0_12px_30px_-5px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_38px_-10px_rgba(0,0,0,0.5)]"
                  >
                    <div className="aspect-square w-full relative bg-muted overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                        <p className="text-white font-mono font-bold text-xs">
                          ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <h4 className="font-medium text-sm text-foreground line-clamp-1">
                        {item.name}
                      </h4>
                      <Dialog
                        onOpenChange={(open) => {
                          if (!open) setPurchasedItemId(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl cursor-pointer"
                          >
                            Buy Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background border-border text-foreground">
                          {purchasedItemId === item.id ? (
                            <div className="py-8 text-center space-y-4">
                              <div className="w-16 h-16 bg-[#6DFF3B]/10 border border-[#6DFF3B]/30 text-[#6DFF3B] rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-10 w-10 animate-bounce" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-bold text-xl text-foreground">
                                  Purchase Successful!
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Successfully bought {item.name}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground bg-muted/40 py-2 px-4 rounded-full w-fit mx-auto border border-border">
                                ₹{item.price} deducted from SportX Wallet
                              </p>
                            </div>
                          ) : (
                            <>
                              <DialogHeader>
                                <DialogTitle>Confirm Purchase</DialogTitle>
                              </DialogHeader>
                              <div className="py-4 space-y-4 flex flex-col items-center text-center">
                                <ImageWithFallback
                                  src={item.image}
                                  alt={item.name}
                                  className="w-32 h-32 rounded-xl object-cover mb-2"
                                />
                                <p className="font-medium text-lg">{item.name}</p>
                                <p className="text-2xl font-bold text-[#6DFF3B]">
                                  ₹{item.price}
                                </p>
                                <Button
                                  className="w-full bg-[#6DFF3B] text-black hover:bg-[#5ce630] mt-4 rounded-xl font-bold cursor-pointer"
                                  onClick={() => {
                                    if (walletBalance >= item.price) {
                                      setWalletBalance(
                                        (prev) => prev - item.price,
                                      );
                                      setPurchasedItemId(item.id);
                                    }
                                  }}
                                >
                                  {walletBalance >= item.price
                                    ? "Pay from Wallet"
                                    : "Insufficient Balance"}
                                </Button>
                              </div>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* 7. Highlights & Pending Actions (Stacked Side-by-Side) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Video Highlights */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              📹 Match Highlights
            </h3>
            <Dialog open={highlightsOpen} onOpenChange={setHighlightsOpen}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ y: -8, rotateX: 2, rotateY: -2, scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                  style={{ perspective: 1000 }}
                  className="bg-card border border-border/80 border-t-white/[0.12] dark:border-t-white/[0.08] shadow-[0_15px_35px_-5px_rgba(0,0,0,0.4)] rounded-3xl overflow-hidden relative group cursor-pointer"
                >
                  <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 border border-zinc-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />{" "}
                    Auto-Cam Clip
                  </div>
                  <div className="relative aspect-video w-full bg-black">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1080"
                      alt="Match highlight"
                      className="w-full h-full object-cover opacity-80"
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-14 h-14 bg-[#6DFF3B]/90 hover:bg-[#6DFF3B] hover:scale-105 transition-all text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(109,255,59,0.3)]">
                        <Play className="h-5 w-5 ml-1 fill-current" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                      <p className="text-white font-medium mb-1">
                        Your Goal vs Delta FC
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last Saturday • 1.2k views
                      </p>
                    </div>
                  </div>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="bg-black border-zinc-800 text-white sm:max-w-xl p-0 overflow-hidden rounded-3xl">
                <DialogHeader className="p-6 bg-zinc-950 border-b border-zinc-900">
                  <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
                    📹 Playback: Your Goal vs Delta FC
                  </DialogTitle>
                </DialogHeader>
                <div className="relative aspect-video bg-zinc-950 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1080"
                    alt="Goal playback"
                    className="w-full h-full object-cover opacity-60 filter blur-[2px]"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                    <span className="relative flex h-16 w-16">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6DFF3B] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-16 w-16 bg-[#6DFF3B] text-black items-center justify-center shadow-lg font-bold">
                        <Play className="h-6 w-6 ml-1 fill-current" />
                      </span>
                    </span>
                    <p className="text-sm font-semibold mt-4 text-white uppercase tracking-wider">Simulating Auto-Cam Playback</p>
                    <p className="text-xs text-zinc-400 mt-1">Video is streaming from Elite Turf Cam #4</p>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black to-transparent flex items-center justify-between">
                    <div className="flex-1 mr-4">
                      <Progress value={45} className="h-1 bg-zinc-800" indicatorColor="bg-[#6DFF3B]" />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-300">0:06 / 0:15</span>
                  </div>
                </div>
                <div className="p-6 bg-zinc-950 border-t border-zinc-900 grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Shot Speed</p>
                    <p className="text-lg font-black text-[#6DFF3B] mt-0.5 font-mono">104.8 km/h</p>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Shot Distance</p>
                    <p className="text-lg font-black text-[#6DFF3B] mt-0.5 font-mono">21.5 Meters</p>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Assist By</p>
                    <p className="text-sm font-bold text-white mt-0.5">Sanjay Kumar</p>
                  </div>
                  <div className="bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Share Clip</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Copy link to share</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold h-8 rounded-lg text-[10px] px-3 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText("https://highlights.sportx.club/clip/SX-GOAL-4821");
                        toast.success("Goal clip sharing link copied to clipboard!");
                      }}
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* 7. Highlights & Pending Actions (Stacked Side-by-Side) */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" /> Pending Actions & Invites
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Match Feedback (Rate / MVP) Card */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-card to-card/95 border border-border/80 border-t-white/[0.12] dark:border-t-white/[0.08] shadow-[0_15px_35px_-5px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl p-5 min-h-[220px] flex flex-col justify-between"
              >
                {ratingSubmitted ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-3 h-full py-4">
                    <div className="w-12 h-12 bg-[#6DFF3B]/10 border border-[#6DFF3B]/30 text-[#6DFF3B] rounded-full flex items-center justify-center mx-auto">
                      <Check className="h-6 w-6 animate-bounce" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Rating Submitted!
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Thanks for your feedback. +50 XP added!
                      </p>
                    </div>
                    {!mvpVoted ? (
                      <Dialog
                        open={mvpDialogOpen}
                        onOpenChange={setMvpDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-[#6DFF3B] text-black hover:bg-[#5ce630] text-xs h-8 font-semibold rounded-lg px-4"
                          >
                            Vote MVP
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-background border-border text-foreground">
                          <DialogHeader>
                            <DialogTitle className="font-bold text-lg">Vote Match MVP</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-3 text-center">
                            <p className="text-sm text-muted-foreground">
                              Choose the most valuable player from yesterday's
                              match:
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              {[
                                "Amit Sharma",
                                "Sanjay Kumar",
                                "John Doe",
                                playerName,
                              ].map((name) => (
                                <Button
                                  key={name}
                                  variant="outline"
                                  className="border-border hover:bg-muted text-xs h-10 font-semibold"
                                  onClick={() => {
                                    setPlayerXp((prev) =>
                                      Math.min(player.nextLevelXp, prev + 50),
                                    );
                                    setMvpVoted(true);
                                    setMvpDialogOpen(false);
                                    setShowConfetti(true);
                                    setTimeout(() => setShowConfetti(false), 4500);
                                    toast.success(`Voted! Confetti celebration for MVP ${name}!`);
                                  }}
                                >
                                  {name}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Badge className="bg-[#6DFF3B]/15 text-[#6DFF3B] border border-[#6DFF3B]/30 text-[10px] py-1 px-3 rounded-full">
                        All Actions Completed (+100 XP)
                      </Badge>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">
                      Rate yesterday's match at City Turf
                    </p>
                    <div className="flex gap-2 justify-center py-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-all scale-100 hover:scale-110"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${star <= (hoverRating || userRating)
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-zinc-700 hover:text-yellow-400"
                              }`}
                          />
                        </button>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      className="w-full text-xs bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-xl h-11"
                      disabled={userRating === 0}
                      onClick={() => {
                        setPlayerXp((prev) =>
                          Math.min(player.nextLevelXp, prev + 50),
                        );
                        setRatingSubmitted(true);
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 4000);
                        toast.success("Feedback submitted! +50 XP claimed.");
                      }}
                    >
                      Submit Rating & Claim +50 XP
                    </Button>
                  </>
                )}
              </motion.div>

              {/* Inbound Recruitment Offers / Team Invites Card (With dual filters) */}
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-card to-card/95 border border-border/80 border-t-white/[0.12] dark:border-t-white/[0.08] shadow-[0_15px_35px_-5px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl p-5 min-h-[220px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <UserPlus className="h-4.5 w-4.5 text-[#6DFF3B]" /> Inbound Team Invites
                    </p>
                    <Badge variant="outline" className="text-[9px] text-[#6DFF3B] border-[#6DFF3B]/30 bg-[#6DFF3B]/5 py-0 px-2 h-5 rounded-full">
                      10km & Sport Filter Active
                    </Badge>
                  </div>
                  
                  {/* Filter invites */}
                  {(() => {
                    const filtered = teamInvites.filter(invite => {
                      const isClose = invite.distanceKm <= 10;
                      const matchesSport = userSports.some(sportId => {
                        const sportObj = sportsOptions.find(s => s.id === sportId);
                        const sportName = sportObj ? sportObj.name.toLowerCase() : sportId.toLowerCase();
                        return invite.sport.toLowerCase() === sportName;
                      });
                      return isClose && matchesSport;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="py-6 text-center space-y-1">
                          <p className="text-xs text-muted-foreground">No matching invites within 10 km.</p>
                          <p className="text-[9px] text-muted-foreground/60">(Restricting Pune/Thane/Unrelated invites)</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3.5 max-h-[160px] overflow-y-auto pr-1">
                        {filtered.map(invite => {
                          const sportObj = sportsOptions.find(s => s.name.toLowerCase() === invite.sport.toLowerCase());
                          return (
                            <div key={invite.id} className="flex items-center justify-between bg-background/60 p-3 rounded-2xl border border-border/40">
                              <div>
                                <h4 className="font-semibold text-xs text-foreground flex items-center gap-1">
                                  {invite.teamName} <span className="text-[10px]">{sportObj?.emoji}</span>
                                </h4>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Invited as {invite.roleInvited} • {invite.distance}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  className="h-7 text-[10px] bg-[#6DFF3B] text-black hover:bg-[#5ce630] font-bold rounded-lg px-2.5"
                                  onClick={() => handleAcceptInvite(invite)}
                                >
                                  Accept
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg px-2.5"
                                  onClick={() => handleDeclineInvite(invite.id, invite.teamName)}
                                >
                                  Decline
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
