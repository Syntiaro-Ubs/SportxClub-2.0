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
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-lg">
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
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-[13px] font-medium text-foreground w-2 text-right">{rating}</span>
                    <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#fbbc04] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Rating (Right) */}
            <div className="flex flex-col items-center justify-start min-w-[100px] mt-[-8px]">
              <span className="text-[56px] font-normal text-foreground leading-[1] tracking-tight">{stats.average}</span>
              <div className="flex items-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= Math.round(Number(stats.average)) ? "fill-[#fbbc04] text-[#fbbc04]" : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"}`}
                  />
                ))}
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
                  ? "border border-transparent text-emerald-600 dark:text-emerald-400 font-bold scale-105 bg-transparent"
                  : "border border-border/60 bg-transparent text-muted-foreground hover:scale-105 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-transparent"
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
                    ? "border border-transparent text-emerald-600 dark:text-emerald-400 font-bold scale-105 bg-transparent"
                    : "border border-border/60 bg-transparent text-muted-foreground hover:scale-105 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-transparent"
                )}
              >
                <span>{topic.label}</span>
                <span className={selectedTopicFilter === topic.key ? "text-emerald-600/80 dark:text-emerald-400/80" : "text-muted-foreground"}>
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
                ? "border border-transparent text-emerald-600 dark:text-emerald-400 font-bold scale-105 bg-transparent"
                : "border border-border/60 bg-transparent text-muted-foreground hover:scale-105 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-transparent"
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
                        <AvatarFallback className="bg-transparent text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                          {getInitials(review.customerName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-foreground tracking-tight group-hover:text-emerald-600 transition-colors">
                          {review.customerName}
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground">
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

                {/* Footer Tag: Turf Location */}
                <div className="pt-2.5 border-t border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{review.turfName}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground uppercase border-border/50">
                    Verified Player
                  </Badge>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
