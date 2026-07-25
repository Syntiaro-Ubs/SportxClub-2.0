import { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { Loader2, Calendar as CalendarIcon, Mail, Printer, CheckCircle2, Power } from "lucide-react";
import { turfService } from "../../services/turf.service";

// TODO: Replace with actual auth context ownerId
const OWNER_ID = "owner-123";

// Generate mock slots for a turf
const generateMockSlots = () => {
  const slots = [];
  for (let i = 6; i <= 22; i++) {
    const timeStr = `${i.toString().padStart(2, '0')}:00`;
    // Deterministic mock based on hour
    let status = 'Available';
    if (i === 18 || i === 19 || i === 20) status = 'Booked';
    else if (i === 8 || i === 9) status = 'Booked';
    else if (i === 14) status = 'Maintenance';
    
    slots.push({
      time: timeStr,
      status: status,
      price: i >= 17 ? 1200 : 800, // Peak pricing
    });
  }
  return slots;
};

export function TimeSlots() {
  const [turfs, setTurfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Manual Booking State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    customerName: "",
    customerPhone: "",
    paymentMethod: "cash"
  });

  // Turf Pass State
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [generatedPass, setGeneratedPass] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Try to load from our simulated DB
        const approvedStr = localStorage.getItem("approved_turfs");
        let formattedTurfs = [];
        
        if (approvedStr) {
          const approved = JSON.parse(approvedStr);
          if (approved.length > 0) {
            // Map the onboarding data format to what time-slots expects
            formattedTurfs = approved.map(item => ({
              id: item.id,
              name: item.turf.name,
              location: `${item.location.address ? item.location.address + ', ' : ''}${item.location.city}`,
              sportType: item.turf.sports && item.turf.sports.length > 0 ? item.turf.sports.join(" & ") : "General",
              status: 'Active',
              slots: generateMockSlots(), // Continue using mock slots for demo
            }));
          }
        }

        if (formattedTurfs.length > 0) {
          setTurfs(formattedTurfs);
        } else {
          // Fallback to beautiful mock data if no approved turfs exist yet
          setTurfs([
            {
              id: '1',
              name: 'Cricket Ground 1',
              location: 'Downtown Sports Complex',
              sportType: 'Cricket',
              status: 'Active',
              slots: generateMockSlots(),
            },
            {
              id: '2',
              name: 'Cricket Ground 2',
              location: 'Downtown Sports Complex',
              sportType: 'Cricket',
              status: 'Active',
              slots: generateMockSlots(),
            },
            {
              id: '3',
              name: 'Premium Football Turf',
              location: 'Downtown Sports Complex',
              sportType: 'Football',
              status: 'Closed',
              slots: generateMockSlots(),
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch turfs", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSlotClick = (turf, slot, slotIdx) => {
    if (turf.status === 'Closed' || slot.status !== 'Available') return;
    setSelectedSlotForBooking({ turf, slot, slotIdx });
    setBookingDetails({ customerName: "", customerPhone: "", paymentMethod: "cash" });
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedSlotForBooking) return;

    const { turf, slot, slotIdx } = selectedSlotForBooking;

    // Simulate backend update: locally update the turfs state
    const updatedTurfs = turfs.map(t => {
      if (t.id === turf.id) {
        const updatedSlots = [...t.slots];
        updatedSlots[slotIdx] = { ...slot, status: 'Booked' };
        return { ...t, slots: updatedSlots };
      }
      return t;
    });

    setTurfs(updatedTurfs);

    // Generate Pass Details
    const pass = {
      id: "BKG" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      date: format(selectedDate, 'MMM dd, yyyy'),
      time: slot.time,
      turfName: turf.name,
      location: turf.location,
      price: slot.price,
      customerName: bookingDetails.customerName || "Walk-in Customer",
      customerPhone: bookingDetails.customerPhone || "N/A",
      paymentMethod: bookingDetails.paymentMethod
    };

    setGeneratedPass(pass);
    setIsBookingModalOpen(false);
    setIsPassModalOpen(true);
  };

  const handlePrintPass = () => {
    window.print();
  };

  const toggleTurfStatus = (turfId) => {
    setTurfs(turfs.map(t => {
      if (t.id === turfId) {
        return { ...t, status: t.status === 'Active' ? 'Closed' : 'Active' };
      }
      return t;
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20';
      case 'Booked': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 opacity-70';
      case 'Maintenance': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 opacity-70';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Turf Slot Management</h1>
          <p className="text-muted-foreground mt-2">View and manage booking slots for your turfs</p>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border/50 p-1.5 rounded-lg shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>
            &larr;
          </Button>
          <div className="flex items-center gap-2 px-3 text-sm font-medium">
            <CalendarIcon className="w-4 h-4 text-primary" />
            {format(selectedDate, 'MMM dd, yyyy')}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>
            &rarr;
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-card/30 p-3 rounded-xl border border-border/50 w-fit backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Available</div>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground"><div className="w-3 h-3 rounded-full bg-rose-500"></div> Booked</div>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Maintenance</div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {turfs.map(turf => (
          <Card key={turf.id} className="border-border/50 bg-card/40 backdrop-blur-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20">
            <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl tracking-tight">{turf.name}</CardTitle>
                    <Badge variant={turf.status === 'Active' ? 'default' : 'destructive'} className="text-[10px] uppercase tracking-widest px-2 py-0.5 shadow-sm">
                      {turf.status}
                    </Badge>
                  </div>
                  <CardDescription className="mt-1 flex items-center gap-2">
                    <span className="font-medium">{turf.sportType}</span>
                    <span className="text-muted-foreground/50">&bull;</span>
                    <span>{turf.location}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg border border-border/50 shadow-sm">
                    <Label htmlFor={`turf-status-${turf.id}`} className="text-xs font-semibold cursor-pointer text-muted-foreground">Turf Open</Label>
                    <Switch 
                      id={`turf-status-${turf.id}`}
                      checked={turf.status === 'Active'}
                      onCheckedChange={() => toggleTurfStatus(turf.id)}
                    />
                  </div>
                  <Badge variant="outline" className={`px-3 py-1.5 shadow-sm ${turf.status === 'Active' ? 'bg-primary/5 text-primary border-primary/20' : 'bg-muted text-muted-foreground border-border/50'}`}>
                    {turf.status === 'Active' ? turf.slots.filter(s => s.status === 'Available').length : 0} Slots Left
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 relative">
              {turf.status === 'Closed' && (
                <div className="absolute inset-0 z-10 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center rounded-b-xl">
                  <div className="bg-card p-4 rounded-full shadow-lg border border-border/50 mb-3 text-destructive animate-in zoom-in duration-300">
                    <Power className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">Turf is Closed</h3>
                  <p className="text-muted-foreground mt-1 font-medium">Bookings are currently disabled.</p>
                </div>
              )}
              <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 transition-opacity duration-300 ${turf.status === 'Closed' ? 'opacity-20 pointer-events-none' : ''}`}>
                {turf.slots.map((slot, idx) => (
                  <div 
                    key={idx}
                    onClick={() => handleSlotClick(turf, slot, idx)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${getStatusColor(slot.status)} ${slot.status === 'Available' ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : 'cursor-not-allowed'}`}
                  >
                    <span className="font-semibold text-sm">{slot.time}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">{slot.status}</span>
                    {slot.status === 'Available' && <span className="text-xs font-bold mt-1 bg-background/50 px-2 py-0.5 rounded-full">₹{slot.price}</span>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manual Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manual Booking</DialogTitle>
            <DialogDescription>
              Book {selectedSlotForBooking?.turf.name} for {selectedSlotForBooking?.slot.time} on {format(selectedDate, 'MMM dd, yyyy')}.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBookingSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. John Doe" 
                value={bookingDetails.customerName}
                onChange={(e) => setBookingDetails({...bookingDetails, customerName: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input 
                id="phone" 
                placeholder="e.g. +91 9876543210" 
                value={bookingDetails.customerPhone}
                onChange={(e) => setBookingDetails({...bookingDetails, customerPhone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment">Payment Method</Label>
              <Select 
                value={bookingDetails.paymentMethod} 
                onValueChange={(val) => setBookingDetails({...bookingDetails, paymentMethod: val})}
              >
                <SelectTrigger id="payment">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI / QR Code</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-between items-center bg-muted/30 p-3 rounded-lg border border-border/50 mt-6">
              <span className="text-sm font-medium">Total Amount Due:</span>
              <span className="text-lg font-bold">₹{selectedSlotForBooking?.slot.price}</span>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
              <Button type="submit">Confirm & Generate Pass</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Turf Pass Modal */}
      <Dialog open={isPassModalOpen} onOpenChange={setIsPassModalOpen}>
        <DialogContent className="sm:max-w-md print:max-w-none print:shadow-none print:border-none print:p-0">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
              Booking Successful
            </DialogTitle>
            <DialogDescription>
              Your manual booking has been confirmed. You can print or share this pass.
            </DialogDescription>
          </DialogHeader>

          {/* Printable Pass Area */}
          <div id="turf-pass-print-area" className="mt-4 border-2 border-dashed border-border p-6 rounded-2xl bg-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -z-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/10 rounded-tr-full -z-10"></div>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black tracking-tight uppercase text-primary">Turf Pass</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mt-1">SportXClub Entry Ticket</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-border/50 pb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
                  <p className="font-mono font-bold text-lg">{generatedPass?.id}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    PAID ({generatedPass?.paymentMethod.toUpperCase()})
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-border/50 pb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-semibold">{generatedPass?.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Time</p>
                  <p className="font-semibold text-primary">{generatedPass?.time}</p>
                </div>
              </div>

              <div className="border-b border-border/50 pb-4">
                <p className="text-sm text-muted-foreground mb-1">Turf Details</p>
                <p className="font-bold text-lg">{generatedPass?.turfName}</p>
                <p className="text-sm text-muted-foreground">{generatedPass?.location}</p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Customer</p>
                  <p className="font-semibold">{generatedPass?.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="font-bold text-xl">₹{generatedPass?.price}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between mt-6 print:hidden">
            <Button variant="outline" onClick={() => setIsPassModalOpen(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => {
                const subject = encodeURIComponent(`Turf Booking Pass - ${generatedPass?.turfName}`);
                const body = encodeURIComponent(`Hi ${generatedPass?.customerName},\n\nYour booking at ${generatedPass?.turfName} is confirmed.\n\nDate: ${generatedPass?.date}\nTime: ${generatedPass?.time}\nBooking ID: ${generatedPass?.id}\nAmount: ₹${generatedPass?.price}\n\nThank you!`);
                window.location.href = `mailto:${generatedPass?.customerPhone}?subject=${subject}&body=${body}`;
              }}>
                <Mail className="w-4 h-4 mr-2" />
                Email Pass
              </Button>
              <Button onClick={handlePrintPass}>
                <Printer className="w-4 h-4 mr-2" />
                Print Pass
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
