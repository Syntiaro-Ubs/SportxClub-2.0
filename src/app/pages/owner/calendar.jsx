import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { useAuth } from "../../providers/auth-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Calendar } from "../../components/ui/calendar";
import { Loader2, AlertCircle, Clock, MapPin, User, IndianRupee, Ban, CheckCircle, Trophy } from "lucide-react";
import { bookingService } from "../../services/booking.service";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../components/ui/utils";

export function CalendarView() {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [disabledDates, setDisabledDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const ownerId = currentUser?.id || "guest";
        const result = await bookingService.getAll(ownerId);
        
        // Map mock dates around today so they actually display
        const modifiedResult = result.map((b, i) => {
          const newDate = new Date();
          newDate.setDate(newDate.getDate() + (i % 3) - 1);
          return {
            ...b,
            date: format(newDate, "yyyy-MM-dd"),
          };
        });

        setData(modifiedResult);

        // Fetch disabled dates
        const disabledRes = await fetch(`/api/owner/disabled-dates?ownerId=${ownerId}`);
        if (disabledRes.ok) {
          const disabledData = await disabledRes.json();
          setDisabledDates(disabledData.map(d => d.date));
        }

      } catch (err) {
        console.error("API not available, rendering empty calendar:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const handleWindowClick = () => {
      // Dummy check to trigger layout if needed
    };
    window.addEventListener("click", handleWindowClick);

    fetchData();

    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, [currentUser]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPastDate = date ? new Date(date).setHours(0, 0, 0, 0) < today.getTime() : false;

  const selectedDateStr = date ? format(date, "yyyy-MM-dd") : "";
  const isDateDisabled = disabledDates.includes(selectedDateStr);

  const selectedBookings = data
    .filter((b) => b.date === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const toggleDateStatus = async () => {
    if (!selectedDateStr) return;
    const ownerId = currentUser?.id || "guest";
    const method = isDateDisabled ? "DELETE" : "POST";

    try {
      const res = await fetch(`/api/owner/disabled-dates?ownerId=${ownerId}`, {
        method,
        body: JSON.stringify({ date: selectedDateStr, ownerId }),
      });

      if (res.ok) {
        if (isDateDisabled) {
          setDisabledDates(prev => prev.filter(d => d !== selectedDateStr));
        } else {
          setDisabledDates(prev => [...prev, selectedDateStr]);
        }
      }
    } catch (e) {
      console.error("Failed to toggle date status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Convert string disabled dates to Date objects for the calendar
  const disabledDays = disabledDates.map(dStr => {
    // using manual parse to avoid timezone shifts
    const [y, m, d] = dStr.split('-');
    return new Date(y, m - 1, d);
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-7xl mx-auto pb-16 relative overflow-hidden px-1">
      {/* Background visual accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl opacity-30 pointer-events-none -z-10" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            Booking Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Interact with the date matrix to block bookings, view schedules, and track slots.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Calendar (Span 4) */}
        <div className="xl:col-span-4 xl:sticky xl:top-24">
          <Card className="border-border/40 bg-card/35 backdrop-blur-xl shadow-xl rounded-[24px] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/20">
            <CardContent className="p-6 flex flex-col items-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                disabled={[{ before: new Date(new Date().setHours(0, 0, 0, 0)) }]}
                modifiers={{ blocked: disabledDays }}
                modifiersClassNames={{
                  blocked: "text-rose-500 font-bold bg-rose-500/10 rounded-full"
                }}
                className="w-full bg-transparent border-none p-0 shadow-none flex justify-center mb-6"
              />
              
              <div className="w-full pt-5 border-t border-border/30">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Availability Status</span>
                  {isDateDisabled ? (
                    <Badge variant="destructive" className="animate-pulse bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-lg">
                      Blocked
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-lg">
                      Available
                    </Badge>
                  )}
                </div>
                <Button 
                  variant={isDateDisabled ? "outline" : "default"} 
                  className={cn(
                    "w-full gap-2 h-11 font-extrabold rounded-xl text-xs transition-all duration-300 cursor-pointer shadow-xs",
                    isDateDisabled 
                      ? "bg-white dark:bg-slate-900 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800 hover:scale-[1.02]" 
                      : "bg-white dark:bg-slate-900 text-emerald-600 dark:text-[#6DFF3B] border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-[#6DFF3B] dark:hover:border-[#6DFF3B] hover:scale-[1.02]"
                  )}
                  onClick={toggleDateStatus}
                  disabled={isPastDate}
                >
                  {isDateDisabled ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Enable Date (Available)
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4" /> Disable Date (Block Bookings)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bookings Matrix & Quick Summary (Span 8) */}
        <div className="xl:col-span-8 space-y-6">
          <Card className="border-border/40 bg-card/35 backdrop-blur-xl shadow-xl rounded-[24px] min-h-[500px] flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="border-b border-border/30 bg-muted/20 pb-5 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black text-foreground tracking-tight">
                    {date ? format(date, "MMMM d, yyyy") : "Select a date"}
                  </CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">
                    Scheduled sessions for this day
                  </CardDescription>
                </div>
                {isDateDisabled ? (
                  <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg flex items-center gap-1.5 self-start sm:self-auto shadow-xs">
                    <Ban className="w-3.5 h-3.5" /> Bookings Blocked
                  </Badge>
                ) : (
                  <Badge className="bg-primary/15 text-primary border border-primary/20 text-xs font-bold px-3 py-1 rounded-lg self-start sm:self-auto shadow-xs">
                    {selectedBookings.length} {selectedBookings.length === 1 ? "Booking" : "Bookings"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col">
              
              {/* Daily Statistics Cards Grid */}
              {!isDateDisabled && selectedBookings.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-border/20 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Booked Sessions</p>
                      <p className="text-xl font-black text-foreground">{selectedBookings.length}</p>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-primary/15 flex items-center justify-center text-primary border border-primary/15 shadow-inner">
                      <CheckCircle className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-border/20 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Duration</p>
                      <p className="text-xl font-black text-foreground">
                        {selectedBookings.reduce((sum, b) => sum + (b.duration || 1), 0)} Hrs
                      </p>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-500 border border-blue-500/15 shadow-inner">
                      <Clock className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-border/20 shadow-xs flex items-center justify-between hover:shadow-md transition-all duration-300">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Potential Revenue</p>
                      <p className="text-xl font-black text-emerald-500">
                        ₹{selectedBookings.reduce((sum, b) => sum + (b.amount || 0), 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 border border-emerald-500/15 shadow-inner">
                      <IndianRupee className="h-4.5 w-4.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic list rendering */}
              {isDateDisabled ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 flex flex-col items-center justify-center text-muted-foreground flex-1"
                >
                  <div className="w-20 h-20 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-5 text-rose-500 border border-rose-500/20 shadow-inner">
                    <Ban className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-extrabold mb-1.5 text-foreground">Date Unavailable</h3>
                  <p className="text-xs max-w-sm leading-relaxed">You have disabled this date. Customers will not be able to book any turf facilities on this day.</p>
                </motion.div>
              ) : selectedBookings.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 flex flex-col items-center justify-center text-muted-foreground flex-1"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 text-primary border border-primary/20 shadow-inner">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold mb-1 text-foreground">No Bookings Scheduled</h3>
                  <p className="text-xs max-w-xs leading-relaxed">There are no client reservation slots booked for this date yet.</p>
                </motion.div>
              ) : (
                <div className="space-y-4 flex-1">
                  <AnimatePresence>
                    {selectedBookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="p-5 rounded-2xl border border-border/50 bg-background/80 hover:bg-[#6DFF3B]/5 dark:hover:bg-[#6DFF3B]/5 hover:border-[#6DFF3B]/30 hover:scale-[1.01] hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-4 sm:items-center justify-between group relative overflow-hidden"
                      >
                        {/* Decorative vertical status bar */}
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300",
                          booking.status === 'Confirmed' || booking.status === 'Completed' 
                            ? 'bg-emerald-500 group-hover:h-full' 
                            : 'bg-amber-500 group-hover:h-full'
                        )} />
                        
                        <div className="space-y-2.5 flex-1 pl-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h4 className="font-extrabold text-base text-foreground tracking-tight">{booking.turfName}</h4>
                            <Badge className={cn(
                              "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border",
                              booking.status === 'Confirmed' || booking.status === 'Completed'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            )}>
                              {booking.status}
                            </Badge>
                            <span className="text-[10px] font-mono text-muted-foreground/60">ID: {booking.id}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-primary" />
                              <span className="font-bold text-foreground/80">{booking.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-primary" />
                              <span className="font-bold text-foreground/80">{booking.time} <span className="text-muted-foreground font-normal">({booking.duration} {booking.duration === 1 ? 'hr' : 'hrs'})</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between pl-3 sm:pl-0 sm:border-l sm:border-border/30 sm:pl-6 min-w-[130px] gap-1">
                          <div className="flex items-center font-black text-lg text-emerald-500 dark:text-emerald-400">
                            <IndianRupee className="w-4 h-4 mr-0.5 text-muted-foreground/80" />
                            {booking.amount.toLocaleString('en-IN')}
                          </div>
                          <Badge className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                            booking.paymentStatus?.toLowerCase() === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/15'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/15'
                          )}>
                            {booking.paymentStatus}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

