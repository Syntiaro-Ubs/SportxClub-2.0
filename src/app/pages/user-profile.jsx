import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  AlertCircle,
  Ban,
  Bookmark,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Flame,
  History,
  LogOut,
  MapPin,
  Medal,
  MessageCircle,
  MessageSquare,
  Plus,
  QrCode,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  User,
  Wallet,
  X,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { downloadSportXPassPdf, parseBookingSlots } from "../utils/ticket-pdf-generator";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { isValidProfileImage } from "../components/ui/utils";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Container } from "../components/ui/container";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../providers/auth-provider";
import { profileService } from "../services/profile.service";
import { cashfreeService } from "../payment/cashfree-service";
import { toast } from "sonner";

const sportsOptions = ["football", "cricket", "badminton", "tennis", "basketball", "swimming", "gym", "volleyball"];

const toTitleCase = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const DEFAULT_MATCH_ADDONS = [
  {
    id: "addon-gatorade",
    name: "Gatorade Electrolyte Pack (2x)",
    category: "Hydration",
    price: 120,
    badge: "Popular",
    image: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?auto=format&fit=crop&w=400&q=80",
    description: "Chilled isotonic sports drinks for half-time rehydration.",
  },
  {
    id: "addon-bibs",
    name: "Team Bibs Set (10 Pcs)",
    category: "Gear",
    price: 250,
    badge: "Essential",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80",
    description: "High-visibility breathable neon bibs for team separation.",
  },
  {
    id: "addon-ball",
    name: "Pro FIFA Match Ball (Pitch Ready)",
    category: "Gear",
    price: 150,
    badge: "Gear",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=400&q=80",
    description: "Pre-pumped official match ball ready at turf reception.",
  },
  {
    id: "addon-protein",
    name: "Post-Match Whey Shake",
    category: "Nutrition",
    price: 180,
    badge: "Recovery",
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=400&q=80",
    description: "25g high quality pure whey protein blended with cold almond milk.",
  },
  {
    id: "addon-spray",
    name: "Cold Relief Freeze Spray & First-Aid",
    category: "Gear",
    price: 99,
    badge: "Safety",
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=400&q=80",
    description: "Instant cooling spray for knocks, sprains, and pitch fatigue.",
  },
  {
    id: "addon-water",
    name: "Mineral Water Crate (12x 500ml)",
    category: "Hydration",
    price: 140,
    badge: "Hydration",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80",
    description: "Chilled sealed mineral water bottles delivered straight to your bench.",
  },
];

const CANCELLATION_REASONS = [
  "Scheduling conflict / Change of plans",
  "Bad weather / Unfavorable conditions",
  "Injury or sudden health issue",
  "Squad / Team members unavailable",
  "Booked wrong slot / venue by mistake",
  "Other reason",
];

const getInitials = (name) => {
  if (!name) return "?";
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
};

const getHandle = (user) => {
  if (user?.fullName) return `@${user.fullName.toLowerCase().replace(/\s+/g, "")}`;
  if (user?.email) return `@${user.email.split("@")[0]}`;
  return "";
};

const getSportName = (sport) => {
  const normalized = String(sport || "").toLowerCase();
  const known = sportsOptions.find((item) => item === normalized);
  return known ? known[0].toUpperCase() + known.slice(1) : String(sport || "");
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { dateStyle: "medium" });
};

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

function EmptyState({ children }) {
  return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{children}</p>;
}

