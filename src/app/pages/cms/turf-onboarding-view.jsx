import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Building2, User, Phone, Mail, MapPin,
  CalendarDays, CheckCircle2, XCircle, FileText,
  CreditCard, Search, Eye, AlertTriangle, Shield, Hash,
  Trash2, Loader2, Sparkles, RefreshCw, Image as ImageIcon, Star,
  Clock, Layers
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { turfService } from "../../services/turf.service";
import { adminApi } from "../../services/admin-api";

const CACHE_KEY = "sportx_onboarding_cache";

function formatSubmissionDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function TurfOnboardingView() {
  const [requests, setRequests] = useState(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem(CACHE_KEY);
    } catch (e) {
      return true;
    }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("Pending");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const data = await adminApi.getAll("onboarding");
      const list = Array.isArray(data) ? data : [];
      setRequests(list);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
      } catch (e) { }
    } catch (e) {
      console.error("Onboarding load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = requests.filter(r => (r.status || "").toLowerCase() === "pending").length;
  const approvedCount = requests.filter(r => ["approved", "active"].includes((r.status || "").toLowerCase())).length;
  const rejectedCount = requests.filter(r => (r.status || "").toLowerCase() === "rejected").length;
  const totalCount = requests.length;

  const filteredRequests = requests.filter(req => {
    if (statusFilter === "Pending" && req.status?.toLowerCase() !== "pending") return false;
    if (statusFilter === "Approved" && !["approved", "active"].includes(req.status?.toLowerCase())) return false;
    if (statusFilter === "Rejected" && req.status?.toLowerCase() !== "rejected") return false;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const turfName = (req.business?.businessName || req.turf?.name || "").toLowerCase();
    const ownerName = (req.business?.ownerName || req.personal?.fullName || "").toLowerCase();
    const city = (req.location?.city || "").toLowerCase();
    const email = (req.ownerEmail || req.business?.email || req.personal?.email || "").toLowerCase();
    const ownerId = (req.ownerId || "").toLowerCase();

    return turfName.includes(term) || ownerName.includes(term) || city.includes(term) || email.includes(term) || ownerId.includes(term);
  });

  const handleReview = (req) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const handleDelete = async (req) => {
    if (!req?.id) return;
    const turfTitle = req.business?.businessName || req.turf?.name || "this turf onboarding request";
    if (!window.confirm(`Are you sure you want to permanently delete "${turfTitle}"? This will remove the onboarding application and any associated turf listing.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await adminApi.delete("onboarding", req.id);
      const updated = requests.filter(r => r.id !== req.id);
      setRequests(updated);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch (e) { }
      toast.success("Turf onboarding request and venue deleted successfully.");
      if (selectedRequest?.id === req.id) {
        setIsModalOpen(false);
        setSelectedRequest(null);
      }
    } catch (e) {
      console.error("Delete Error:", e);
      toast.error(e.message || "An error occurred while deleting the request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccept = async (req) => {
    if (!window.confirm("Are you sure you want to approve and list this turf?")) return;

    setIsProcessing(true);
    try {
      const turfName = req.business?.businessName || req.turf?.name || "Premier Sports Turf";
      const fullLocation = [req.location?.address, req.location?.city].filter(Boolean).join(", ") || req.location?.city || "Pune";
      const sportsList = Array.isArray(req.turf?.sports) && req.turf.sports.length > 0 ? req.turf.sports : ["Football", "Cricket"];
      const sportType = sportsList[0] || "Football";
      const price = parseInt(req.pricing?.weekdayPrice) || 1200;
      const ownerName = req.business?.ownerName || req.personal?.fullName || "Turf Owner";
      const ownerEmail = req.ownerEmail || req.business?.email || req.personal?.email || "";
      const ownerPhone = req.business?.phone || req.personal?.phone || "";

      // Robustly extract all uploaded photos (cover + gallery)
      const rawCover = req.images?.cover;
      const rawCoverUrl = typeof rawCover === 'string' ? rawCover : (rawCover?.data || rawCover?.url || null);

      const rawGallery = Array.isArray(req.images?.gallery)
        ? req.images.gallery
        : (Array.isArray(req.images?.turf) ? req.images.turf : []);

      const galleryList = rawGallery
        .map(g => (typeof g === 'string' ? g : (g?.data || g?.url || null)))
        .filter(Boolean);

      const coverImage = rawCoverUrl || (galleryList.length > 0 ? galleryList[0] : null) || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800";

      const finalGallery = galleryList.length > 0
        ? (galleryList.includes(coverImage) ? galleryList : [coverImage, ...galleryList])
        : [coverImage];

      const mappedData = {
        name: turfName,
        location: fullLocation,
        sport_type: sportType,
        price_per_hour: price,
        weekend_price: req.pricing?.weekendPrice ? Number(req.pricing.weekendPrice) : Math.round(price * 1.2),
        opening_time: req.pricing?.openingTime || req.pricing?.openTime || "06:00 AM",
        closing_time: req.pricing?.closingTime || req.pricing?.closeTime || "11:00 PM",
        slot_duration: parseInt(req.pricing?.slotDuration) || 60,
        peak_start_time: req.pricing?.peakStartTime || "05:00 PM",
        peak_end_time: req.pricing?.peakEndTime || "11:00 PM",
        peak_price: req.pricing?.peakPrice ? Number(req.pricing.peakPrice) : null,
        operational_days: Array.isArray(req.pricing?.operationalDays)
          ? JSON.stringify(req.pricing.operationalDays)
          : (req.pricing?.operationalDays || "Mon,Tue,Wed,Thu,Fri,Sat,Sun"),
        rating: "5.0",
        reviews: 0,
        status: "Active",
        owner_name: ownerName,
        owner_email: ownerEmail,
        owner_phone: ownerPhone,
        image_url: coverImage,
        gallery: JSON.stringify(finalGallery),
        description: req.turf?.description || req.business?.description || "High quality sports turf with FIFA certified artificial grass, floodlights, and professional amenities.",
        amenities: JSON.stringify(req.location?.facilities || req.turf?.facilities || req.facilities || ["Parking Space", "Clean Washrooms", "Drinking Water", "LED Floodlights"]),
        rules: req.turf?.rules || req.rules || "Please wear appropriate footwear. Respect all turf property.",
      };

      await turfService.create("admin", mappedData);
      await adminApi.update("onboarding", req.id, { status: "approved" });

      const newRequests = requests.map(r => r.id === req.id ? { ...r, status: "Approved" } : r);
      setRequests(newRequests);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(newRequests));
      } catch (e) { }

      toast.success("Turf onboarding request approved and listed successfully!");
      setIsModalOpen(false);
      setSelectedRequest(null);
    } catch (err) {
      toast.error(err.message || "Failed to approve request");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (req) => {
    if (!window.confirm("Are you sure you want to reject this turf onboarding request?")) return;

    try {
      await adminApi.update("onboarding", req.id, { status: "rejected" });

      const newRequests = requests.map(r => r.id === req.id ? { ...r, status: "Rejected" } : r);
      setRequests(newRequests);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(newRequests));
      } catch (e) { }

      toast.success("Request has been rejected and removed.");
      setIsModalOpen(false);
      setSelectedRequest(null);
    } catch (e) {
      toast.error(e.message || "Error rejecting request");
    }
  };

  const handleViewDocument = (e, doc) => {
    e.preventDefault();
    if (!doc?.data) return;

    const w = window.open("");
    if (!w) {
      alert("Please allow pop-ups to view documents.");
      return;
    }

    if (doc.data.startsWith('data:image')) {
      w.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>${doc.name || 'Document View'}</title></head>
          <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background-color:#1e293b;">
            <img src="${doc.data}" style="max-width:100%; max-height:100vh; object-fit:contain;" />
          </body>
        </html>
      `);
      w.document.close();
    } else if (doc.data.startsWith('data:application/pdf')) {
      w.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>${doc.name || 'Document View'}</title></head>
          <body style="margin:0;">
            <iframe src="${doc.data}" style="border:none; width:100%; height:100vh;"></iframe>
          </body>
        </html>
      `);
      w.document.close();
    } else {
      w.document.write(`
        <!DOCTYPE html>
        <html>
          <head><title>Unsupported format</title></head>
          <body><p>Unsupported document format.</p></body>
        </html>
      `);
      w.document.close();
    }
  };

  const renderDocumentStatus = (doc) => {
    if (!doc || (Object.keys(doc).length === 0 && doc.constructor === Object)) {
      return <span className="text-xs font-medium text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Missing</span>;
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-900 group-hover:text-emerald-600 transition-colors bg-emerald-50 px-2 py-1 rounded-md">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Uploaded ({doc.name || "File"})
        </div>
        {doc.data && (
          <button onClick={(e) => handleViewDocument(e, doc)} className="p-1 hover:bg-slate-100 rounded-md transition-colors" title="View Document">
            <Eye className="w-4 h-4 text-slate-500" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pt-0 w-full min-w-0">
      {/* 1. Senior Developer Redesigned Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3.5 border-b border-[#e2e8f0] w-full min-w-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Onboarding Pipeline
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              • Total {totalCount} Requests
            </span>
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a]">
              Turf Onboarding Requests
            </h2>
            <button
              type="button"
              onClick={() => loadRequests(true)}
              className="h-8 w-8 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-black hover:bg-slate-50 transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 group"
              title="Refresh requests"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-600 group-hover:text-slate-900 transition-transform duration-300 group-hover:rotate-180 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          <p className="text-xs text-[#64748b]">
            Review, verify, and approve new sports turf venue registration requests submitted by owners.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:max-w-xs shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search turfs, owners, cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 h-10 rounded-xl bg-white border border-slate-200 hover:border-slate-400 focus-visible:ring-emerald-500 text-xs transition-all shadow-2xs font-medium w-full"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Senior Developer Redesigned Segmented Filter Toolbar */}
      <Tabs defaultValue="Pending" value={statusFilter} onValueChange={setStatusFilter} className="w-full min-w-0">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap w-full min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-transparent overflow-x-auto max-w-full pb-1 no-scrollbar flex-wrap">
            <button
              type="button"
              onClick={() => setStatusFilter("Pending")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === "Pending"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-900 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:scale-105 active:scale-95 duration-200"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${statusFilter === "Pending" ? "text-amber-500" : "text-slate-400"}`} />
              <span>Pending</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                statusFilter === "Pending"
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {pendingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("Approved")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === "Approved"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-900 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:scale-105 active:scale-95 duration-200"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${statusFilter === "Approved" ? "text-emerald-600" : "text-slate-400"}`} />
              <span>Approved</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                statusFilter === "Approved"
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {approvedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("Rejected")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === "Rejected"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-900 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:scale-105 active:scale-95 duration-200"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <XCircle className={`w-3.5 h-3.5 ${statusFilter === "Rejected" ? "text-rose-500" : "text-slate-400"}`} />
              <span>Rejected</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                statusFilter === "Rejected"
                  ? "bg-rose-100 text-rose-900 border border-rose-300"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {rejectedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("All")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                statusFilter === "All"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-900 hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:scale-105 active:scale-95 duration-200"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${statusFilter === "All" ? "text-slate-800" : "text-slate-400"}`} />
              <span>All</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                statusFilter === "All"
                  ? "bg-slate-200 text-slate-900 border border-slate-300"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {totalCount}
              </span>
            </button>
          </div>

          <div className="text-xs font-medium text-slate-500 hidden md:flex items-center gap-1.5">
            <span>Showing:</span>
            <span className="font-extrabold text-[#0f172a]">
              {statusFilter === "Pending"
                ? `${pendingCount} Pending Verifications`
                : statusFilter === "Approved"
                  ? `${approvedCount} Active Approved Turfs`
                  : statusFilter === "Rejected"
                    ? `${rejectedCount} Rejected Requests`
                    : `${totalCount} Total Submissions`}
            </span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && requests.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full min-w-0">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-slate-200 bg-white rounded-2xl p-4 space-y-4 animate-pulse shadow-xs">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
                  </div>
                  <div className="h-5 bg-slate-100 rounded-full w-16"></div>
                </div>
                <div className="space-y-2.5 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-8 bg-slate-100 rounded-lg"></div>
                    <div className="h-8 bg-slate-100 rounded-lg"></div>
                  </div>
                  <div className="h-8 bg-slate-100 rounded-lg"></div>
                  <div className="h-8 bg-slate-100 rounded-lg"></div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className="h-3 bg-slate-100 rounded w-24"></div>
                  <div className="h-8 bg-slate-200 rounded-lg w-28"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          /* Empty state for active filter */
          <div className="bg-white border border-slate-200 hover:border-emerald-600 rounded-2xl p-6 sm:p-10 text-center shadow-xs flex flex-col items-center transition-all duration-300 w-full min-w-0">
            <div className="h-14 w-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
              <Shield className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-[#0f172a]">
              {statusFilter === "Pending" && "No Pending Onboarding Requests"}
              {statusFilter === "Approved" && "No Approved Turf Requests"}
              {statusFilter === "Rejected" && "No Rejected Turf Requests"}
              {statusFilter === "All" && "No Turf Onboarding Requests Found"}
            </h3>
            <p className="text-xs text-[#64748b] mt-1 max-w-md">
              {statusFilter === "Pending" && approvedCount > 0
                ? `There are currently 0 pending requests. You have ${approvedCount} approved turf listing${approvedCount > 1 ? 's' : ''} on record.`
                : "New turf owner applications submitted through the registration portal will appear here."}
            </p>
            {statusFilter === "Pending" && approvedCount > 0 && (
              <Button
                onClick={() => setStatusFilter("Approved")}
                className="mt-4 rounded-xl border border-slate-900 bg-white hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:scale-105 active:scale-95 duration-200 text-[#0f172a] font-bold text-xs h-9 px-4 cursor-pointer transition-all shadow-xs"
              >
                View Approved Turfs ({approvedCount})
              </Button>
            )}
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full min-w-0">
            {filteredRequests.map(req => {
              const turfDisplayName = req.business?.businessName || req.turf?.name || "Premier Sports Arena";
              const ownerDisplayName = req.business?.ownerName || req.personal?.fullName || "Turf Owner";
              const locationDisplay = req.location?.city || "Mumbai";
              const stateDisplay = req.location?.state ? `, ${req.location.state}` : "";
              const phoneDisplay = req.business?.phone || req.personal?.phone || "+91 9876543210";
              const emailDisplay = req.ownerEmail || req.business?.email || req.personal?.email || "owner@sportxclub.com";
              const ownerIdDisplay = req.ownerId || `OWN-${String(req.id || 1).padStart(4, "0")}`;
              const isApproved = req.status?.toLowerCase() === 'approved' || req.status?.toLowerCase() === 'active';
              const isRejected = req.status?.toLowerCase() === 'rejected';

              return (
                <Card key={req.id} className="border border-slate-200 hover:border-emerald-600 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden bg-white group">
                  <CardHeader className="bg-gradient-to-r from-emerald-50/60 to-transparent p-3.5 pb-2.5 border-b border-[#f1f5f9]">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base font-bold text-[#0f172a] truncate group-hover:text-emerald-700 transition-colors">
                          {turfDisplayName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 mt-1 text-xs font-medium text-[#475569] truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-900 group-hover:text-emerald-600 transition-colors shrink-0" />
                          <span>{locationDisplay}{stateDisplay}</span>
                        </CardDescription>
                      </div>
                      <Badge className={`border-0 rounded-full px-2.5 py-0.5 font-bold text-[10px] whitespace-nowrap shrink-0 shadow-2xs ${isApproved
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : isRejected
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}>
                        {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3.5 pt-2.5 pb-3">
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Owner Name</span>
                          <p className="text-xs font-bold text-[#1e293b] truncate flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{ownerDisplayName}</span>
                          </p>
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Contact</span>
                          <p className="text-xs font-bold text-[#1e293b] truncate flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{phoneDisplay}</span>
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Email (Registration)</span>
                          <p className="text-xs font-semibold text-[#1e293b] truncate flex items-center gap-1.5 bg-slate-50/50 px-2.5 py-1 rounded-lg border border-slate-100">
                            <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="truncate">{emailDisplay}</span>
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">Turf Owner ID</span>
                          <p className="text-xs font-bold text-emerald-700 truncate flex items-center gap-1.5 font-mono bg-emerald-50/50 px-2.5 py-1 rounded-lg border border-emerald-100/60">
                            <Hash className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>#{String(ownerIdDisplay).replace(/^#+/, "")}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-[#f1f5f9]">
                        <span className="text-[11px] text-[#64748b] flex items-center gap-1.5 font-medium">
                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                          Submitted: {formatSubmissionDate(req.createdAt)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(req);
                            }}
                            variant="outline"
                            title="Delete Request & Turf"
                            className="border border-red-600 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-700 hover:scale-105 active:scale-95 rounded-lg h-8 w-8 p-0 cursor-pointer transition-all duration-200 shadow-2xs flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </Button>
                          <Button
                            onClick={() => handleReview(req)}
                            className="border border-slate-900 bg-white hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 hover:scale-105 active:scale-95 duration-200 text-[#0f172a] rounded-lg h-8 px-3 text-[11px] font-bold cursor-pointer transition-all shadow-xs group flex items-center"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-900 group-hover:text-emerald-600 transition-colors group-hover:text-emerald-700 shrink-0" />
                            <span>Review Profile</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Tabs>

      {/* Request Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[32px] gap-0">
          {selectedRequest && (
            <>
              <div className="bg-gradient-to-r from-emerald-50 to-white px-8 py-6 border-b border-[#e2e8f0] flex items-start justify-between shrink-0">
                <div>
                  <DialogTitle className="text-2xl font-black text-[#0f172a] flex items-center gap-2">
                    {selectedRequest.business?.businessName || selectedRequest.turf?.name || "Premier Sports Arena"}
                    <Badge className={`border-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${selectedRequest.status?.toLowerCase() === 'approved' || selectedRequest.status?.toLowerCase() === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedRequest.status?.toLowerCase() === 'rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                      {selectedRequest.status?.toLowerCase() === 'approved' || selectedRequest.status?.toLowerCase() === 'active' ? 'Approved' : selectedRequest.status || 'Pending'}
                    </Badge>
                  </DialogTitle>
                  <p className="text-sm font-medium text-[#64748b] mt-1.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-900 group-hover:text-emerald-600 transition-colors" />
                    {selectedRequest.location?.address || selectedRequest.location?.city || "Mumbai"}, {selectedRequest.location?.state || "Maharashtra"}
                  </p>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-8 bg-[#f8fafc]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Business & Owner Info */}
                    <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#0f172a] mb-4 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        Business & Owner
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Business / Turf Name:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.business?.businessName || selectedRequest.turf?.name || "-"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Owner Name:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.business?.ownerName || selectedRequest.personal?.fullName || "-"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Phone:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.business?.phone || selectedRequest.personal?.phone || "-"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Email:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.ownerEmail || selectedRequest.business?.email || selectedRequest.personal?.email || "-"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Owner ID:</span>
                          <span className="font-mono font-bold text-emerald-700 text-right">#{String(selectedRequest.ownerId || `OWN-${String(selectedRequest.id || 1).padStart(4, "0")}`).replace(/^#+/, "")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">GST:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.business?.gst || "Not Provided"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Turf Details */}
                    <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#0f172a] mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        Turf Specifics
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Sports:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.turf?.sports?.join(", ") || "Football, Cricket"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Grounds:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.turf?.groundCount || "2 Grounds"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Size:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.turf?.groundSize || "Standard 7v7"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Surface:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.turf?.surfaceType || "Artificial Grass"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#0f172a] mb-4 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        Pricing & Timings
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Timings:</span>
                          <span className="font-bold text-[#0f172a] text-right">{selectedRequest.pricing?.openingTime || "06:00 AM"} - {selectedRequest.pricing?.closingTime || "11:00 PM"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Weekday Price:</span>
                          <span className="font-bold text-[#0f172a] text-right">₹{selectedRequest.pricing?.weekdayPrice || 1200}/hr</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-[#64748b] font-medium">Weekend Price:</span>
                          <span className="font-bold text-[#0f172a] text-right">₹{selectedRequest.pricing?.weekendPrice || 1500}/hr</span>
                        </div>
                      </div>
                    </div>

                    {/* Uploaded Turf Photos & Gallery */}
                    <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#0f172a] mb-4 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-500" />
                        Uploaded Turf Photos & Gallery
                      </h3>
                      {(() => {
                        const rawCover = selectedRequest.images?.cover;
                        const coverUrl = typeof rawCover === "string" ? rawCover : (rawCover?.data || rawCover?.url || null);
                        const rawGal = Array.isArray(selectedRequest.images?.gallery)
                          ? selectedRequest.images.gallery
                          : (Array.isArray(selectedRequest.images?.turf) ? selectedRequest.images.turf : []);
                        const galList = rawGal
                          .map((g) => (typeof g === "string" ? g : (g?.data || g?.url || null)))
                          .filter(Boolean);

                        const allImages = [];
                        if (coverUrl) allImages.push({ url: coverUrl, isCover: true });
                        galList.forEach((img, i) => {
                          if (img !== coverUrl) {
                            allImages.push({ url: img, isCover: false, index: i + 1 });
                          }
                        });

                        if (allImages.length === 0) {
                          return (
                            <p className="text-xs text-muted-foreground italic">No turf photos uploaded during registration.</p>
                          );
                        }

                        return (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {allImages.map((item, idx) => (
                              <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 shadow-2xs">
                                <img src={item.url} alt={`Turf Photo ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute top-1.5 left-1.5 z-10">
                                  {item.isCover ? (
                                    <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                                      <Star className="w-2.5 h-2.5 fill-white" /> Cover
                                    </span>
                                  ) : (
                                    <span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      #{idx + 1}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Right Column (Documents) */}
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs h-full">
                      <h3 className="text-sm font-black uppercase tracking-wider text-[#0f172a] mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        Verification Documents
                      </h3>
                      <div className="space-y-3.5">
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                          <span className="text-sm font-bold text-[#334155]">Aadhaar Front</span>
                          {renderDocumentStatus(selectedRequest.identity?.aadhaarFront)}
                        </div>
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                          <span className="text-sm font-bold text-[#334155]">Aadhaar Back</span>
                          {renderDocumentStatus(selectedRequest.identity?.aadhaarBack)}
                        </div>
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                          <span className="text-sm font-bold text-[#334155]">PAN Card</span>
                          {renderDocumentStatus(selectedRequest.identity?.panCard)}
                        </div>
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                          <span className="text-sm font-bold text-[#334155]">Electric Bill</span>
                          {renderDocumentStatus(selectedRequest.identity?.electricBill)}
                        </div>
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                          <span className="text-sm font-bold text-[#334155]">Trade License</span>
                          {renderDocumentStatus(selectedRequest.business?.tradeLicense)}
                        </div>
                        <div className="p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex justify-between items-center">
                          <span className="text-sm font-bold text-[#334155]">Cancelled Cheque</span>
                          {renderDocumentStatus(selectedRequest.bank?.cancelledCheque)}
                        </div>
                      </div>

                      <div className="mt-6 bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 font-medium leading-relaxed">
                          Please verify all documents match the provided business and personal details before approving this turf.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-5 border-t border-[#e2e8f0] bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={() => handleDelete(selectedRequest)}
                  disabled={isProcessing}
                  className="rounded-xl font-bold h-11 px-5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Request
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl font-bold h-11 px-6 border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9] cursor-pointer"
                  >
                    {selectedRequest.status?.toLowerCase() === 'pending' ? 'Cancel' : 'Close'}
                  </Button>
                  {selectedRequest.status?.toLowerCase() === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleReject(selectedRequest)}
                        disabled={isProcessing}
                        variant="outline"
                        className="rounded-xl font-bold h-11 px-6 border-2 border-rose-600 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-700 hover:border-rose-700 cursor-pointer bg-transparent transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2 text-rose-600" />
                        <span>Reject Request</span>
                      </Button>
                      <Button
                        onClick={() => handleAccept(selectedRequest)}
                        disabled={isProcessing}
                        variant="outline"
                        className="rounded-xl font-bold h-11 px-6 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-700 hover:border-emerald-700 cursor-pointer bg-transparent shadow-xs transition-colors"
                      >
                        {isProcessing ? "Processing..." : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                            <span>Approve & List Turf</span>
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

