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
import { Loader2, AlertCircle, Clock, MapPin, User, IndianRupee, Ban, CheckCircle } from "lucide-react";
import { bookingService } from "../../services/booking.service";
import { motion, AnimatePresence } from "motion/react";

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
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  // Convert string disabled dates to Date objects for the calendar
  const disabledDays = disabledDates.map(dStr => {
    // using manual parse to avoid timezone shifts
    const [y, m, d] = dStr.split('-');
    return new Date(y, m - 1, d);
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl tracking-tight font-bold">Booking Calendar</h1>
        <p className="text-muted-foreground mt-2">View bookings and manage turf availability by date.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 xl:col-start-1">
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg xl:sticky xl:top-24">
            <CardContent className="p-4 flex flex-col items-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                disabled={[{ before: new Date(new Date().setHours(0, 0, 0, 0)) }]}
                modifiers={{ blocked: disabledDays }}
                modifiersClassNames={{
                  blocked: "text-destructive font-semibold bg-destructive/10 line-through"
                }}
                className="rounded-xl border border-border/50 bg-background/50 mb-4"
              />
              
              <div className="w-full pt-4 border-t border-border/50">
                <p className="text-sm font-medium text-center mb-3">Availability Status</p>
                <Button 
                  variant={isDateDisabled ? "default" : "destructive"} 
                  className="w-full gap-2 shadow-sm"
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

        <div className="xl:col-span-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-lg min-h-[500px]">
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-2xl">{date ? format(date, "MMMM d, yyyy") : "Select a date"}</span>
                {isDateDisabled ? (
                  <Badge variant="destructive" className="px-3 py-1 text-sm font-medium uppercase tracking-wider flex items-center gap-1.5 self-start sm:self-auto">
                    <Ban className="w-3.5 h-3.5" /> Bookings Blocked
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-3 py-1 text-sm font-normal bg-primary/10 text-primary border-primary/20 self-start sm:self-auto">
                    {selectedBookings.length} {selectedBookings.length === 1 ? "Booking" : "Bookings"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Scheduled sessions for this day</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isDateDisabled ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 flex flex-col items-center text-muted-foreground"
                >
                  <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4 text-destructive">
                    <Ban className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">Date Unavailable</h3>
                  <p className="text-sm max-w-md">You have disabled this date. Customers will not be able to book any turfs on this day.</p>
                </motion.div>
              ) : selectedBookings.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 flex flex-col items-center text-muted-foreground"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <Clock className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-1 text-foreground">No bookings</h3>
                  <p className="text-sm">There are no scheduled sessions for the selected date.</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {selectedBookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-5 rounded-2xl border border-border/50 bg-background/80 hover:bg-accent/40 hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 sm:items-center justify-between group relative overflow-hidden"
                      >
                        {/* Status accent line */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${booking.status === 'Confirmed' || booking.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        
                        <div className="space-y-3 flex-1 pl-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <h4 className="font-semibold text-lg text-foreground tracking-tight">{booking.turfName}</h4>
                            <Badge variant={booking.status === "Confirmed" ? "default" : "secondary"}>
                              {booking.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary/70" />
                              <span className="font-medium">{booking.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary/70" />
                              <span className="font-medium text-foreground/80">{booking.time} <span className="text-muted-foreground font-normal">({booking.duration} {booking.duration === 1 ? 'hr' : 'hrs'})</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between pl-3 sm:pl-0 sm:border-l sm:border-border/50 sm:pl-6 min-w-[120px]">
                          <div className="flex items-center font-bold text-xl text-emerald-500">
                            <IndianRupee className="w-5 h-5 mr-0.5" />
                            {booking.amount}
                          </div>
                          <p className="text-xs font-medium text-muted-foreground mt-1.5 uppercase tracking-wider">
                            {booking.paymentStatus}
                          </p>
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
