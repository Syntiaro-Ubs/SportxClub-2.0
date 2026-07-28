import { useState, useEffect, useMemo } from "react";
import {
  format,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths
} from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import {
  Loader2,
  Calendar as CalendarIcon,
  Mail,
  Printer,
  CheckCircle2,
  Power,
  Search,
  Lock,
  AlertTriangle,
  ShieldCheck,
  Ticket,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";

// TODO: Replace with actual auth context ownerId
const OWNER_ID = "owner-123";

// Generate mock slots for a turf
const generateMockSlots = () => {
  const slots = [];
  for (let i = 6; i <= 22; i++) {
    const timeStr = `${i.toString().padStart(2, '0')}:00`;
    // Deterministic mock status based on hour
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

// Mock bookings helper details for booked slots
const getBookingDetailsMock = (time) => {
  switch (time) {
    case "08:00":
    case "09:00":
      return { name: "Amit Patel", phone: "+91 91234 56789", method: "UPI" };
    case "18:00":
      return { name: "Rahul Sharma", phone: "+91 98765 43210", method: "Online Card" };
    case "19:00":
      return { name: "Vikram Rathore", phone: "+91 98123 45670", method: "Online UPI" };
    case "20:00":
      return { name: "Amit Patel", phone: "+91 91234 56789", method: "Cash" };
    default:
      return { name: "Registered Customer", phone: "N/A", method: "Online" };
  }
};

// Format time range e.g. "06:00" -> "06:00 am - 07:00 am"
const formatTimeRange = (time) => {
  const startHour = parseInt(time.split(':')[0], 10);
  const startPeriod = startHour >= 12 ? 'pm' : 'am';
  const start12 = startHour > 12 ? startHour - 12 : (startHour === 0 ? 12 : startHour);

  const endHour = startHour + 1;
  const endPeriod = endHour >= 12 && endHour < 24 ? 'pm' : 'am';
  const end12 = endHour > 12 ? endHour - 12 : (endHour === 0 ? 12 : endHour);

  // e.g. 06:00 am - 07:00am
  return `${start12.toString().padStart(2, '0')}:00 ${startPeriod} - ${end12.toString().padStart(2, '0')}:00${endPeriod}`;
};

// Custom styled Premium Calendar dropdown
function CustomCalendar({ selectedDate, onSelect }) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const gridStart = startOfWeek(startOfMonth(currentMonth));
  const gridEnd = endOfWeek(endOfMonth(currentMonth));

  const days = [];
  let day = gridStart;
  while (day <= gridEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="p-4 w-[280px] bg-card border border-border/40 rounded-2xl shadow-xl backdrop-blur-md">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="h-8 w-8 rounded-xl flex items-center justify-center border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-black tracking-tight text-foreground uppercase tracking-widest">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="h-8 w-8 rounded-xl flex items-center justify-center border border-border/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekdays Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {weekDays.map((wd) => (
          <span key={wd} className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            {wd}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((date, idx) => {
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          const isCurrentMonth = isSameMonth(date, currentMonth);

          let btnClasses = "h-8 w-8 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ";

          if (isSelected) {
            btnClasses += "border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-xs";
          } else if (isToday) {
            btnClasses += "border border-emerald-600/45 text-emerald-600 hover:bg-emerald-600/10";
          } else if (!isCurrentMonth) {
            btnClasses += "text-muted-foreground/25 hover:bg-muted/30 font-normal";
          } else {
            btnClasses += "text-foreground/80 hover:bg-muted border border-transparent hover:border-border/50 hover:shadow-xs";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(date)}
              className={btnClasses}
            >
              {format(date, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TimeSlots() {
  const [turfs, setTurfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLegendFilter, setSelectedLegendFilter] = useState("all"); // 'all', 'Available', 'Booked', 'Maintenance'

  // Manual Booking State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);
  const [playHours, setPlayHours] = useState(1);
  const [hoveredSlotInfo, setHoveredSlotInfo] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    customerName: "",
    customerPhone: "",
    paymentMethod: "cash"
  });

  // Turf Pass State
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [generatedPass, setGeneratedPass] = useState(null);

  // Custom Time Block & Release States
  const [bookingActionType, setBookingActionType] = useState("booking"); // 'booking' or 'block'
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedTurfForCustomBlock, setSelectedTurfForCustomBlock] = useState(null);
  const [customBlockForm, setCustomBlockForm] = useState({
    startTime: "10:15",
    startPeriod: "AM",
    endTime: "12:10",
    endPeriod: "PM",
    reason: "Maintenance"
  });
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [selectedSlotForRelease, setSelectedSlotForRelease] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Try to load from our simulated DB onboarding details
        const approvedStr = localStorage.getItem("approved_turfs");
        let formattedTurfs = [];

        if (approvedStr) {
          const approved = JSON.parse(approvedStr);
          if (approved.length > 0) {
            formattedTurfs = approved.map(item => ({
              id: item.id,
              name: item.turf.name,
              location: `${item.location.address ? item.location.address + ', ' : ''}${item.location.city}`,
              sportType: item.turf.sports && item.turf.sports.length > 0 ? item.turf.sports.join(" & ") : "General",
              status: 'Active',
              slots: generateMockSlots(),
            }));
          }
        }

        if (formattedTurfs.length > 0) {
          setTurfs(formattedTurfs);
        } else {
          // Fallback mock database
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

  // Compute availability totals for legend count labels
  const legendCounts = useMemo(() => {
    let available = 0;
    let booked = 0;
    let maintenance = 0;

    turfs.forEach(t => {
      if (t.status === 'Active') {
        t.slots.forEach(s => {
          if (s.status === 'Available') available++;
          else if (s.status === 'Booked') booked++;
          else if (s.status === 'Maintenance') maintenance++;
        });
      }
    });

    return { available, booked, maintenance };
  }, [turfs]);

  // Filtered turfs computed state (name or sport type search)
  const filteredTurfs = useMemo(() => {
    return turfs.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sportType.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [turfs, searchQuery]);

  const handleSlotClick = (turf, slot, slotIdx) => {
    if (turf.status === 'Closed') return;

    if (slot.status === 'Booked' || slot.status === 'Maintenance') {
      setSelectedSlotForRelease({ turf, slot, slotIdx });
      setIsReleaseModalOpen(true);
      return;
    }

    let canBook = true;
    for (let i = 0; i < playHours; i++) {
      if (slotIdx + i >= turf.slots.length || turf.slots[slotIdx + i].status !== 'Available') {
        canBook = false;
        break;
      }
    }

    if (!canBook) {
      toast.error(`Cannot book/block ${playHours} consecutive hour(s) from this slot. Please select another slot or reduce duration.`);
      return;
    }

    setSelectedSlotForBooking({ turf, slot, slotIdx });
    setBookingDetails({ customerName: "", customerPhone: "", paymentMethod: "cash" });
    setBookingActionType("booking"); // Default to walk-in booking
    setIsBookingModalOpen(true);
    setHoveredSlotInfo(null);
  };

  const handleSlotMouseEnter = (turf, slotIdx) => {
    let canBook = true;
    for (let i = 0; i < playHours; i++) {
      if (slotIdx + i >= turf.slots.length || turf.slots[slotIdx + i].status !== 'Available') {
        canBook = false;
        break;
      }
    }
    setHoveredSlotInfo({ turfId: turf.id, startIdx: slotIdx, isValid: canBook });
  };

  const handleSlotMouseLeave = () => {
    setHoveredSlotInfo(null);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!selectedSlotForBooking) return;

    const { turf, slot, slotIdx } = selectedSlotForBooking;

    let totalPrice = 0;
    const isBlocking = bookingActionType === "block";

    // Simulate database update locally in state
    const updatedTurfs = turfs.map(t => {
      if (t.id === turf.id) {
        const updatedSlots = [...t.slots];
        for (let i = 0; i < playHours; i++) {
          totalPrice += updatedSlots[slotIdx + i].price;
          updatedSlots[slotIdx + i] = {
            ...updatedSlots[slotIdx + i],
            status: isBlocking ? 'Maintenance' : 'Booked',
            blockedTimeRange: null
          };
        }
        return { ...t, slots: updatedSlots };
      }
      return t;
    });

    setTurfs(updatedTurfs);

    if (isBlocking) {
      setIsBookingModalOpen(false);
      toast.success(`Slot(s) successfully blocked!`);
      return;
    }

    const endTime = turf.slots[slotIdx + playHours - 1].time;
    const endHour = parseInt(endTime.split(':')[0]) + 1;

    const formatTime12 = (hour) => {
      const h = hour % 24;
      const period = h >= 12 ? 'pm' : 'am';
      const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      return `${h12.toString().padStart(2, '0')}:00 ${period}`;
    };

    const startHour = parseInt(slot.time.split(':')[0]);
    const passTimeStr = `${formatTime12(startHour)} - ${formatTime12(endHour)}`;

    // Generate boarding ticket details
    const pass = {
      id: "BKG" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      date: format(selectedDate, 'MMM dd, yyyy'),
      time: passTimeStr,
      turfName: turf.name,
      location: turf.location,
      price: totalPrice,
      customerName: bookingDetails.customerName || "Walk-in Customer",
      customerPhone: bookingDetails.customerPhone || "N/A",
      paymentMethod: bookingDetails.paymentMethod
    };

    setGeneratedPass(pass);
    setIsBookingModalOpen(false);
    setIsPassModalOpen(true);
    toast.success(`Booking created successfully for ${pass.customerName}!`);
  };

  // Release Slot Handler
  const handleReleaseSlot = () => {
    if (!selectedSlotForRelease) return;
    const { turf, slot, slotIdx } = selectedSlotForRelease;

    const updatedTurfs = turfs.map(t => {
      if (t.id === turf.id) {
        const updatedSlots = [...t.slots];
        updatedSlots[slotIdx] = {
          ...updatedSlots[slotIdx],
          status: 'Available',
          blockedTimeRange: null,
          blockedReason: null
        };
        return { ...t, slots: updatedSlots };
      }
      return t;
    });

    setTurfs(updatedTurfs);
    setIsReleaseModalOpen(false);
    setSelectedSlotForRelease(null);
    toast.success("Slot successfully released back to Available!");
  };

  // Helper: Convert time string and period into decimal hours (e.g. "10:15", "AM" -> 10.25)
  const timeToDecimal = (timeStr, period) => {
    const [hourStr, minStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10) || 0;

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return hour + min / 60;
  };

  // Custom Time Block Submission Handler
  const handleCustomBlockSubmit = (e) => {
    e.preventDefault();
    if (!selectedTurfForCustomBlock) return;

    const startDec = timeToDecimal(customBlockForm.startTime, customBlockForm.startPeriod);
    const endDec = timeToDecimal(customBlockForm.endTime, customBlockForm.endPeriod);

    if (endDec <= startDec) {
      toast.error("End time must be after start time!");
      return;
    }

    const format12 = (timeStr, period) => {
      return `${timeStr} ${period}`;
    };

    const blockLabel = `${format12(customBlockForm.startTime, customBlockForm.startPeriod)} - ${format12(customBlockForm.endTime, customBlockForm.endPeriod)}`;

    const updatedTurfs = turfs.map(t => {
      if (t.id === selectedTurfForCustomBlock.id) {
        const updatedSlots = t.slots.map(slot => {
          const slotStartHour = parseInt(slot.time.split(':')[0], 10);
          const slotEndHour = slotStartHour + 1;

          // Check if slot interval overlaps with user's custom block range
          const overlaps = Math.max(slotStartHour, startDec) < Math.min(slotEndHour, endDec);

          if (overlaps) {
            return {
              ...slot,
              status: 'Maintenance',
              blockedTimeRange: blockLabel,
              blockedReason: customBlockForm.reason
            };
          }
          return slot;
        });
        return { ...t, slots: updatedSlots };
      }
      return t;
    });

    setTurfs(updatedTurfs);
    setIsBlockModalOpen(false);
    setSelectedTurfForCustomBlock(null);
    toast.success(`Turf blocked for custom interval: ${blockLabel}`);
  };

  const handlePrintPass = () => {
    window.print();
  };

  const toggleTurfStatus = (turfId) => {
    setTurfs(turfs.map(t => {
      if (t.id === turfId) {
        const nextStatus = t.status === 'Active' ? 'Closed' : 'Active';
        toast.info(`${t.name} is now ${nextStatus === 'Active' ? 'Open' : 'Closed'}`);
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleLegendClick = (status) => {
    setSelectedLegendFilter(prev => prev === status ? "all" : status);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto theme-adaptive pb-16">

      {/* -------------------------------------------------------------
          Header Title & Details Row
          ------------------------------------------------------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            Turf Slot Management
          </h1>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Toolbar: Search, Legends & Interactive Filters
          ------------------------------------------------------------- */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card/20 p-4 rounded-2xl border border-border/40 backdrop-blur-md shadow-sm">

        {/* Search Field */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search turfs by name or sport..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-background/50 border-border/40 focus:border-primary/50 text-xs w-full"
          />
        </div>

        {/* Dynamic Legend Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 w-full lg:w-auto">
          {/* Duration Selector */}
          <div className="flex items-center gap-1 bg-background/50 p-1 rounded-xl border border-border/40 mr-2">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1 hidden sm:inline-block">Duration:</span>
            {[1, 2, 3, 4].map(hrs => (
              <button
                key={hrs}
                onClick={() => setPlayHours(hrs)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${playHours === hrs
                  ? 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black shadow-xs'
                  : 'border border-transparent text-muted-foreground hover:bg-muted/40'
                  }`}
              >
                {hrs} Hr
              </button>
            ))}
          </div>
          {/* Available Pill */}
          <button
            onClick={() => handleLegendClick("Available")}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all shrink-0 cursor-pointer ${selectedLegendFilter === "Available"
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-inner'
              : 'border-border/30 text-muted-foreground hover:bg-muted/40'
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 ${selectedLegendFilter === "Available" ? 'animate-pulse' : ''}`}></span>
            Available
            <Badge variant="secondary" className="h-4 px-1 bg-emerald-500/10 border-0 text-[8.5px] text-emerald-500 font-bold shrink-0">{legendCounts.available}</Badge>
          </button>

          {/* Booked Pill */}
          <button
            onClick={() => handleLegendClick("Booked")}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all shrink-0 cursor-pointer ${selectedLegendFilter === "Booked"
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-inner'
              : 'border-border/30 text-muted-foreground hover:bg-muted/40'
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-rose-500 ${selectedLegendFilter === "Booked" ? 'animate-pulse' : ''}`}></span>
            Booked
            <Badge variant="secondary" className="h-4 px-1 bg-rose-500/10 border-0 text-[8.5px] text-rose-500 font-bold shrink-0">{legendCounts.booked}</Badge>
          </button>

          {/* Maintenance Pill */}
          <button
            onClick={() => handleLegendClick("Maintenance")}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all shrink-0 cursor-pointer ${selectedLegendFilter === "Maintenance"
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-inner'
              : 'border-border/30 text-muted-foreground hover:bg-muted/40'
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full bg-amber-500 ${selectedLegendFilter === "Maintenance" ? 'animate-pulse' : ''}`}></span>
            Maintenance
            <Badge variant="secondary" className="h-4 px-1 bg-amber-500/10 border-0 text-[8.5px] text-amber-500 font-bold shrink-0">{legendCounts.maintenance}</Badge>
          </button>

          {selectedLegendFilter !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLegendFilter("all")}
              className="text-[9px] text-muted-foreground hover:text-foreground h-7 shrink-0 px-2"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center justify-between w-fit mx-auto lg:w-auto lg:mx-0 bg-card/60 border border-border/50 p-0.5 rounded-lg shadow-xs relative">
          <Button
            variant="ghost"
            size="icon"
            className="!h-7 !w-7 !size-7 rounded-md text-muted-foreground hover:text-foreground shrink-0 p-0"
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
          >
            &larr;
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 px-3 py-1 text-[11px] font-bold text-foreground hover:bg-muted/40 rounded-md transition-colors cursor-pointer min-w-[110px]"
                title="Select specific date"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0 scale-90" />
                <span>{format(selectedDate, 'MMM dd, yyyy')}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border border-border/40 bg-popover shadow-xl z-50" align="end">
              <CustomCalendar
                selectedDate={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            className="!h-7 !w-7 !size-7 rounded-md text-muted-foreground hover:text-foreground shrink-0 p-0"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          >
            &rarr;
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          Turfs Grid & Matrix Slots
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredTurfs.length > 0 ? (
          filteredTurfs.map(turf => {
            const availableSlots = turf.status === 'Active' ? turf.slots.filter(s => s.status === 'Available').length : 0;
            return (
              <Card
                key={turf.id}
                className="border-border/40 bg-card/30 backdrop-blur-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20 rounded-2xl flex flex-col justify-between"
              >
                {/* Card Header Section */}
                <CardHeader className="border-b border-border/40 bg-muted/20 pb-4 px-5 pt-4 relative">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex flex-col gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg font-bold tracking-tight text-foreground">{turf.name}</CardTitle>
                        </div>
                        <CardDescription className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                          <span className="text-primary font-bold">{turf.sportType}</span>
                          <span className="opacity-40">&bull;</span>
                          <span>{turf.location}</span>
                        </CardDescription>
                      </div>

                      {/* Duration Selector moved to the left */}
                      <div className="flex items-center gap-1 bg-background/80 p-1 rounded-2xl border border-border/40 shadow-xs w-max">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2 hidden sm:inline-block">DURATION:</span>
                        {[1, 2, 3, 4].map(hrs => (
                          <button
                            key={hrs}
                            type="button"
                            onClick={() => setPlayHours(hrs)}
                            className={`px-2.5 py-1 text-[10px] font-extrabold rounded-xl transition-all cursor-pointer ${playHours === hrs
                              ? 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs'
                              : 'border border-transparent text-muted-foreground hover:bg-muted/40'
                              }`}
                          >
                            {hrs} Hr
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Active/Closed Badge Centered */}
                    <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 top-4 items-center justify-center">
                      {turf.status === 'Active' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] uppercase tracking-widest font-extrabold rounded-lg px-3 py-1 text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] uppercase tracking-widest font-extrabold rounded-lg px-3 py-1 text-xs">
                          Closed
                        </Badge>
                      )}
                    </div>
                    {/* Mobile fallback for badge */}
                    <div className="sm:hidden flex items-center justify-center w-full mt-2">
                      {turf.status === 'Active' ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] uppercase tracking-widest font-extrabold rounded-lg px-3 py-1 text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] uppercase tracking-widest font-extrabold rounded-lg px-3 py-1 text-xs">
                          Closed
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-2.5 self-end sm:self-auto h-full justify-between sm:justify-end mt-2 sm:mt-0 relative z-10">
                      {/* Row 1: Status and Slots Badge */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Active open toggle switch */}
                        <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-xl border border-border/50 shadow-xs">
                          <Label htmlFor={`turf-status-${turf.id}`} className="text-[10px] font-bold cursor-pointer text-muted-foreground uppercase tracking-wider">Turf Open</Label>
                          <Switch
                            id={`turf-status-${turf.id}`}
                            checked={turf.status === 'Active'}
                            onCheckedChange={() => toggleTurfStatus(turf.id)}
                          />
                        </div>

                        {/* Slots remaining badge */}
                        <Badge variant="outline" className={`px-2.5 py-1.5 text-[10px] font-bold rounded-xl shadow-xs ${availableSlots > 5
                          ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20'
                          : availableSlots > 0
                            ? 'bg-amber-500/5 text-amber-500 border-amber-500/20'
                            : 'bg-rose-500/5 text-rose-500 border-rose-500/20'
                          }`}>
                          {availableSlots} Slots Left
                        </Badge>
                      </div>

                      {/* Row 2: Block Time Button at the end */}
                      <div className="flex flex-wrap items-center gap-2.5 mt-auto">
                        <Button
                          type="button"
                          onClick={() => {
                            setSelectedTurfForCustomBlock(turf);
                            setIsBlockModalOpen(true);
                          }}
                          className="h-8 rounded-md bg-card text-emerald-600 hover:bg-emerald-500/10 border border-emerald-500 hover:border-emerald-600 hover:shadow-sm hover:shadow-emerald-500/20 text-[10px] font-black uppercase tracking-wider px-3 py-1 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <Power className="w-3 h-3" /> Block Custom Time
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Card Content Section */}
                <CardContent className="p-5 relative flex-1">

                  {/* Closed Overlay */}
                  {turf.status === 'Closed' && (
                    <div className="absolute inset-0 z-10 bg-background/70 backdrop-blur-[3px] flex flex-col items-center justify-center rounded-b-2xl transition-all">
                      <div className="bg-card p-3 rounded-2xl shadow-md border border-border/60 mb-2 text-rose-500 animate-in zoom-in duration-300">
                        <Power className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-foreground">Facility is Closed</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">Re-enable Turf Open toggle to accept bookings.</p>
                    </div>
                  )}

                  {/* Grid Slots */}
                  <div className={`grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 transition-all duration-300 ${turf.status === 'Closed' ? 'opacity-20 pointer-events-none' : ''
                    }`}>
                    {turf.slots.map((slot, idx) => {
                      const isFilteredOut = selectedLegendFilter !== "all" && slot.status !== selectedLegendFilter;

                      // Render Available Slot
                      if (slot.status === 'Available') {
                        const isHoveredGroup = hoveredSlotInfo &&
                          hoveredSlotInfo.turfId === turf.id &&
                          idx >= hoveredSlotInfo.startIdx &&
                          idx < hoveredSlotInfo.startIdx + playHours;

                        const hoverValidClass = isHoveredGroup && hoveredSlotInfo.isValid
                          ? 'bg-card border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 scale-[1.03] shadow-md shadow-emerald-500/10 font-bold'
                          : isHoveredGroup && !hoveredSlotInfo.isValid
                            ? 'bg-card border-2 border-rose-500 text-rose-600'
                            : 'bg-card border-2 border-emerald-500/40 hover:border-emerald-500 text-emerald-700 dark:text-emerald-400';

                        return (
                          <div
                            key={idx}
                            onClick={() => handleSlotClick(turf, slot, idx)}
                            onMouseEnter={() => handleSlotMouseEnter(turf, idx)}
                            onMouseLeave={handleSlotMouseLeave}
                            className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 shadow-xs min-h-[74px] ${hoverValidClass} ${isFilteredOut ? 'opacity-20 border-transparent shadow-none scale-[0.96] pointer-events-none' : ''
                              }`}
                          >
                            <span className="font-extrabold text-xs whitespace-nowrap text-foreground">{formatTimeRange(slot.time)}</span>
                            <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400">Available</span>
                            <span className={`text-[9.5px] font-mono font-black mt-1 px-2.5 py-0.5 rounded-full border border-emerald-500/30 ${isHoveredGroup && hoveredSlotInfo.isValid ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-background/80 text-foreground'}`}>₹{slot.price}</span>
                          </div>
                        );
                      }

                      // Render Booked Slot
                      if (slot.status === 'Booked') {
                        const bDetails = getBookingDetailsMock(slot.time);
                        return (
                          <div
                            key={idx}
                            onClick={() => handleSlotClick(turf, slot, idx)}
                            className={`relative group/slot p-3 rounded-2xl border-2 border-rose-500/40 bg-card flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 min-h-[74px] shadow-xs ${isFilteredOut ? 'opacity-20 border-transparent shadow-none scale-[0.96] pointer-events-none' : ''
                              }`}
                          >
                            <span className="font-extrabold text-xs whitespace-nowrap text-foreground">{formatTimeRange(slot.time)}</span>
                            <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-rose-500">BOOKED</span>
                            <span className="text-[9.5px] font-mono font-black mt-1 px-2.5 py-0.5 rounded-full border border-rose-500/30 bg-background/80 text-rose-500 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5 text-rose-500" /> RELEASE SLOT
                            </span>

                            {/* Styled Hover Card Tooltip (radix mockup tooltip) */}
                            <div className="absolute bottom-full mb-2.5 hidden group-hover/slot:flex flex-col bg-popover text-popover-foreground border border-border text-[10px] p-2.5 rounded-xl shadow-xl z-20 w-44 pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95">
                              <div className="flex items-center gap-1.5 border-b border-border/50 pb-1.5 mb-1.5">
                                <ShieldCheck className="h-3.5 w-3.5 text-rose-500" />
                                <span className="font-bold text-foreground">Click to Release</span>
                              </div>
                              <p className="font-semibold text-foreground truncate">{bDetails.name}</p>
                              <p className="text-muted-foreground text-[9px] mt-0.5">{bDetails.phone}</p>
                              <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-border/20 text-[9px]">
                                <span className="text-muted-foreground">Channel:</span>
                                <span className="font-bold text-rose-500 uppercase">{bDetails.method}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Render Maintenance Slot
                      if (slot.status === 'Maintenance') {
                        const hasCustomRange = !!slot.blockedTimeRange;
                        return (
                          <div
                            key={idx}
                            onClick={() => handleSlotClick(turf, slot, idx)}
                            className={`relative group/slot p-3 rounded-2xl border-2 border-amber-500/30 bg-card flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 min-h-[74px] shadow-xs ${isFilteredOut ? 'opacity-20 border-transparent shadow-none scale-[0.96] pointer-events-none' : ''
                              }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            <span className="font-extrabold text-[10px] whitespace-nowrap text-foreground text-center">
                              {hasCustomRange ? slot.blockedTimeRange : formatTimeRange(slot.time)}
                            </span>
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-400">
                              {slot.blockedReason || "Maintenance"}
                            </span>
                            <span className="text-[7.5px] font-bold text-muted-foreground opacity-80">(Click to Unblock)</span>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-2 py-16 text-center text-muted-foreground bg-card/20 rounded-2xl border border-border/40">
            <Search className="h-10 w-10 mx-auto opacity-20 mb-2 animate-bounce" />
            <h4 className="text-base font-bold text-foreground">No Facilities Found</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          Manual Booking Dialog Modal
          ------------------------------------------------------------- */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border border-border/40 bg-popover shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-bold flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Manual Booking
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure slots for walk-in players. This updates database records immediately.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="space-y-4 py-3">
            {/* Toggle Action Type */}
            <div className="grid grid-cols-2 gap-2 bg-muted/40 p-1 rounded-xl border border-border/40 mb-2">
              <button
                type="button"
                onClick={() => setBookingActionType("booking")}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${bookingActionType === "booking"
                  ? "bg-emerald-500 text-black shadow-sm font-black"
                  : "text-muted-foreground hover:bg-muted/40"
                  }`}
              >
                Walk-in Booking
              </button>
              <button
                type="button"
                onClick={() => setBookingActionType("block")}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${bookingActionType === "block"
                  ? "bg-amber-500 text-black shadow-sm font-black"
                  : "text-muted-foreground hover:bg-muted/40"
                  }`}
              >
                Block Slot
              </button>
            </div>

            {bookingActionType === "block" ? (
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-500 text-xs font-medium space-y-1.5">
                <p className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-500" /> Block Facility Hold</p>
                <p>This will temporarily mark the selected slot(s) for the next {playHours} hour(s) as Maintenance/Blocked. Regular players won't be able to book it.</p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="cust-name" className="text-xs font-semibold">Customer Full Name</Label>
                  <Input
                    id="cust-name"
                    placeholder="e.g. John Doe"
                    value={bookingDetails.customerName}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, customerName: e.target.value })}
                    className="h-10 rounded-lg text-sm"
                    required={bookingActionType === "booking"}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cust-phone" className="text-xs font-semibold">Phone Number</Label>
                  <Input
                    id="cust-phone"
                    placeholder="e.g. +91 9876543210"
                    value={bookingDetails.customerPhone}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, customerPhone: e.target.value })}
                    className="h-10 rounded-lg text-sm"
                    required={bookingActionType === "booking"}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cust-payment" className="text-xs font-semibold">Payment Channel</Label>
                  <Select
                    value={bookingDetails.paymentMethod}
                    onValueChange={(val) => setBookingDetails({ ...bookingDetails, paymentMethod: val })}
                  >
                    <SelectTrigger id="cust-payment" className="h-10 rounded-lg text-sm">
                      <SelectValue placeholder="Select payment channel" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="cash">Cash Payment</SelectItem>
                      <SelectItem value="upi">UPI / QR Scan</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex justify-between items-center bg-muted/40 p-4 rounded-xl border border-border/50 mt-4 shadow-inner">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Amount Due</span>
              <span className="text-lg font-black text-primary">
                ₹{selectedSlotForBooking && Array.from({ length: playHours }).reduce((sum, _, i) => {
                  const idx = selectedSlotForBooking.slotIdx + i;
                  if (idx < selectedSlotForBooking.turf.slots.length) {
                    return sum + selectedSlotForBooking.turf.slots[idx].price;
                  }
                  return sum;
                }, 0)}
              </span>
            </div>

            <DialogFooter className="mt-6 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBookingModalOpen(false)}
                className="rounded-xl px-4 py-2 border border-border text-foreground bg-white dark:bg-slate-900 hover:bg-muted/40 hover:scale-[1.03] transition-all duration-300 font-bold text-xs h-10 cursor-pointer shadow-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl px-4 py-2 border border-border text-foreground bg-white dark:bg-slate-900 hover:bg-emerald-600 hover:text-black hover:border-emerald-600 hover:scale-[1.03] transition-all duration-300 font-bold text-xs h-10 cursor-pointer shadow-xs"
              >
                Confirm & Generate Pass
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------
          Turf Pass Printable Boarding Voucher Modal
          ------------------------------------------------------------- */}
      <Dialog open={isPassModalOpen} onOpenChange={setIsPassModalOpen}>
        <DialogContent className="sm:max-w-md bg-popover rounded-2xl border border-border/40 shadow-2xl print:shadow-none print:border-none print:p-0">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center gap-2 text-emerald-500 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Booking Successful
            </DialogTitle>
            <DialogDescription className="text-xs">
              Manual booking successfully recorded. Share or print the coupon pass below.
            </DialogDescription>
          </DialogHeader>

          {/* Printable Ticket Receipt Voucher */}
          <div id="turf-pass-print-area" className="mt-2.5 border border-border p-4 rounded-2xl bg-card relative overflow-hidden shadow-sm">
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full -z-10"></div>
            <div className="absolute bottom-0 left-0 w-14 h-14 bg-primary/10 rounded-tr-full -z-10"></div>

            <div className="text-center mb-4">
              <h2 className="text-xl font-black tracking-tight uppercase text-primary">Turf Pass</h2>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">SportXClub Entry Ticket</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end border-b border-border/50 pb-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Booking ID</p>
                  <p className="font-mono font-bold text-sm text-foreground">{generatedPass?.id}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[9px] font-bold">
                    PAID ({generatedPass?.paymentMethod.toUpperCase()})
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Date</p>
                  <p className="font-bold text-xs text-foreground">{generatedPass?.date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Time</p>
                  <p className="font-bold text-xs text-primary">{generatedPass?.time}</p>
                </div>
              </div>

              {/* Dotted Divider line with side notches */}
              <div className="relative my-3">
                <div className="w-4 h-4 rounded-full bg-popover absolute left-[-26px] top-1/2 -translate-y-1/2 z-10 border-r border-border" />
                <div className="w-4 h-4 rounded-full bg-popover absolute right-[-26px] top-1/2 -translate-y-1/2 z-10 border-l border-border" />
                <div className="border-t border-dashed border-border/80 w-full" />
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Turf Details</p>
                <p className="font-bold text-sm text-foreground">{generatedPass?.turfName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{generatedPass?.location}</p>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-border/20 mt-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Customer</p>
                  <p className="font-bold text-xs text-foreground">{generatedPass?.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">Total Amount</p>
                  <p className="font-black text-lg text-primary">₹{generatedPass?.price}</p>
                </div>
              </div>

              {/* QR Code Mockup */}
              <div className="flex flex-col items-center justify-center pt-3 border-t border-border/40 mt-3">
                <div className="p-2 bg-white dark:bg-white rounded-xl border border-border/50 shadow-inner">
                  <svg className="w-14 h-14 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* Top-Left Finder Pattern */}
                    <rect x="0" y="0" width="30" height="30" rx="3" />
                    <rect x="5" y="5" width="20" height="20" rx="2" fill="white" />
                    <rect x="10" y="10" width="10" height="10" rx="1" />

                    {/* Top-Right Finder Pattern */}
                    <rect x="70" y="0" width="30" height="30" rx="3" />
                    <rect x="75" y="5" width="20" height="20" rx="2" fill="white" />
                    <rect x="80" y="10" width="10" height="10" rx="1" />

                    {/* Bottom-Left Finder Pattern */}
                    <rect x="0" y="70" width="30" height="30" rx="3" />
                    <rect x="5" y="75" width="20" height="20" rx="2" fill="white" />
                    <rect x="10" y="80" width="10" height="10" rx="1" />

                    {/* Small Alignment Pattern near bottom-right */}
                    <rect x="75" y="75" width="10" height="10" rx="1" />

                    {/* Simulated QR Code Data Pixels */}
                    <rect x="35" y="0" width="10" height="5" />
                    <rect x="55" y="0" width="5" height="10" />
                    <rect x="65" y="5" width="5" height="5" />

                    <rect x="35" y="10" width="5" height="15" />
                    <rect x="45" y="15" width="15" height="5" />
                    <rect x="65" y="15" width="5" height="10" />

                    <rect x="35" y="20" width="15" height="5" />
                    <rect x="55" y="25" width="10" height="5" />

                    <rect x="0" y="35" width="5" height="10" />
                    <rect x="10" y="35" width="15" height="5" />
                    <rect x="30" y="35" width="10" height="10" />
                    <rect x="45" y="35" width="5" height="5" />
                    <rect x="55" y="35" width="25" height="5" />
                    <rect x="85" y="35" width="15" height="5" />

                    <rect x="5" y="45" width="10" height="5" />
                    <rect x="20" y="45" width="15" height="10" />
                    <rect x="40" y="45" width="5" height="5" />
                    <rect x="50" y="45" width="15" height="5" />
                    <rect x="70" y="45" width="10" height="10" />
                    <rect x="85" y="45" width="5" height="15" />

                    <rect x="0" y="55" width="15" height="5" />
                    <rect x="40" y="55" width="10" height="5" />
                    <rect x="55" y="55" width="5" height="10" />
                    <rect x="65" y="55" width="15" height="5" />

                    <rect x="35" y="65" width="5" height="15" />
                    <rect x="45" y="70" width="10" height="5" />
                    <rect x="60" y="65" width="5" height="10" />
                    <rect x="70" y="70" width="5" height="15" />
                    <rect x="90" y="65" width="10" height="5" />

                    <rect x="35" y="85" width="15" height="5" />
                    <rect x="55" y="80" width="10" height="5" />
                    <rect x="60" y="90" width="25" height="5" />
                    <rect x="90" y="80" width="5" height="15" />
                  </svg>
                </div>
                <p className="text-[10px] font-mono tracking-widest text-muted-foreground mt-2 font-bold uppercase">{generatedPass?.id}</p>
              </div>

            </div>
          </div>

          <DialogFooter className="sm:justify-between mt-6 print:hidden gap-2">
            <Button
              variant="outline"
              onClick={() => setIsPassModalOpen(false)}
              className="rounded-xl px-4 py-2 border border-border text-foreground bg-white dark:bg-slate-900 hover:bg-muted/40 hover:scale-[1.03] transition-all duration-300 font-bold text-xs h-10 cursor-pointer shadow-xs"
            >
              Close Voucher
            </Button>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  const subject = encodeURIComponent(`Turf Booking Pass - ${generatedPass?.turfName}`);
                  const body = encodeURIComponent(`Hi ${generatedPass?.customerName},\n\nYour booking at ${generatedPass?.turfName} is confirmed.\n\nDate: ${generatedPass?.date}\nTime: ${generatedPass?.time}\nBooking ID: ${generatedPass?.id}\nAmount: ₹${generatedPass?.price}\n\nThank you!`);
                  window.location.href = `mailto:${generatedPass?.customerPhone}?subject=${subject}&body=${body}`;
                }}
                className="rounded-xl px-4 py-2 border border-border text-foreground bg-white dark:bg-slate-900 hover:bg-emerald-600 hover:text-black hover:border-emerald-600 hover:scale-[1.03] transition-all duration-300 font-bold text-xs h-10 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Mail className="w-4 h-4" />
                Email Pass
              </Button>
              <Button
                onClick={handlePrintPass}
                className="rounded-xl px-4 py-2 border border-border text-foreground bg-white dark:bg-slate-900 hover:bg-emerald-600 hover:text-black hover:border-emerald-600 hover:scale-[1.03] transition-all duration-300 font-bold text-xs h-10 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Print Pass
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------
          Block Custom Time Dialog Modal
          ------------------------------------------------------------- */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl border border-border/40 bg-popover shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-bold flex items-center gap-2">
              <Power className="h-5 w-5 text-amber-500" />
              Block Custom Time Range
            </DialogTitle>
            <DialogDescription className="text-xs">
              Block this turf for a specific time range (e.g. 10:15 AM to 12:10 PM) for maintenance, rain hold, or private coaching.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCustomBlockSubmit} className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Start Time</Label>
                <div className="flex gap-2">
                  <Input
                    value={customBlockForm.startTime}
                    onChange={(e) => setCustomBlockForm({ ...customBlockForm, startTime: e.target.value })}
                    placeholder="e.g. 10:15"
                    className="h-10 rounded-lg text-sm flex-1"
                    required
                  />
                  <Select
                    value={customBlockForm.startPeriod}
                    onValueChange={(val) => setCustomBlockForm({ ...customBlockForm, startPeriod: val })}
                  >
                    <SelectTrigger className="w-[75px] h-10 rounded-lg text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">End Time</Label>
                <div className="flex gap-2">
                  <Input
                    value={customBlockForm.endTime}
                    onChange={(e) => setCustomBlockForm({ ...customBlockForm, endTime: e.target.value })}
                    placeholder="e.g. 12:10"
                    className="h-10 rounded-lg text-sm flex-1"
                    required
                  />
                  <Select
                    value={customBlockForm.endPeriod}
                    onValueChange={(val) => setCustomBlockForm({ ...customBlockForm, endPeriod: val })}
                  >
                    <SelectTrigger className="w-[75px] h-10 rounded-lg text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reason for Blocking</Label>
              <Select
                value={customBlockForm.reason}
                onValueChange={(val) => setCustomBlockForm({ ...customBlockForm, reason: val })}
              >
                <SelectTrigger className="h-10 rounded-lg text-sm">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="Maintenance">Maintenance Hold</SelectItem>
                  <SelectItem value="Coaching">Coaching Session</SelectItem>
                  <SelectItem value="Private Event">Private / Owner Event</SelectItem>
                  <SelectItem value="Rain Hold">Rain / Bad Weather Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-500 rounded-xl text-xs flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>All regular hourly slots overlapping this custom range will be blocked from regular online booking.</p>
            </div>

            <DialogFooter className="mt-6 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBlockModalOpen(false)}
                className="rounded-xl px-4 border border-border text-foreground bg-white dark:bg-slate-900 hover:bg-muted/40 hover:scale-[1.02] transition-all font-bold text-xs h-10 cursor-pointer shadow-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl px-4 border border-border text-foreground bg-white dark:bg-slate-900 hover:bg-amber-500 hover:text-black hover:border-amber-500 hover:scale-[1.02] transition-all font-bold text-xs h-10 cursor-pointer shadow-xs"
              >
                Block Turf Now
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------
          Release Slot Dialog Modal
          ------------------------------------------------------------- */}
      <Dialog open={isReleaseModalOpen} onOpenChange={setIsReleaseModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl border border-border/40 bg-popover shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Release / Unblock Slot
            </DialogTitle>
            <DialogDescription className="text-xs">
              This action will release the blocked slot and mark it as Available for bookings again.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="p-4 rounded-xl border border-border bg-card/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Turf:</span>
                <span className="font-bold text-foreground">{selectedSlotForRelease?.turf.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Slot Time:</span>
                <span className="font-mono font-bold text-primary">
                  {selectedSlotForRelease && selectedSlotForRelease.slot.blockedTimeRange
                    ? selectedSlotForRelease.slot.blockedTimeRange
                    : selectedSlotForRelease && formatTimeRange(selectedSlotForRelease.slot.time)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold">Current Status:</span>
                <Badge variant="outline" className={selectedSlotForRelease?.slot.status === 'Booked' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}>
                  {selectedSlotForRelease?.slot.status}
                </Badge>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">Are you sure you want to proceed?</p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReleaseModalOpen(false)}
              className="rounded-xl px-4 border border-border text-foreground bg-white dark:bg-slate-900 hover:bg-muted/40 hover:scale-[1.02] transition-all font-bold text-xs h-10 cursor-pointer shadow-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleReleaseSlot}
              className="rounded-xl px-4 border border-border text-foreground bg-white dark:bg-slate-900 hover:bg-emerald-600 hover:text-black hover:border-emerald-600 hover:scale-[1.02] transition-all font-bold text-xs h-10 cursor-pointer shadow-xs"
            >
              Release Slot Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
