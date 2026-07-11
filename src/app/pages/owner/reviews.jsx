import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "../../providers/auth-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Loader2, AlertCircle, Star, MessageSquare, MapPin } from "lucide-react";
import { reviewService } from "../../services/review.service";
import { motion, AnimatePresence } from "motion/react";

export function ReviewsList() {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center text-destructive space-y-4">
        <AlertCircle className="h-12 w-12" />
        <p className="text-lg">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  // Calculate stats
  const averageRating = data.length > 0 
    ? (data.reduce((acc, curr) => acc + curr.rating, 0) / data.length).toFixed(1)
    : 0;

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
            className={`w-4 h-4 ${star <= rating ? 'fill-amber-500 text-amber-500' : 'fill-muted text-muted'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl tracking-tight font-bold">Customer Reviews</h1>
          <p className="text-muted-foreground mt-2">See what players are saying about your turfs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-20 pointer-events-none">
            <Star className="w-32 h-32 text-amber-500" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-500">
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-foreground">{averageRating}</h3>
                  <span className="text-sm text-muted-foreground">/ 5.0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 pointer-events-none">
            <MessageSquare className="w-32 h-32 text-primary" />
          </div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-primary/20 text-primary">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <h3 className="text-3xl font-bold text-foreground">{data.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>Latest feedback from your customers</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {data.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No reviews yet</h3>
              <p className="text-sm mt-1">You haven't received any reviews on your turfs yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {data.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 rounded-2xl border border-border/50 bg-background hover:bg-accent/20 transition-all flex flex-col gap-4 group shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 border border-primary/20 bg-primary/5">
                          <AvatarFallback className="bg-transparent text-primary font-semibold text-lg">
                            {getInitials(review.customerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground tracking-tight">{review.customerName}</p>
                          <p className="text-xs font-medium text-muted-foreground mt-0.5">{review.date}</p>
                        </div>
                      </div>
                      {renderStars(review.rating)}
                    </div>
                    
                    <div className="flex-1 mt-2">
                      <p className="text-[15px] text-foreground/80 leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                        "{review.comment}"
                      </p>
                    </div>

                    <div className="pt-4 mt-2 flex items-center gap-2 border-t border-border/50">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground/70">{review.turfName}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
