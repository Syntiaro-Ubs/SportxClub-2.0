import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useAuth } from "../../providers/auth-provider";
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Loader2, AlertCircle, Star, MessageSquare, MapPin, Search, Filter, ThumbsUp, Quote, Sparkles, Info } from "lucide-react";
import { reviewService } from "../../services/review.service";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../components/ui/utils";

export function ReviewsList() {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopicFilter, setSelectedTopicFilter] = useState("all");
  const [selectedSort, setSelectedSort] = useState("relevant");
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [ownerReplies, setOwnerReplies] = useState({});

  const handleSendReply = (reviewId) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }
    setOwnerReplies((prev) => ({ ...prev, [reviewId]: replyText.trim() }));
    setReplyingId(null);
    setReplyText("");
    toast.success("Reply posted successfully!");
  };

  const handleDeleteReply = (reviewId) => {
    setOwnerReplies((prev) => {
      const updated = { ...prev };
      delete updated[reviewId];
      return updated;
    });
    toast.info("Reply removed");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const ownerId = currentUser?.id || "guest";
        const result = await reviewService.getAll(ownerId);

        // Update mock dates to look recent
        const modifiedResult = result.map((r, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (i * 2 + 1));
          return {
            ...r,
            date: format(d, "MMM dd, yyyy"),
          };
        });

        setData(modifiedResult);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (!data.length) return { average: "0.0", total: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
    const average = (sum / data.length).toFixed(1);

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.forEach((r) => {
      const star = Math.floor(r.rating);
      if (counts[star] !== undefined) counts[star]++;
    });

    return { average, total: data.length, ...counts };
  }, [data]);

  const topics = useMemo(() => {
    const counts = {};
    data.forEach((r) => {
      const topic = r.turfName || "Other";
      counts[topic] = (counts[topic] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([key, count]) => ({ key, label: key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Take top 5 topics
  }, [data]);

  // Filtered reviews logic
  const filteredReviews = useMemo(() => {
    let result = data.filter((review) => {
      const matchesSearch =
        review.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.turfName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTopic =
        selectedTopicFilter === "all" ||
        review.turfName === selectedTopicFilter ||
        (!review.turfName && selectedTopicFilter === "Other");

      return matchesSearch && matchesTopic;
    });

    if (selectedSort === "newest") {
      result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (selectedSort === "highest") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (selectedSort === "lowest") {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [data, searchQuery, selectedTopicFilter, selectedSort]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= rating
              ? 'fill-amber-400 text-amber-400 stroke-none'
              : 'fill-muted/30 text-muted/30 stroke-none'
              }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-destructive space-y-4">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg font-bold">{error}</p>
        <Button variant="outline" className="border-2 border-emerald-500 text-black dark:text-white" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            Customer Reviews
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-white border border-emerald-500/20 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg">
              {stats.total} Feedback
            </Badge>
          </h1>
        </div>
      </div>

      {/* Summary and Topic Filters Grid */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 pb-6 pt-3 mb-6 w-full max-w-5xl">
        {/* SportXclub Review Summary */}
        <div className="w-full lg:w-1/2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-medium text-foreground">SportXclub review summary</h2>
            <Info className="w-5 h-5 text-muted-foreground/60 cursor-pointer" />
          </div>

          <div className="flex items-start gap-8 sm:gap-12">
            {/* Progress Bars (Left) */}
            <div className="flex-1 flex flex-col gap-1.5">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats[rating] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                const barColorClass =
                  rating >= 4
                    ? "bg-emerald-500"
                    : rating === 3
                      ? "bg-amber-400"
                      : "bg-rose-500";
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-[13px] font-medium text-foreground w-2 text-right">{rating}</span>
                    <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Rating (Right) */}
            <div className="flex flex-col items-center justify-start min-w-[100px] mt-[-8px]">
              <span className="text-[54px] font-light text-foreground leading-[1] tracking-tight">{stats.average}</span>
              <div className="flex items-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const ratingVal = Number(stats.average) || 0;
                  const fillPercent = Math.max(0, Math.min(100, (ratingVal - (starIndex - 1)) * 100));
                  return (
                    <div key={starIndex} className="relative inline-block w-4 h-4 shrink-0">
                      {/* Empty background star */}
                      <Star className="w-4 h-4 fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700 absolute top-0 left-0" />
                      {/* Partial filled yellow star */}
                      {fillPercent > 0 && (
                        <div
                          className="absolute top-0 left-0 overflow-hidden h-4"
                          style={{ width: `${fillPercent}%` }}
                        >
                          <Star className="w-4 h-4 fill-[#fbbc04] text-[#fbbc04] shrink-0 min-w-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="text-[13px] text-muted-foreground mt-1">({stats.total})</span>
            </div>
          </div>
        </div>

        {/* Topic Filters */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start pt-1">
          <h2 className="text-xl font-medium text-foreground mb-5">Reviews</h2>
          <div className="flex flex-wrap items-center gap-2 px-1 py-1">
            <button
              onClick={() => setSelectedTopicFilter("all")}
              className={cn(
                "px-4 py-1.5 rounded-full text-[13px] transition-all duration-200 cursor-pointer whitespace-nowrap outline-none",
                selectedTopicFilter === "all"
                  ? "border border-transparent text-emerald-600 dark:text-white font-bold scale-105 bg-transparent"
                  : "border border-border/60 bg-transparent text-muted-foreground hover:scale-105 hover:text-emerald-600 dark:hover:text-white hover:border-transparent"
              )}
            >
              All
            </button>
            {topics.map((topic) => (
              <button
                key={topic.key}
                onClick={() => setSelectedTopicFilter(topic.key)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[13px] transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-1.5 outline-none",
                  selectedTopicFilter === topic.key
                    ? "border border-transparent text-emerald-600 dark:text-white font-bold scale-105 bg-transparent"
                    : "border border-border/60 bg-transparent text-muted-foreground hover:scale-105 hover:text-emerald-600 dark:hover:text-white hover:border-transparent"
                )}
              >
                <span>{topic.label}</span>
                <span className={selectedTopicFilter === topic.key ? "text-emerald-600/80 dark:text-white/80" : "text-muted-foreground"}>
                  {topic.count}
                </span>
              </button>
            ))}
            {topics.length > 5 && (
              <div className="px-4 py-1.5 rounded-full text-[13px] border border-border/60 bg-transparent text-foreground whitespace-nowrap">
                +{data.length - topics.reduce((acc, curr) => acc + curr.count, 0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sort Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none mb-4">
        {[
          { key: "relevant", label: "Most relevant" },
          { key: "newest", label: "Newest" },
          { key: "highest", label: "Highest" },
          { key: "lowest", label: "Lowest" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedSort(tab.key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[13px] transition-all duration-200 cursor-pointer whitespace-nowrap outline-none",
              selectedSort === tab.key
                ? "border border-transparent text-emerald-600 dark:text-white font-bold scale-105 bg-transparent"
                : "border border-border/60 bg-transparent text-muted-foreground hover:scale-105 hover:text-emerald-600 dark:hover:text-white hover:border-transparent"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reviews Grid Section */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center justify-center rounded-2xl border border-border/40 bg-background/50 text-muted-foreground">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3 text-emerald-500 border border-emerald-500/20">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">No matching reviews found</h3>
          <p className="text-xs mt-1 max-w-xs text-muted-foreground">Try adjusting your search query or filter tab to view customer feedback.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="p-4 rounded-2xl border border-border/40 bg-background hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-3 group"
              >
                <div>
                  {/* Top Header: Customer Info & Rating */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9 border-2 border-emerald-500/30 bg-emerald-500/10">
                        <AvatarFallback className="bg-transparent text-emerald-600 dark:text-white font-extrabold text-xs">
                          {getInitials(review.customerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-foreground tracking-tight group-hover:text-emerald-600 dark:group-hover:text-white transition-colors">
                            {review.customerName}
                          </p>
                          <Badge variant="outline" className="text-[8.5px] font-extrabold text-emerald-600 dark:text-white bg-emerald-500/10 border-emerald-500/20 uppercase px-1.5 py-0.2 rounded-md shrink-0">
                            Verified Player
                          </Badge>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                          {review.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-0.5">
                      {renderStars(review.rating)}
                      <span className="text-[10px] font-black text-amber-500">{review.rating}.0</span>
                    </div>
                  </div>

                  {/* Comment Body */}
                  <div className="relative pl-3 border-l-2 border-emerald-500/40 py-0.5">
                    <p className="text-xs text-foreground/90 font-medium leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </div>
                </div>

                {/* Footer Tag: Turf Location & Reply Action */}
                <div className="pt-2.5 border-t border-border/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-white font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 truncate">
                    <MapPin className="w-3.5 h-3.5 stroke-[2.5] shrink-0 text-emerald-600 dark:text-white" />
                    <span className="truncate">{review.turfName}</span>
                  </div>

                  {!ownerReplies[review.id] && !review.ownerReply && replyingId !== review.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyingId(review.id);
                        setReplyText("");
                      }}
                      className="h-7 px-2.5 rounded-lg text-xs font-extrabold text-emerald-600 dark:text-white border border-emerald-500/40 bg-transparent hover:bg-emerald-500/10 gap-1 cursor-pointer transition-all shadow-none shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-white" />
                      Reply
                    </Button>
                  )}
                </div>

                {/* Inline Owner Reply Form */}
                {replyingId === review.id && (
                  <div className="mt-2 pt-2 border-t border-border/40 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-white text-[11px]">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-white" /> Write Owner Reply
                      </span>
                      <button
                        type="button"
                        onClick={() => setReplyingId(null)}
                        className="text-[10px] text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your response to this customer..."
                      className="w-full p-2 text-xs rounded-lg border border-border bg-muted/20 text-foreground focus:outline-none focus:border-emerald-500 min-h-[60px] resize-none"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => setReplyingId(null)}
                        className="h-7 px-3.5 text-[11px] font-bold rounded-lg border border-border/50 text-foreground bg-transparent hover:bg-muted/60 transition-all cursor-pointer shadow-none"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => handleSendReply(review.id)}
                        className="h-7 px-3.5 text-[11px] font-extrabold rounded-lg border-2 border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-white bg-transparent hover:bg-emerald-500/10 transition-all cursor-pointer shadow-none"
                      >
                        Post Reply
                      </Button>
                    </div>
                  </div>
                )}

                {/* Displayed Owner Reply Box */}
                {(ownerReplies[review.id] || review.ownerReply) && replyingId !== review.id && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-600 dark:text-white text-[11px] flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-white" /> Owner Response
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingId(review.id);
                            setReplyText(ownerReplies[review.id] || review.ownerReply || "");
                          }}
                          className="text-[10px] font-bold text-muted-foreground hover:text-emerald-600 dark:hover:text-white cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReply(review.id)}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                      {ownerReplies[review.id] || review.ownerReply}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