export function UserProfile() {
  const navigate = useNavigate();
  const { currentUser, playerUser, logout, deleteAccount } = useAuth();
  const activeUser = playerUser || currentUser;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Active Match Center & Account Modals
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [txHistoryOpen, setTxHistoryOpen] = useState(false);
  const [entryPassOpen, setEntryPassOpen] = useState(false);
  const [addonsOpen, setAddonsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Dynamic Content Modals
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [logMatchOpen, setLogMatchOpen] = useState(false);

  // Operations state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addonCategory, setAddonCategory] = useState("ALL");
  const [shopCategory, setShopCategory] = useState("ALL");
  const [selectedReason, setSelectedReason] = useState(CANCELLATION_REASONS[0]);
  const [cancelNotes, setCancelNotes] = useState("");
  const [refundDestination, setRefundDestination] = useState("source"); // "source" (Bank/UPI) or "wallet"
  const [isCancelling, setIsCancelling] = useState(false);

  // Dynamic Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Dynamic Match Log Form State
  const [matchVenue, setMatchVenue] = useState("");
  const [matchSport, setMatchSport] = useState("Football");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [matchResult, setMatchResult] = useState("Won");
  const [matchScore, setMatchScore] = useState("5 - 3");
  const [isSubmittingMatch, setIsSubmittingMatch] = useState(false);

  const refreshProfile = useCallback(async () => {
    const userToFetch = activeUser || (() => {
      try {
        return JSON.parse(sessionStorage.getItem("playerUser") || localStorage.getItem("playerUser") || "null");
      } catch { return null; }
    })();

    if (!userToFetch) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setProfile(await profileService.get(userToFetch));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [activeUser]);

  useEffect(() => {
    const timer = setTimeout(() => refreshProfile(), 0);
    return () => clearTimeout(timer);
  }, [refreshProfile]);

  // Verify wallet top-up if redirected back from Cashfree
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const topupOrderId = params.get("order_id");
      const topupStatus = params.get("topup_status");
      if (topupStatus === "success" && topupOrderId) {
        window.history.replaceState({}, document.title, window.location.pathname);
        cashfreeService.verifyWalletTopup(topupOrderId, {
          userEmail: currentUser?.email,
          userName: currentUser?.fullName || currentUser?.name,
        }).then((res) => {
          if (res && res.success) {
            toast.success(res.message || "Wallet top-up credited successfully!");
            refreshProfile();
          }
        }).catch(() => refreshProfile());
      }
    } catch (e) {}
  }, [currentUser, refreshProfile]);

  const user = profile?.user || currentUser;
  const achievements = useMemo(() => {
    if (!user) return [];
    const values = [{ title: `${user.gamesPlayed || 0} Matches`, icon: Trophy }];
    if (user.isTopScorer) values.push({ title: "Top Scorer", icon: Medal });
    if (user.isTeamCaptain) values.push({ title: "Team Captain", icon: Bookmark });
    return values;
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      toast.error("Please type DELETE to confirm account deletion.");
      return;
    }
    try {
      setIsDeleting(true);
      await profileService.deleteAccount(currentUser);
      if (typeof deleteAccount === "function") {
        await deleteAccount();
      } else {
        logout();
      }
      toast.success("Your player account has been permanently removed from database.");
      setDeleteOpen(false);
      navigate("/login");
    } catch (err) {
      console.error("Delete account error:", err);
      toast.error(err.message || "Failed to delete account from database");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Please enter a valid top-up amount.");
      return;
    }
    try {
      const topupPayload = {
        amount,
        userEmail: currentUser?.email || profile?.email || "user@sportxclub.com",
        userName: currentUser?.name || currentUser?.fullName || profile?.fullName || "SportX Player",
        userPhone: currentUser?.phone || profile?.phone || "9876543210",
        orderType: "WALLET_TOPUP",
      };

      setTopUpOpen(false);
      setTopUpAmount("");
      toast.loading("Opening Cashfree Live Gateway for Wallet Top-Up...", { id: "topup-loading" });

      const paymentRes = await cashfreeService.initiatePayment(topupPayload);
      toast.dismiss("topup-loading");

      // Verify top-up on backend and credit wallet balance
      if (paymentRes?.order_id) {
        const verifyRes = await cashfreeService.verifyWalletTopup(paymentRes.order_id, topupPayload);
        if (verifyRes && verifyRes.success) {
          toast.success(verifyRes.message || `₹${amount} added to your SportX Wallet successfully!`);
          await refreshProfile();
          return;
        }
      }

      await refreshProfile();
    } catch (requestError) {
      toast.dismiss("topup-loading");
      console.warn("Wallet top-up gateway note:", requestError.message);
      // Fallback to direct topup if gateway mode is offline
      try {
        setProfile(await profileService.topUp(currentUser, amount));
        toast.success(`₹${amount} added to your SportX Wallet!`);
      } catch (fallbackErr) {
        toast.error(fallbackErr.message || "Failed to process top-up");
      }
    }
  };

  const handlePurchase = async (itemOrId, successMessage = "Purchase successful!") => {
    try {
      const isObj = typeof itemOrId === "object" && itemOrId !== null;
      const itemId = isObj ? itemOrId.id : itemOrId;
      const itemName = isObj ? (itemOrId.name || itemOrId.title) : "Item";
      const itemPrice = isObj ? itemOrId.price : null;

      setSelectedProductId(itemId);

      if (itemPrice && (profile?.walletBalance || 0) < Number(itemPrice)) {
        toast.error(`Insufficient wallet balance (₹${profile?.walletBalance || 0}). Please top up at least ₹${itemPrice}.`);
        setAddonsOpen(false);
        setTopUpOpen(true);
        return;
      }

      const updated = await profileService.purchase(currentUser, isObj ? itemOrId : { id: itemId, name: itemName, price: itemPrice });
      if (updated) {
        setProfile(updated);
      } else {
        await refreshProfile();
      }
      toast.success(successMessage || `${itemName} reserved! Deducted ₹${itemPrice || ""} from SportX Wallet.`);
      setAddonsOpen(false);
    } catch (requestError) {
      console.error("Purchase error:", requestError);
      toast.error(requestError.message || "Failed to complete purchase");
    } finally {
      setSelectedProductId(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!profile?.activeBooking) return;
    try {
      setIsCancelling(true);
      const booking = profile.activeBooking;
      const fullReason = cancelNotes.trim() ? `${selectedReason} - ${cancelNotes.trim()}` : selectedReason;
      const response = await profileService.cancelBooking(currentUser, booking.id, fullReason, {
        turfName: booking.turf_name,
        date: booking.date,
        timeSlot: booking.time_slot || booking.slot_time,
        refundDestination,
      });
      if (response?.data) {
        setProfile(response.data);
      } else if (response && !response.error) {
        setProfile(response);
      } else {
        await refreshProfile();
      }
      setCancelOpen(false);
      setCancelNotes("");
      const successMsg = response?.message || (refundDestination === "source"
        ? `Slot cancelled! ₹${booking.amount || 0} refund initiated directly to your original Bank / UPI account.`
        : `Slot cancelled! ₹${booking.amount || 0} has been refunded to your SportX Wallet.`);
      toast.success(successMsg, { duration: 6000 });
    } catch (requestError) {
      toast.error(requestError.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleAddReview = async () => {
    if (!reviewComment.trim()) {
      toast.error("Please enter a review comment.");
      return;
    }
    try {
      setIsSubmittingReview(true);
      const updated = await profileService.addReview(currentUser, {
        rating: reviewRating,
        comment: reviewComment.trim(),
        reviewerName: reviewerName.trim() || undefined,
      });
      if (updated) setProfile(updated);
      setReviewComment("");
      setReviewerName("");
      setWriteReviewOpen(false);
      toast.success("Teammate review posted dynamically to database!");
    } catch (err) {
      toast.error(err.message || "Failed to post review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddMatch = async () => {
    if (!matchVenue.trim()) {
      toast.error("Please enter the match venue / turf name.");
      return;
    }
    try {
      setIsSubmittingMatch(true);
      const updated = await profileService.addMatch(currentUser, {
        venue: matchVenue.trim(),
        sport: matchSport,
        matchDate,
        result: matchResult,
        score: matchScore.trim(),
      });
      if (updated) setProfile(updated);
      setMatchVenue("");
      setLogMatchOpen(false);
      toast.success("Match log saved dynamically to database!");
    } catch (err) {
      toast.error(err.message || "Failed to save match log");
    } finally {
      setIsSubmittingMatch(false);
    }
  };

  const getShareLink = () => {
    if (!profile?.activeBooking) return window.location.href;
    const booking = profile.activeBooking;
    const code = booking.booking_code || booking.id;
    return `${window.location.origin}/payment/split/${code}`;
  };

  const handleDirectCopyLink = () => {
    const link = getShareLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Match squad link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenShare = () => {
    handleDirectCopyLink();
    setShareOpen(true);
  };

  const handleShareWhatsApp = () => {
    const booking = profile?.activeBooking;
    if (!booking) return;
    const link = getShareLink();
    const text = `🏆 *SportX Match Invite* 🏆\n\nHey squad! Join our match at *${booking.turf_name}*!\n📅 Date: ${formatDate(booking.date)}\n⏰ Slot: ${booking.time_slot || booking.slot_time}\n⚽ Sport: ${booking.sport || "Match"}\n\n👉 Join squad lobby & split bill:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareTelegram = () => {
    const booking = profile?.activeBooking;
    if (!booking) return;
    const link = getShareLink();
    const text = `🏆 SportX Match Invite: Join our match at ${booking.turf_name} on ${formatDate(booking.date)} (${booking.time_slot || booking.slot_time})!`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleNativeShare = async () => {
    const booking = profile?.activeBooking;
    if (!booking) return;
    const link = getShareLink();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SportX Match - ${booking.turf_name}`,
          text: `Join our match at ${booking.turf_name} on ${formatDate(booking.date)}!`,
          url: link,
        });
      } catch {
        // Dismissed
      }
    } else {
      handleDirectCopyLink();
    }
  };

  const downloadPdfPass = async (booking, userObj) => {
    const loadingToast = toast.loading("Generating your digital entry pass PDF...");
    try {
      const orderCode = booking?.booking_code || booking?.id || "SX-PASS";
      await downloadSportXPassPdf({
        orderId: orderCode,
        userName: userObj?.fullName || booking?.user_name || "SportX Player",
        turfName: booking?.turf_name || "SportX Arena",
        sport: booking?.sport || "Cricket",
        date: formatDate(booking?.date) || String(booking?.date || "2026-09-25"),
        timeSlot: booking?.time_slot || booking?.slot_time || "Scheduled Slot",
        amount: booking?.amount || 0,
      }, `SportX_EntryPass_${orderCode}.pdf`);

      toast.success("Entry pass PDF downloaded successfully!", { id: loadingToast });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF pass. Please try again.", { id: loadingToast });
    }
  };

  if (!currentUser || (!currentUser.id && !currentUser.email)) {
    return (
      <Container className="py-24 text-center max-w-md mx-auto space-y-4">
        <EmptyState>Please sign in to view your player account.</EmptyState>
        <Link to="/login">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6">
            Log In / Sign Up
          </Button>
        </Link>
      </Container>
    );
  }

  if (loading) {
    return <Container className="py-16 text-center"><EmptyState>Loading your account data...</EmptyState></Container>;
  }

  if (error) {
    return <Container className="py-16 text-center space-y-4"><EmptyState>{error}</EmptyState><Button onClick={refreshProfile}>Retry</Button></Container>;
  }

  const displayName = user?.fullName || "";
  const xp = Number(user?.xp || 0);
  const level = Math.floor(xp / 1000) + 1;
  const xpToNextLevel = Math.max((level * 1000) - xp, 0);

  // Dynamic Data from Backend
  const matchHistory = profile?.matchHistory || [];
  const products = profile?.shopItems || [];
  const reviews = profile?.reviews || [];
  const activeBooking = profile?.activeBooking;

  // Available categories for Pro Shop Merchandise from dynamic backend products
  const availableShopCategories = [
    "ALL",
    ...Array.from(new Set(products.map((p) => String(p.category || "").toUpperCase()).filter(Boolean))),
  ];

  const filteredShopItems = shopCategory === "ALL"
    ? products
    : products.filter((p) => String(p.category || "").toUpperCase() === shopCategory);

  // Combine products with match add-ons for the Add-ons modal
  const combinedAddons = [
    ...(profile?.addons || []),
    ...DEFAULT_MATCH_ADDONS.filter((item) => !(profile?.addons || []).some((p) => p.name === item.name)),
  ];

  const filteredAddons = addonCategory === "ALL"
    ? combinedAddons
    : combinedAddons.filter((item) => String(item.category || "").toUpperCase() === addonCategory);

  const qrImageUrl = activeBooking
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=SPORTXCLUB-PASS-${encodeURIComponent(activeBooking.booking_code || activeBooking.id)}&margin=10`
    : "";

  return (
    <Container className="px-0 sm:px-6 py-2 sm:py-6 space-y-6 sm:space-y-8 max-w-4xl w-full">
      {/* Transaction History Modal */}
      <Dialog open={txHistoryOpen} onOpenChange={setTxHistoryOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" /> Wallet Transactions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {profile?.transactions?.length ? profile.transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center bg-card p-3.5 border border-border/60 rounded-2xl">
                <div>
                  <p className="font-semibold text-xs">{tx.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatDateTime(tx.createdAt)} · {tx.type}</p>
                </div>
                <div className="text-right">
                  <span className={tx.isCredit ? "text-emerald-500 font-bold" : "font-bold"}>{tx.isCredit ? "+" : "-"}₹{tx.amount}</span>
                  <span className="block text-[9px] text-emerald-500 uppercase">{tx.status}</span>
                </div>
              </div>
            )) : <EmptyState>No transactions recorded for this account.</EmptyState>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Top Up Wallet Modal */}
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" /> Top Up SportX Wallet
            </DialogTitle>
            <DialogDescription>
              Add funds directly to your wallet for instant 1-click slot booking and match day add-ons.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              type="number"
              min="1"
              value={topUpAmount}
              onChange={(event) => setTopUpAmount(event.target.value)}
              placeholder="Enter amount (e.g. ₹500)"
              className="text-base font-semibold"
            />
            <div className="flex gap-2">
              {[200, 500, 1000, 2000].map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => setTopUpAmount(String(amt))}
                >
                  +₹{amt}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopUpOpen(false)}>Cancel</Button>
            <Button onClick={handleTopUp} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              Confirm Top Up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 1. ENTRY PASS MODAL */}
      <Dialog open={entryPassOpen} onOpenChange={setEntryPassOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md p-0 overflow-hidden">
          <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">SportX Official Entry Pass</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                VALID ENTRY
              </Badge>
            </div>
            <h3 className="text-lg font-black mt-2 text-white">{activeBooking?.turf_name || "Match Center"}</h3>
            <p className="text-xs text-slate-400">Pass Code: #{activeBooking?.booking_code || activeBooking?.id}</p>
          </div>

          <div className="p-6 space-y-5 text-center">
            {/* QR Code Container */}
            <div className="inline-block p-4 bg-white rounded-3xl shadow-inner border border-slate-200">
              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="Entry Pass QR Code"
                  className="w-44 h-44 object-contain mx-auto rounded-xl"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-slate-100 rounded-xl">
                  <QrCode className="w-16 h-16 text-slate-400" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Scan this QR code at the turf entry reception counter
            </p>

            {/* Pass Metadata Grid */}
            <div className="bg-muted/40 rounded-2xl p-4 text-left border border-border/60 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Sport</span>
                <span className="font-bold text-foreground capitalize">{activeBooking?.sport || "Match"}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Pass Holder</span>
                <span className="font-bold text-foreground truncate block">{displayName || activeBooking?.user_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Match Date</span>
                <span className="font-bold text-foreground">{formatDate(activeBooking?.date)}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Time Slot</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block leading-tight">
                  {parseBookingSlots(activeBooking?.time_slot || activeBooking?.slot_time).rangeText || activeBooking?.time_slot || activeBooking?.slot_time}
                </span>
                {parseBookingSlots(activeBooking?.time_slot || activeBooking?.slot_time).slotCount > 1 && (
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    ({parseBookingSlots(activeBooking?.time_slot || activeBooking?.slot_time).slotCount} Slots: {parseBookingSlots(activeBooking?.time_slot || activeBooking?.slot_time).slotList.join(", ")})
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button
                variant="outline"
                className="flex-1 text-xs gap-1.5 h-10 rounded-xl"
                onClick={() => {
                  setEntryPassOpen(false);
                  handleOpenShare();
                }}
              >
                <Share2 className="h-4 w-4" /> Share Pass
              </Button>
              <Button
                className="flex-1 text-xs gap-1.5 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={() => downloadPdfPass(activeBooking, user)}
              >
                <Download className="h-4 w-4" /> Download PDF Pass
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. MATCH DAY ADD-ONS MODAL */}
      <Dialog open={addonsOpen} onOpenChange={setAddonsOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-lg max-h-[85vh] overflow-y-auto p-5 sm:p-6">
          <DialogHeader className="pr-12 text-left">
            <div className="flex items-center justify-between gap-3 mr-2">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-black">
                <Coffee className="h-5 w-5 text-amber-500" /> Match Day Add-ons
              </DialogTitle>
              <Badge variant="outline" className="text-xs font-bold text-emerald-600 border-emerald-500/30 bg-emerald-500/5 shrink-0 px-2 py-0.5">
                Wallet: ₹{profile?.walletBalance || 0}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Hydration, gear, and recovery items delivered ready at your match slot.
            </DialogDescription>
          </DialogHeader>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto py-1 border-b border-border/50">
            {["ALL", "HYDRATION", "GEAR", "NUTRITION"].map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant="outline"
                className={`text-xs h-7 px-3 rounded-md cursor-pointer transition-all duration-200 border ${
                  addonCategory === cat
                    ? "border-primary text-primary font-semibold bg-transparent shadow-none"
                    : "border-border/80 text-muted-foreground hover:border-primary hover:text-primary bg-transparent"
                }`}
                onClick={() => setAddonCategory(cat)}
              >
                {toTitleCase(cat)}
              </Button>
            ))}
          </div>

          {/* Addons List */}
          <div className="space-y-3 py-2">
            {filteredAddons.length ? filteredAddons.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 p-3 bg-card hover:border-border transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image || item.image_url || "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80"}
                    alt={item.name}
                    className="h-14 w-14 rounded-xl object-cover border border-border/50 shrink-0"
                  />
                  <div className="space-y-0.5 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold leading-tight truncate">{item.name}</p>
                      {item.badge && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-amber-500/40 text-amber-600">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</p>
                    )}
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">₹{item.price}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={selectedProductId === item.id}
                  onClick={() => handlePurchase(item, `${item.name} reserved for your match!`)}
                  className="rounded-xl text-xs h-8 px-3.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 cursor-pointer shadow-xs active:scale-95"
                >
                  {selectedProductId === item.id ? "Adding..." : "+ Add"}
                </Button>
              </div>
            )) : (
              <EmptyState>No items available under this category.</EmptyState>
            )}
          </div>

          <DialogFooter className="border-t border-border/40 pt-3 flex flex-row items-center justify-between">
            <span className="text-xs text-muted-foreground">Items billed directly to SportX Wallet</span>
            <Button variant="outline" size="sm" onClick={() => setAddonsOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. SHARE MATCH & SQUAD LOBBY MODAL */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-emerald-600" /> Share Match & Squad Lobby
            </DialogTitle>
            <DialogDescription>
              Invite your teammates or split payments for this match slot.
            </DialogDescription>
          </DialogHeader>

          {/* Match Summary Preview Card */}
          {activeBooking && (
            <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/60 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                  {activeBooking.sport || "Multi-sport"}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">#{activeBooking.booking_code || activeBooking.id}</span>
              </div>
              <p className="text-sm font-bold text-foreground">{activeBooking.turf_name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{formatDate(activeBooking.date)}</span>
                <span>·</span>
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{activeBooking.time_slot || activeBooking.slot_time}</span>
              </div>
            </div>
          )}

          {/* Share Link Copy Input */}
          <div className="space-y-2 py-2">
            <p className="text-xs font-semibold text-muted-foreground text-left">Squad Invite & Split Link:</p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={getShareLink()}
                className="text-xs font-mono bg-muted/30 select-all"
              />
              <Button
                type="button"
                onClick={handleDirectCopyLink}
                className={`text-xs shrink-0 font-bold gap-1 transition-all ${
                  copiedLink ? "bg-emerald-600 text-white" : ""
                }`}
              >
                {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedLink ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Quick Social Share Buttons */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-muted-foreground text-left">Quick Share:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleShareWhatsApp}
                className="h-10 text-xs font-bold gap-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-500/30"
              >
                <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleShareTelegram}
                className="h-10 text-xs font-bold gap-2 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 border-sky-500/30"
              >
                <Send className="h-4 w-4 text-sky-600" /> Telegram
              </Button>
            </div>
            {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleNativeShare}
                className="w-full text-xs font-bold gap-2 mt-1"
              >
                <Share2 className="h-4 w-4" /> Share via other apps...
              </Button>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareOpen(false)} className="w-full text-xs">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. CANCEL SLOT MODAL */}
      {/* 4. CANCEL BOOKING MODAL */}
      <Dialog open={cancelOpen} onOpenChange={(open) => { if (!isCancelling) setCancelOpen(open); }}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl shadow-2xl">
          {/* Fixed Header */}
          <DialogHeader className="p-5 sm:p-6 pb-3 border-b border-border/50 shrink-0 text-left">
            <DialogTitle className="flex items-center gap-2.5 text-rose-600 dark:text-rose-500 font-black text-lg">
              <div className="h-9 w-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <Ban className="h-5 w-5 stroke-[2.5]" />
              </div>
              <span>Cancel Slot Booking</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Select your reason and choose whether you prefer a direct Bank/UPI refund or instant wallet credit.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
            {/* Refund Guarantee Badge */}
            {activeBooking && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-left space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{activeBooking.turf_name}</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    Refund: ₹{activeBooking.amount || 0}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                  <span>{formatDate(activeBooking.date)}</span>
                  <span>·</span>
                  <span>{activeBooking.time_slot || activeBooking.slot_time}</span>
                </div>
              </div>
            )}

            {/* Cancellation Reason Picker */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-foreground block">
                Reason for cancellation <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {CANCELLATION_REASONS.map((reason) => (
                  <label
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === reason
                        ? "border-rose-500/60 bg-rose-500/5 font-semibold text-foreground"
                        : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[11px] text-muted-foreground">Additional notes (optional):</label>
                <Input
                  type="text"
                  placeholder="e.g. Need to reschedule for weekend..."
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* Refund Destination Selection */}
            <div className="space-y-2 text-left pt-1">
              <label className="text-xs font-bold text-foreground block">
                Where would you like your refund? <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                <label
                  onClick={() => setRefundDestination("source")}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    refundDestination === "source"
                      ? "border-emerald-500/80 bg-emerald-500/10 text-foreground font-medium shadow-xs"
                      : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="refundDest"
                    checked={refundDestination === "source"}
                    onChange={() => setRefundDestination("source")}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <div>
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      Original Payment Source (Bank / UPI / Card)
                      <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0 h-4">Direct</Badge>
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Refunded directly to your Google Pay, PhonePe, or Bank Account within 24h to 5 working days.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setRefundDestination("wallet")}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    refundDestination === "wallet"
                      ? "border-emerald-500/80 bg-emerald-500/10 text-foreground font-medium shadow-xs"
                      : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <input
                    type="radio"
                    name="refundDest"
                    checked={refundDestination === "wallet"}
                    onChange={() => setRefundDestination("wallet")}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <div>
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      SportX Wallet Credit
                      <Badge className="bg-blue-600 text-white text-[9px] px-1.5 py-0 h-4">Instant</Badge>
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Instant 100% credit to your wallet balance. Rebook any turf right away.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Pinned Footer */}
          <DialogFooter className="p-4 sm:p-5 pt-3 border-t border-border/50 bg-muted/20 shrink-0 flex flex-row items-center justify-end gap-2">
            <Button
              variant="outline"
              disabled={isCancelling}
              onClick={() => setCancelOpen(false)}
              className="text-xs rounded-xl h-10 px-4"
            >
              Keep Slot
            </Button>
            <Button
              variant="destructive"
              disabled={isCancelling}
              onClick={handleCancelBooking}
              className="bg-rose-600 hover:bg-rose-700 font-bold text-white text-xs rounded-xl h-10 px-5 cursor-pointer shadow-md shadow-rose-600/20"
            >
              {isCancelling ? "Processing Refund..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. LOG MATCH MODAL (DYNAMIC RECORDING) */}
      <Dialog open={logMatchOpen} onOpenChange={setLogMatchOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-emerald-600" /> Log Match Activity
            </DialogTitle>
            <DialogDescription>
              Record your match scores, sport played, and performance to your player logs in the database.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 py-2 text-left">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Turf / Venue Name</label>
              <Input
                type="text"
                placeholder="e.g. Green Turf Arena"
                value={matchVenue}
                onChange={(e) => setMatchVenue(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Sport</label>
                <select
                  value={matchSport}
                  onChange={(e) => setMatchSport(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {sportsOptions.map((s) => (
                    <option key={s} value={getSportName(s)}>{getSportName(s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Match Date</label>
                <Input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Result</label>
                <select
                  value={matchResult}
                  onChange={(e) => setMatchResult(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                  <option value="Draw">Draw</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Match Score</label>
                <Input
                  type="text"
                  placeholder="e.g. 5 - 3 or 145/4"
                  value={matchScore}
                  onChange={(e) => setMatchScore(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogMatchOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddMatch}
              disabled={isSubmittingMatch}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isSubmittingMatch ? "Saving..." : "Save Match Log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. WRITE TEAMMATE REVIEW MODAL (DYNAMIC SUBMISSION) */}
      <Dialog open={writeReviewOpen} onOpenChange={setWriteReviewOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-emerald-600" /> Post Teammate Review
            </DialogTitle>
            <DialogDescription>
              Leave feedback, ratings, and praise for teamwork and match performance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5 py-2 text-left">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Reviewer Name (Optional)</label>
              <Input
                type="text"
                placeholder="Enter your name (optional)"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Rating (1 to 5 Stars)</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= reviewRating
                          ? "text-amber-400 fill-amber-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">Feedback & Praise</label>
              <textarea
                rows={3}
                placeholder="Great teamwork, high stamina, and excellent match coordination..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWriteReviewOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAddReview}
              disabled={isSubmittingReview}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {isSubmittingReview ? "Posting..." : "Post Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permanently Delete Account Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 font-black">
              <Trash2 className="h-5 w-5" /> Permanently Delete Account
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
              Are you sure you want to delete your SportXClub player account?
              <br /><br />
              <strong className="text-rose-500 font-bold">Important Notice:</strong> This action will permanently remove your athlete profile, match stats, wallet balance, active bookings, and reviews from our MySQL database. <strong>This cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-xs text-muted-foreground font-medium">
              Please type <strong className="text-foreground font-mono font-bold">DELETE</strong> to confirm:
            </p>
            <Input
              type="text"
              placeholder="Type DELETE"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="text-xs font-mono uppercase tracking-wider"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeleteConfirmText(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText.trim().toUpperCase() !== "DELETE" || isDeleting}
              onClick={handleDeleteAccount}
              className="bg-rose-600 hover:bg-rose-700 font-bold text-white cursor-pointer"
            >
              {isDeleting ? "Deleting from Database..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Header Card */}
      <Card className="rounded-none sm:rounded-2xl border-x-0 sm:border-x border-border/50 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start justify-between">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <Avatar className="h-24 w-24 border border-primary/15 bg-background">
                {isValidProfileImage(user?.profilePicture || user?.avatar) && (
                  <AvatarImage src={user?.profilePicture || user?.avatar} className="object-cover" />
                )}
                <AvatarFallback className="bg-primary/10 text-2xl text-primary font-black">{getInitials(displayName)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.24em] text-primary font-bold">Athlete Profile</p>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">{displayName}</h1>
                <p className="text-sm text-muted-foreground">{getHandle(user)}</p>
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-xs font-semibold">
                  <MapPin className="h-4 w-4 text-primary" />
                  {user?.city || ""}{user?.joinedDate ? ` · Active since ${formatDate(user.joinedDate)}` : ""}
                </div>
                <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-1.5">
                  {(user?.selectedSports || []).map((sport) => (
                    <Badge key={sport} variant="outline" className="text-[10px] rounded-full">
                      {getSportName(sport)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-background/50 border border-border/60 rounded-2xl p-4 w-full md:w-80 space-y-3 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-emerald-600" /> LEVEL {level}
                </span>
                <span className="text-emerald-600 font-mono font-bold">{xp} XP</span>
              </div>
              <Progress value={xp % 1000 / 10} className="h-2 bg-muted" indicatorColor="bg-emerald-600" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>LVL {level}</span>
                <span>{xpToNextLevel ? `${xpToNextLevel} XP to next level` : "Level ready"}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t border-border/40 pt-4">
            <Link to="/edit-profile">
              <Button size="sm" variant="outline" className="text-xs rounded-xl gap-1 cursor-pointer">
                <Edit className="h-3.5 w-3.5" /> Edit Profile
              </Button>
            </Link>
            <Button size="sm" variant="destructive" className="text-xs rounded-xl gap-1 cursor-pointer" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" /> Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-card to-card/95 border-y sm:border border-border shadow-sm rounded-none sm:rounded-[24px] p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600/10 p-3.5 rounded-2xl border border-emerald-600/20 text-emerald-600">
            <Wallet className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">SportX Wallet Balance</p>
            <h2 className="text-3xl font-extrabold">₹{profile?.walletBalance || 0}</h2>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="rounded-2xl h-12" onClick={() => setTxHistoryOpen(true)}>
            <History className="h-4 w-4 mr-2" /> Transaction History
          </Button>
          <Button className="rounded-2xl h-12 bg-transparent text-emerald-600 border border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30" onClick={() => setTopUpOpen(true)}>
            + Top Up Wallet
          </Button>
        </div>
      </div>

      {/* Achievements */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 px-3 sm:px-0">
        {achievements.map(({ title, icon: Icon }) => (
          <div key={title} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card p-4 shadow-sm text-left">
            <div className="flex h-12 w-12 items-center justify-center">
              <Icon className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="font-bold text-sm">{title}</p>
          </div>
        ))}
      </div>

      <hr className="border-border/60" />

      {/* ACTIVE MATCH CENTER */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-left flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> Active Match Center
        </h2>
        {activeBooking ? (
          <div className="bg-card border border-border shadow-md rounded-[24px] overflow-hidden flex flex-col md:flex-row text-left">
            {/* Turf Card Left Preview */}
            <div className="relative w-full md:w-1/3 min-h-[200px] p-3">
              <div className="relative w-full h-full rounded-2xl overflow-hidden min-h-[180px]">
                <img
                  src={activeBooking.turf_image || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"}
                  alt={activeBooking.turf_name}
                  className="w-full h-full object-cover absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 z-10 space-y-1">
                  <Badge className="bg-emerald-600 text-black font-bold text-[9px] rounded-full">
                    {activeBooking.sport || "Sports booking"}
                  </Badge>
                  <h3 className="text-base font-black text-white">{activeBooking.turf_name}</h3>
                  <p className="text-emerald-400 font-mono font-bold text-xs">
                    {formatDate(activeBooking.date)} · {activeBooking.time_slot || activeBooking.slot_time}
                  </p>
                </div>
              </div>
            </div>

            {/* Match Center Right Content */}
            <div className="w-full md:w-2/3 p-6 flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-600/10 p-2.5 rounded-full text-emerald-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{activeBooking.sport || "Sports"} booking</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Booking ID: {activeBooking.booking_code || activeBooking.id}
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black text-xs uppercase">
                  {activeBooking.status || "CONFIRMED"}
                </Badge>
              </div>

              {/* 4 Interactive Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* 1. ENTRY PASS */}
                <div
                  onClick={() => setEntryPassOpen(true)}
                  className="rounded-2xl border border-border bg-card p-3 h-32 flex flex-col justify-between cursor-pointer hover:border-emerald-500/60 hover:bg-emerald-500/5 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <QrCode className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className="text-[9px] text-emerald-600 border-emerald-500/30">Active</Badge>
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Entry Pass</span>
                    <span className="text-[10px] text-muted-foreground">Digital QR Ticket</span>
                  </div>
                </div>

                {/* 2. ADD-ONS */}
                <div
                  onClick={() => setAddonsOpen(true)}
                  className="rounded-2xl border border-border bg-card p-3 h-32 flex flex-col justify-between cursor-pointer hover:border-amber-500/60 hover:bg-amber-500/5 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <Coffee className="h-5 w-5 text-amber-500 group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className="text-[9px] text-amber-600 border-amber-500/30">Store</Badge>
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Add-ons</span>
                    <span className="text-[10px] text-muted-foreground">Drinks & Gear</span>
                  </div>
                </div>

                {/* 3. COPY LINK */}
                <div
                  onClick={handleOpenShare}
                  className="rounded-2xl border border-border bg-card p-3 h-32 flex flex-col justify-between cursor-pointer hover:border-primary/60 hover:bg-primary/5 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <Share2 className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className="text-[9px] text-primary border-primary/30">Invite</Badge>
                  </div>
                  <div>
                    <span className="text-xs font-bold block">{copiedLink ? "Copied!" : "Copy Link"}</span>
                    <span className="text-[10px] text-muted-foreground">Share Squad Lobby</span>
                  </div>
                </div>

                {/* 4. CANCEL SLOT */}
                <div
                  onClick={() => setCancelOpen(true)}
                  className="rounded-2xl border border-border bg-card p-3 h-32 flex flex-col justify-between cursor-pointer hover:border-rose-500/60 hover:bg-rose-500/5 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <Ban className="h-5 w-5 text-rose-500 group-hover:scale-110 transition-transform" />
                    <Badge variant="outline" className="text-[9px] text-rose-600 border-rose-500/30">Refund</Badge>
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-rose-600 dark:text-rose-400">Cancel Slot</span>
                    <span className="text-[10px] text-muted-foreground">Instant Refund</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState>No active bookings are linked to this account.</EmptyState>
        )}
      </div>

      <hr className="border-border/60" />

      {/* PRO SHOP MERCHANDISE (DYNAMIC FROM DATABASE) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Pro Shop Merchandise
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Official sports gear, balls, and apparel directly fetched from MySQL database.
            </p>
          </div>
          {/* Category Filter */}
          {availableShopCategories.length > 1 && (
            <div className="flex gap-1.5 overflow-x-auto py-1">
              {availableShopCategories.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant="outline"
                  className={`text-xs h-7 px-3 rounded-md cursor-pointer transition-all duration-200 border ${
                    shopCategory === cat
                      ? "border-primary text-primary font-semibold bg-transparent shadow-none"
                      : "border-border/80 text-muted-foreground hover:border-primary hover:text-primary bg-transparent"
                  }`}
                  onClick={() => setShopCategory(cat)}
                >
                  {toTitleCase(cat)}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 text-left">
          {filteredShopItems.length ? filteredShopItems.map((item) => (
            <div
              key={item.id}
              className="border border-border/80 bg-card rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all group"
            >
              <div className="h-36 w-full bg-muted rounded-xl overflow-hidden relative">
                <img
                  src={item.image || item.image_url}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.badge && (
                  <Badge className="absolute top-2 left-2 bg-black/75 text-white text-[9px] font-bold border-none backdrop-blur-sm">
                    {item.badge}
                  </Badge>
                )}
                {item.category && (
                  <Badge variant="outline" className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-[9px] capitalize">
                    {toTitleCase(item.category)}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-sm line-clamp-1">{item.name}</h5>
                  {item.rating && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {item.rating}
                    </span>
                  )}
                </div>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{item.price}</p>
              </div>
              <Button
                size="sm"
                className="w-full font-bold cursor-pointer rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={selectedProductId === item.id}
                onClick={() => {
                  handlePurchase(item, `Purchased ${item.name || item.title}! Billed to SportX Wallet.`);
                }}
              >
                {selectedProductId === item.id ? "Processing..." : "Purchase Item"}
              </Button>
            </div>
          )) : (
            <div className="sm:col-span-2 lg:col-span-4">
              <EmptyState>No merchandise found under this category.</EmptyState>
            </div>
          )}
        </div>
      </div>

      <hr className="border-border/60" />

      {/* MATCH LOGS & HISTORY (DYNAMIC FROM DATABASE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-left">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> Match Logs & History
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live athlete match statistics, venues, and match scores saved in database.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs rounded-xl font-bold gap-1 cursor-pointer shrink-0"
            onClick={() => setLogMatchOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 text-primary" /> Log Match
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matchHistory.length ? matchHistory.map((match) => {
            const isWon = String(match.result || "").toLowerCase() === "won";
            const isLost = String(match.result || "").toLowerCase() === "lost";
            return (
              <div
                key={match.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border bg-card/60 shadow-sm text-left gap-4 hover:border-primary/30 transition-all ${
                  isWon
                    ? "border-l-4 border-l-emerald-600"
                    : isLost
                    ? "border-l-4 border-l-rose-500"
                    : "border-l-4 border-l-primary"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center font-bold text-xs bg-primary/10 text-primary border">
                    {String(match.sport || "SP").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm">{match.venue}</h4>
                      <Badge variant="outline" className="text-[9px]">{match.sport}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(match.matchDate)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Match Score</p>
                    <p className="font-mono text-sm font-extrabold">{match.score || "—"}</p>
                  </div>
                  <Badge
                    className={
                      isWon
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : isLost
                        ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        : "bg-primary/10 text-primary border border-primary/20"
                    }
                  >
                    {match.result || "Recorded"}
                  </Badge>
                </div>
              </div>
            );
          }) : (
            <div className="md:col-span-2">
              <EmptyState>No match history stored yet. Click &quot;Log Match&quot; to add one!</EmptyState>
            </div>
          )}
        </div>
      </div>

      <hr className="border-border/60" />

      {/* TEAMMATE REVIEWS & RATINGS (DYNAMIC FROM DATABASE) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-left">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" /> Teammate Reviews & Ratings
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Authentic teammate ratings, sportsmanship reviews, and skill endorsements.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs rounded-xl font-bold gap-1 cursor-pointer shrink-0"
            onClick={() => setWriteReviewOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 text-primary" /> Write Review
          </Button>
        </div>

        <Card className="border-border/50 bg-card">
          <CardContent className="space-y-4 p-6">
            {reviews.length ? reviews.map((review) => (
              <div key={review.id} className="border-b border-border/50 pb-4 last:border-0 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {getInitials(review.reviewer)}
                    </div>
                    <p className="font-bold text-sm text-foreground">{review.reviewer}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${
                          index < Number(review.rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
                <p className="text-[10px] text-muted-foreground/60">{formatDateTime(review.createdAt)}</p>
              </div>
            )) : (
              <EmptyState>No teammate reviews stored yet. Click &quot;Write Review&quot; to post the first one!</EmptyState>
            )}
          </CardContent>
        </Card>
      </div>

      <hr className="border-border/60" />

      {/* Danger Zone: Permanently Delete Account */}
      <div className="rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 p-5 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <Trash2 className="w-4 h-4" /> Danger Zone: Delete Account
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Permanently removes your athlete profile, match stats, wallet balance, active bookings, and reviews from our database.
          </p>
        </div>
        <Button
          type="button"
          variant="destructive"
          onClick={() => setDeleteOpen(true)}
          className="text-xs h-9 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold shrink-0 cursor-pointer shadow-sm"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Account
        </Button>
      </div>
    </Container>
  );
}



