import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Star,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  MessageSquarePlus,
  Filter,
  RefreshCw,
  Loader2,
  Send,
  User,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";
import { cn } from "../../components/ui/utils";

export function ReviewsManagementView({ turfs = [], onTurfsUpdated }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [turfFilter, setTurfFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalRatingHover, setModalRatingHover] = useState(0);

  const [reviewForm, setReviewForm] = useState({
    user_name: "",
    turf_name: "",
    rating: 5,
    comment: "",
    status: "Approved",
    date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
  });

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/turf/reviews");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setReviews(json.data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Failed loading reviews:", err);
      toast.error("Failed loading reviews list");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Derived Metrics
  const metrics = useMemo(() => {
    const total = reviews.length;
    const approved = reviews.filter((r) => (r.status || "Approved") === "Approved").length;
    const pending = reviews.filter((r) => r.status === "Pending").length;
    const hidden = reviews.filter((r) => r.status === "Hidden").length;
    const avg = total > 0
      ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / total).toFixed(1)
      : "0.0";
    return { total, approved, pending, hidden, avg };
  }, [reviews]);

  // Filtered List
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (r.user_name && r.user_name.toLowerCase().includes(q)) ||
        (r.turf_name && r.turf_name.toLowerCase().includes(q)) ||
        (r.comment && r.comment.toLowerCase().includes(q));

      const matchTurf =
        turfFilter === "all" ||
        String(r.turf_name || "").toLowerCase() === turfFilter.toLowerCase();

      const matchRating =
        ratingFilter === "all" ||
        Math.round(Number(r.rating)) === Number(ratingFilter);

      const matchStatus =
        statusFilter === "all" ||
        (r.status || "Approved").toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchTurf && matchRating && matchStatus;
    });
  }, [reviews, searchQuery, turfFilter, ratingFilter, statusFilter]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingReview(null);
    setReviewForm({
      user_name: "",
      turf_name: turfs[0]?.name || "",
      rating: 5,
      comment: "",
      status: "Approved",
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    });
    setModalRatingHover(0);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (rev) => {
    setEditingReview(rev);
    setReviewForm({
      user_name: rev.user_name || "",
      turf_name: rev.turf_name || turfs[0]?.name || "",
      rating: Number(rev.rating) || 5,
      comment: rev.comment || "",
      status: rev.status || "Approved",
      date: rev.date || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    });
    setModalRatingHover(0);
    setIsModalOpen(true);
  };

  // Save (Create or Update) Review
  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.user_name.trim()) {
      toast.error("Please enter the athlete's name.");
      return;
    }
    if (!reviewForm.turf_name.trim()) {
      toast.error("Please select or enter the venue name.");
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error("Please enter the review comment.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingReview) {
        const res = await fetch(`/api/turf/reviews/${editingReview.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewForm),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Review updated successfully!");
        } else {
          toast.error(data.error || "Failed updating review");
        }
      } else {
        const res = await fetch("/api/turf/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewForm),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("New review added successfully!");
        } else {
          toast.error(data.error || "Failed adding review");
        }
      }

      setIsModalOpen(false);
      setEditingReview(null);
      await loadReviews();
      if (onTurfsUpdated) onTurfsUpdated();
    } catch (err) {
      console.error("Save Review Error:", err);
      toast.error("An error occurred while saving the review");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Review
  const handleDeleteReview = async (rev) => {
    if (!window.confirm(`Are you sure you want to permanently delete the review by "${rev.user_name}" for "${rev.turf_name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/turf/reviews/${rev.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Review deleted successfully!");
        await loadReviews();
        if (onTurfsUpdated) onTurfsUpdated();
      } else {
        toast.error(data.error || "Failed deleting review");
      }
    } catch (err) {
      console.error("Delete Review Error:", err);
      toast.error("Failed deleting review");
    }
  };

  // Quick Toggle Status
  const handleToggleStatus = async (rev) => {
    const nextStatus = rev.status === "Approved" ? "Hidden" : "Approved";
    try {
      const res = await fetch(`/api/turf/reviews/${rev.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Review status changed to "${nextStatus}"`);
        setReviews((prev) =>
          prev.map((r) => (r.id === rev.id ? { ...r, status: nextStatus } : r))
        );
      } else {
        toast.error(data.error || "Failed updating status");
      }
    } catch (err) {
      console.error("Toggle Status Error:", err);
      toast.error("Failed toggling status");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600">
              COMMUNITY FEEDBACK & REVIEWS
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#0f172a] mt-1 flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-400" />
            Turf Reviews & Ratings Manager
          </h2>
          <p className="text-xs text-[#64748b] mt-0.5">
            Monitor, add, edit, approve, and delete athlete reviews for all sports venues. Reviews dynamically update turf ratings across the platform.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            onClick={loadReviews}
            variant="outline"
            className="h-10 border-[#cbd5e1] text-[#334155] font-bold text-xs rounded-xl hover:border-[#0f172a] cursor-pointer"
            title="Reload Reviews List"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", isLoading && "animate-spin")} />
            Refresh
          </Button>

          <Button
            onClick={handleOpenAdd}
            className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Review
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider">Total Platform Reviews</div>
            <div className="text-2xl font-black text-[#0f172a]">{metrics.total}</div>
            <div className="text-[10px] font-bold text-[#64748b] mt-0.5">Across all registered turfs</div>
          </div>
        </Card>

        <Card className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider">Approved Reviews</div>
            <div className="text-2xl font-black text-emerald-600">{metrics.approved}</div>
            <div className="text-[10px] font-bold text-[#64748b] mt-0.5">Visible to all players</div>
          </div>
        </Card>

        <Card className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider">Average Platform Rating</div>
            <div className="text-2xl font-black text-blue-600">{metrics.avg} ⭐</div>
            <div className="text-[10px] font-bold text-[#64748b] mt-0.5">Overall player satisfaction</div>
          </div>
        </Card>

        <Card className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xs p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-[#94a3b8] uppercase tracking-wider">Pending / Hidden</div>
            <div className="text-2xl font-black text-slate-700">{metrics.pending + metrics.hidden}</div>
            <div className="text-[10px] font-bold text-[#64748b] mt-0.5">Requires review / unlisted</div>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-3" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by player name, venue name, or comment text..."
              className="pl-10 h-10 bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a] rounded-xl font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Turf Filter */}
            <select
              value={turfFilter}
              onChange={(e) => setTurfFilter(e.target.value)}
              className="h-10 px-3 bg-[#f8fafc] border border-[#cbd5e1] text-xs font-bold text-[#0f172a] rounded-xl outline-none cursor-pointer"
            >
              <option value="all">All Turfs ({reviews.length})</option>
              {turfs.map((t) => (
                <option key={t.id} value={t.name}>
                  📍 {t.name}
                </option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="h-10 px-3 bg-[#f8fafc] border border-[#cbd5e1] text-xs font-bold text-[#0f172a] rounded-xl outline-none cursor-pointer"
            >
              <option value="all">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
              <option value="2">⭐⭐ 2 Stars</option>
              <option value="1">⭐ 1 Star</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-[#f8fafc] border border-[#cbd5e1] text-xs font-bold text-[#0f172a] rounded-xl outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Hidden">Hidden</option>
            </select>

            {(searchQuery || turfFilter !== "all" || ratingFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setTurfFilter("all");
                  setRatingFilter("all");
                  setStatusFilter("all");
                }}
                className="h-10 text-xs font-bold text-[#64748b] hover:text-[#0f172a] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Reviews Table / Cards Container */}
      <Card className="bg-white border border-[#e2e8f0] rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-[#f1f5f9] flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#0f172a] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Turf Reviews Records ({filteredReviews.length} shown)
            </h3>
            <p className="text-xs text-[#64748b] mt-0.5">
              Live reviews currently stored in MySQL database table <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px] font-bold">reviews</code>
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#64748b]">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs font-bold">Loading live reviews from database...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-20 px-6 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 text-[#64748b] flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="font-black text-base text-[#0f172a]">No Reviews Found</h4>
            <p className="text-xs text-[#64748b] max-w-sm mx-auto">
              {reviews.length === 0
                ? "There are currently no reviews in the database. When players write reviews on the venue pages, they will appear here."
                : "No reviews matched your current search filters. Try resetting the filters or add a new review below."}
            </p>
            <Button
              onClick={handleOpenAdd}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Review Manually
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#f1f5f9]">
            {filteredReviews.map((rev) => {
              const ratingNum = Number(rev.rating) || 5;
              const isApproved = (rev.status || "Approved") === "Approved";
              const isPending = rev.status === "Pending";

              return (
                <div
                  key={rev.id}
                  className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Author, Turf, Rating & Comment */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Avatar initial */}
                      <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-black text-xs uppercase shrink-0">
                        {rev.user_name?.[0] || "P"}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#0f172a]">
                            {rev.user_name || "Anonymous Player"}
                          </span>

                          <Badge
                            variant="outline"
                            className="text-[10px] font-bold bg-slate-100 text-slate-700 border-slate-200"
                          >
                            <MapPin className="w-2.5 h-2.5 mr-1 text-emerald-600" />
                            {rev.turf_name || "General Venue"}
                          </Badge>

                          <Badge
                            className={`text-[10px] font-black uppercase tracking-wider ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : isPending
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {rev.status || "Approved"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= ratingNum
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300"
                                }`}
                              />
                            ))}
                            <span className="text-xs font-black text-amber-500 ml-1">
                              {ratingNum.toFixed(1)}
                            </span>
                          </div>

                          <span className="text-[11px] text-[#94a3b8]">•</span>

                          <span className="text-[11px] text-[#64748b]">
                            {rev.date || "Recently"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Comment */}
                    <p className="text-xs text-[#334155] leading-relaxed pl-10 font-medium">
                      "{rev.comment}"
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center justify-end gap-2 shrink-0 pl-10 lg:pl-0">
                    {/* Toggle Status Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(rev)}
                      className={`h-8 px-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        isApproved
                          ? "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      }`}
                      title={isApproved ? "Hide review from public view" : "Approve review for public display"}
                    >
                      {isApproved ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Approve
                        </>
                      )}
                    </Button>

                    {/* Edit Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(rev)}
                      className="h-8 px-2.5 text-xs font-bold text-[#0f172a] border-[#cbd5e1] hover:border-[#0f172a] rounded-xl cursor-pointer"
                      title="Edit Review Details"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      Edit
                    </Button>

                    {/* Delete Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteReview(rev)}
                      className="h-8 w-8 p-0 text-red-600 border-[#fecaca] hover:bg-red-50 rounded-xl cursor-pointer"
                      title="Permanently Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add / Edit Review Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white border-[#e2e8f0] text-[#0f172a] rounded-3xl max-w-lg shadow-2xl">
          <DialogHeader className="border-b border-[#f1f5f9] pb-4">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Star className="w-5 h-5 fill-amber-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">
                SPORTX TURF REVIEW MANAGEMENT
              </span>
            </div>
            <DialogTitle className="text-lg font-black text-[#0f172a]">
              {editingReview ? "Edit Turf Review" : "Create New Turf Review"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748b]">
              {editingReview
                ? "Update review content, rating, or status. The turf's average rating will re-sync automatically."
                : "Add a review record to MySQL database. This review will immediately calculate into the turf's overall score."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveReview} className="space-y-4 pt-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-extrabold text-[#334155]">Athlete / Player Name *</Label>
                <Input
                  required
                  value={reviewForm.user_name}
                  onChange={(e) => setReviewForm({ ...reviewForm, user_name: e.target.value })}
                  placeholder="e.g. Sahil Athlete"
                  className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a] font-semibold h-10 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-extrabold text-[#334155]">Venue / Turf Name *</Label>
                {turfs.length > 0 ? (
                  <select
                    value={reviewForm.turf_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, turf_name: e.target.value })}
                    className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] h-10 rounded-xl px-3 outline-none cursor-pointer"
                  >
                    {turfs.map((t) => (
                      <option key={t.id} value={t.name}>
                        📍 {t.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    required
                    value={reviewForm.turf_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, turf_name: e.target.value })}
                    placeholder="e.g. Elite Turf Arena"
                    className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a] font-semibold h-10 rounded-xl"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Star Rating Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-extrabold text-[#334155]">Rating Score</Label>
                <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-[#cbd5e1] px-3 h-10 rounded-xl">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (modalRatingHover || reviewForm.rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setModalRatingHover(star)}
                        onMouseLeave={() => setModalRatingHover(0)}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className="p-0.5 transition-transform hover:scale-125 cursor-pointer"
                        title={`${star} Star${star > 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            active ? "fill-amber-400 text-amber-400" : "text-slate-300"
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-black text-amber-500 ml-auto">
                    {(modalRatingHover || reviewForm.rating).toFixed(1)} / 5.0
                  </span>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-extrabold text-[#334155]">Display Status</Label>
                <select
                  value={reviewForm.status}
                  onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-[#cbd5e1] text-xs font-semibold text-[#0f172a] h-10 rounded-xl px-3 outline-none cursor-pointer"
                >
                  <option value="Approved">Approved (Public)</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Hidden">Hidden (Unlisted)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-extrabold text-[#334155]">Review Date</Label>
              <Input
                value={reviewForm.date}
                onChange={(e) => setReviewForm({ ...reviewForm, date: e.target.value })}
                placeholder="e.g. 17 Sept 2026 or Just now"
                className="bg-[#f8fafc] border-[#cbd5e1] text-xs text-[#0f172a] font-semibold h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-extrabold text-[#334155]">Review Comment *</Label>
                <div className="flex gap-1">
                  {["Clean synthetic turf", "Super lighting", "Smooth booking"].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setReviewForm((prev) => ({ ...prev, comment: prev.comment ? `${prev.comment} • ${chip}` : chip }))}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors"
                    >
                      +{chip}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                required
                rows={3}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Write player feedback or review comment here..."
                className="w-full p-3 bg-[#f8fafc] border border-[#cbd5e1] text-xs text-[#0f172a] rounded-xl font-medium outline-none resize-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-[#f1f5f9] flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-10 text-xs font-bold border-[#cbd5e1] text-[#334155] rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
                {editingReview ? "Save Changes" : "Create Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
