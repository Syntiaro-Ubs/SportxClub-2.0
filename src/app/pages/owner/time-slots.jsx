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
  CalendarDays,
  Trash2,
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

// Format time range e.g. "06:00", durationHours = 2 -> "06:00 am - 08:00 am"
const formatTimeRange = (time, durationHours = 1) => {
  if (!time) return "";
  const startHour = parseInt(time.split(':')[0], 10);
  const startPeriod = startHour >= 12 ? 'pm' : 'am';
  const start12 = startHour > 12 ? startHour - 12 : (startHour === 0 ? 12 : startHour);

  const totalEndHours = startHour + (durationHours || 1);
  const endHourRaw = totalEndHours % 24;
  const endPeriod = (totalEndHours >= 12 && totalEndHours < 24) || totalEndHours >= 36 ? 'pm' : 'am';
  const end12 = endHourRaw > 12 ? endHourRaw - 12 : (endHourRaw === 0 ? 12 : endHourRaw);

  return `${start12.toString().padStart(2, '0')}:00 ${startPeriod} - ${end12.toString().padStart(2, '0')}:00 ${endPeriod}`;
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
            btnClasses += "border-2 border-emerald-500 bg-transparent text-emerald-600 dark:text-emerald-400 font-extrabold shadow-xs";
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [turfs, setTurfs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [selectedTurfId, setSelectedTurfId] = useState("");
  const [selectedLegendFilter, setSelectedLegendFilter] = useState("all"); // 'all', 'Available', 'Booked', 'Maintenance'

  // Manual Booking State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);
  const [playHours, setPlayHours] = useState(1);
  const [hoveredSlotInfo, setHoveredSlotInfo] = useState(null);
  const [selectedDurationOption, setSelectedDurationOption] = useState("1"); // "1", "2", "3", "custom"
  const [isCustomDurationDialogOpen, setIsCustomDurationDialogOpen] = useState(false);
  const [tempCustomHours, setTempCustomHours] = useState(4);
  const [bookingDetails, setBookingDetails] = useState({
    customerName: "",
    customerPhone: "",
    paymentMethod: "cash"
  });

  // Turf Pass State
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [generatedPass, setGeneratedPass] = useState(null);

  // Custom Time Block & Multi-Day Date Range States
  const [bookingActionType, setBookingActionType] = useState("booking"); // 'booking' or 'block'
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedTurfForCustomBlock, setSelectedTurfForCustomBlock] = useState(null);
  const [customBlockForm, setCustomBlockForm] = useState({
    blockType: "single", // "single" or "multiday"
    daysPreset: "15", // "7", "15", "30", "custom"
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addDays(new Date(), 14), "yyyy-MM-dd"),
    timeScope: "custom", // "full" or "custom"
    startTime: "10:15",
    startPeriod: "AM",
    endTime: "12:10",
    endPeriod: "PM",
    reason: "Maintenance"
  });
  const [blockedSchedules, setBlockedSchedules] = useState([]);
  const [isSchedulesModalOpen, setIsSchedulesModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [selectedSlotForRelease, setSelectedSlotForRelease] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const savedMockTurfs = JSON.parse(localStorage.getItem("mock_turfs") || "[]");
        const approvedStr = localStorage.getItem("approved_turfs");

        let baseTurfs = [
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
        ];

        if (approvedStr) {
          const approved = JSON.parse(approvedStr);
          if (approved.length > 0) {
            baseTurfs = approved.map(item => ({
              id: String(item.id),
              name: item.turf?.name || item.name || "Sports Turf",
              location: item.location?.address ? `${item.location.address}, ${item.location.city}` : (item.location || 'Downtown Sports Complex'),
              sportType: item.turf?.sports && item.turf.sports.length > 0 ? item.turf.sports.join(" & ") : (item.sportType || "Cricket"),
              status: item.status || 'Active',
              slots: generateMockSlots(),
            }));
          }
        }

        // Merge savedMockTurfs edits into baseTurfs
        const allSaved = [...savedMockTurfs];
        const finalTurfs = baseTurfs.map(bt => {
          const match = allSaved.find(s => String(s.id) === String(bt.id));
          if (match) {
            return {
              ...bt,
              name: match.name || bt.name,
              location: match.location || bt.location,
              sportType: match.sportType || bt.sportType,
              status: match.status || bt.status,
              price: match.price || bt.price,
            };
          }
          return bt;
        });

        // Append any new custom created turfs
        allSaved.forEach(s => {
          if (!finalTurfs.some(ft => String(ft.id) === String(s.id))) {
            finalTurfs.push({
              id: String(s.id),
              name: s.name,
              location: s.location || 'Downtown Sports Complex',
              sportType: s.sportType || 'Cricket',
              status: s.status || 'Active',
              slots: generateMockSlots(),
            });
          }
        });

        setTurfs(finalTurfs);
        if (!selectedTurfId && finalTurfs.length > 0) {
          setSelectedTurfId(finalTurfs[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch turfs", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    const handleUpdate = () => fetchData();
    window.addEventListener("turf_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("turf_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
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

  // Filtered turfs computed state (selected turf or all turfs if selectedTurfId === "all")
  const filteredTurfs = useMemo(() => {
    if (!selectedTurfId || selectedTurfId === "all") return turfs;
    return turfs.filter(t => t.id === selectedTurfId);
  }, [turfs, selectedTurfId]);

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

  // Custom Time & Multi-Day Block Submission Handler
  const handleCustomBlockSubmit = (e) => {
    e.preventDefault();
    if (!selectedTurfForCustomBlock) return;

    const isMultiDay = customBlockForm.blockType === "multiday";
    const isFullDay = customBlockForm.timeScope === "full";

    const format12 = (timeStr, period) => `${timeStr} ${period}`;
    const timeLabel = isFullDay
      ? "Full Day Block (24 Hrs)"
      : `${format12(customBlockForm.startTime, customBlockForm.startPeriod)} - ${format12(customBlockForm.endTime, customBlockForm.endPeriod)}`;

    if (!isFullDay) {
      const startDec = timeToDecimal(customBlockForm.startTime, customBlockForm.startPeriod);
      const endDec = timeToDecimal(customBlockForm.endTime, customBlockForm.endPeriod);
      if (endDec <= startDec) {
        toast.error("End time must be after start time!");
        return;
      }
    }

    if (isMultiDay) {
      const startDateStr = customBlockForm.startDate;
      const endDateStr = customBlockForm.endDate;

      if (!startDateStr || !endDateStr || endDateStr < startDateStr) {
        toast.error("Invalid start or end date range!");
        return;
      }

      const newRule = {
        id: `rule-${Date.now()}`,
        turfId: selectedTurfForCustomBlock.id,
        turfName: selectedTurfForCustomBlock.name,
        blockType: "multiday",
        startDate: startDateStr,
        endDate: endDateStr,
        timeScope: customBlockForm.timeScope,
        startTime: customBlockForm.startTime,
        startPeriod: customBlockForm.startPeriod,
        endTime: customBlockForm.endTime,
        endPeriod: customBlockForm.endPeriod,
        reason: customBlockForm.reason,
        blockLabel: timeLabel
      };

      setBlockedSchedules(prev => [...prev, newRule]);
      toast.success(`Blocked ${selectedTurfForCustomBlock.name} from ${startDateStr} to ${endDateStr} (${timeLabel})`);
    } else {
      // Single day custom block for currently loaded slots
      const startDec = timeToDecimal(customBlockForm.startTime, customBlockForm.startPeriod);
      const endDec = timeToDecimal(customBlockForm.endTime, customBlockForm.endPeriod);

      const updatedTurfs = turfs.map(t => {
        if (t.id === selectedTurfForCustomBlock.id) {
          const updatedSlots = t.slots.map(slot => {
            const slotStartHour = parseInt(slot.time.split(':')[0], 10);
            const slotEndHour = slotStartHour + 1;
            const overlaps = isFullDay || (Math.max(slotStartHour, startDec) < Math.min(slotEndHour, endDec));

            if (overlaps) {
              return {
                ...slot,
                status: 'Maintenance',
                blockedTimeRange: timeLabel,
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
      toast.success(`Turf blocked for custom interval: ${timeLabel}`);
    }

    setIsBlockModalOpen(false);
    setSelectedTurfForCustomBlock(null);
  };

  const handleDeleteSchedule = (scheduleId) => {
    setBlockedSchedules(prev => prev.filter(s => s.id !== scheduleId));
    toast.success("Blocked schedule lifted successfully!");
  };

  // Helper: Evaluates dynamic slot status taking into account active multi-day schedules
  const getEffectiveSlot = (turfId, slot) => {
    const activeRule = blockedSchedules.find(rule => {
      if (rule.turfId !== turfId) return false;
      const sDateStr = rule.startDate;
      const eDateStr = rule.endDate;
      const selDateStr = format(selectedDate, "yyyy-MM-dd");

      if (selDateStr < sDateStr || selDateStr > eDateStr) return false;

      if (rule.timeScope === "full") return true;

      const startDec = timeToDecimal(rule.startTime, rule.startPeriod);
      const endDec = timeToDecimal(rule.endTime, rule.endPeriod);
      const slotStartHour = parseInt(slot.time.split(':')[0], 10);
      const slotEndHour = slotStartHour + 1;

      return Math.max(slotStartHour, startDec) < Math.min(slotEndHour, endDec);
    });

    if (activeRule) {
      return {
        ...slot,
        status: 'Maintenance',
        blockedTimeRange: activeRule.blockLabel,
        blockedReason: activeRule.reason
      };
    }
    return slot;
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
    <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto theme-adaptive pb-16">

      {/* -------------------------------------------------------------
          Header Title & Details Row
          ------------------------------------------------------------- */}
      <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-6 py-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground shrink-0">
            Turf Slot Management
          </h1>

          {/* Turf, Duration & Calendar Selector Row */}
          <div className="flex flex-row flex-wrap items-center gap-2 shrink-0">

            {/* Turf Selector Dropdown */}
            <div className="flex-1 sm:flex-initial sm:w-[145px] min-w-0">
              <Select value={selectedTurfId} onValueChange={setSelectedTurfId}>
                <SelectTrigger className="h-10 rounded-lg bg-background/50 border border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-emerald-500/30 text-xs font-bold transition-all w-full flex items-center justify-between gap-1 px-3 overflow-hidden">
                  <SelectValue placeholder="Select Turf" className="truncate" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40 shadow-xl bg-popover z-50">
                  <SelectItem value="all" className="text-xs font-extrabold py-2.5 px-3 rounded-lg cursor-pointer focus:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10">
                    ⚡ All Turfs
                  </SelectItem>
                  {turfs.map(turf => (
                    <SelectItem key={turf.id} value={turf.id} className="text-xs font-bold py-2.5 px-3 rounded-lg cursor-pointer">
                      <span className="truncate min-w-0 flex-1">{turf.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Selector Dropdown */}
            <div className="flex-1 sm:flex-initial sm:w-[145px] min-w-0">
              <Select
                value={selectedDurationOption}
                onValueChange={(val) => {
                  setSelectedDurationOption(val);
                  if (val === "1") setPlayHours(1);
                  else if (val === "2") setPlayHours(2);
                  else if (val === "3") setPlayHours(3);
                  else if (val === "custom") {
                    setIsCustomDurationDialogOpen(true);
                  }
                }}
              >
                <SelectTrigger className="h-10 rounded-lg bg-background/50 border border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-emerald-500/30 text-xs font-bold transition-all w-full flex items-center justify-between gap-1 px-3 overflow-hidden">
                  <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                    <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <SelectValue placeholder="Duration" className="truncate" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40 shadow-xl bg-popover z-50">
                  <SelectItem value="1" className="text-xs font-bold py-2.5 px-3 rounded-lg cursor-pointer">
                    1 Hour
                  </SelectItem>
                  <SelectItem value="2" className="text-xs font-bold py-2.5 px-3 rounded-lg cursor-pointer">
                    2 Hours
                  </SelectItem>
                  <SelectItem value="3" className="text-xs font-bold py-2.5 px-3 rounded-lg cursor-pointer">
                    3 Hours
                  </SelectItem>
                  <SelectItem value="custom" className="text-xs font-extrabold py-2.5 px-3 rounded-lg cursor-pointer text-emerald-600 dark:text-emerald-400 focus:bg-emerald-500/10 hover:bg-emerald-500/10">
                    ⚙️ Custom
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Selector Popover (Calendar) */}
            <div className="flex-1 sm:flex-initial sm:w-[145px] min-w-0">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-start gap-1.5 px-3 h-10 w-full rounded-lg bg-background/50 border border-slate-300 dark:border-slate-700 text-xs font-bold text-foreground hover:bg-muted/30 transition-all cursor-pointer shadow-2xs min-w-0 overflow-hidden"
                    title="Select specific date"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{format(selectedDate, 'MMM dd, yyyy')}</span>
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
            </div>
          </div>
        </div>

        {blockedSchedules.length > 0 && (
          <div className="shrink-0">
            <Button
              onClick={() => setIsSchedulesModalOpen(true)}
              className="h-10 px-4 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
              Active Holds ({blockedSchedules.length})
            </Button>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          Turfs Grid & Matrix Slots
          ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-8 w-full max-w-full">
        {filteredTurfs.length > 0 ? (
          filteredTurfs.map(turf => {
            const availableSlots = turf.status === 'Active' ? turf.slots.filter(s => s.status === 'Available').length : 0;
            return (
              <Card
                key={turf.id}
                className="gap-0 border-border/40 bg-card/30 backdrop-blur-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/20 rounded-2xl flex flex-col justify-between"
              >
                {/* Card Header Section */}
                <CardHeader className="border-b border-border/40 bg-muted/20 py-2.5 [.border-b]:pb-2.5 px-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4 w-full">
                    {/* Left Side: Turf Title & Badges */}
                    <div>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl font-black tracking-tight text-foreground">{turf.name}</CardTitle>
                        {turf.status === 'Active' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] uppercase tracking-widest font-extrabold rounded-lg px-2.5 py-0.5">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] uppercase tracking-widest font-extrabold rounded-lg px-2.5 py-0.5">
                            Closed
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                        <span className="text-primary font-bold">{turf.sportType}</span>
                        <span className="opacity-40">&bull;</span>
                        <span>{typeof turf.location === 'object' ? (turf.location?.city || turf.location?.address || 'Location unavailable') : turf.location}</span>
                      </CardDescription>
                    </div>

                    {/* Bottom Row: Date + Slots Left Badge + Block Custom Time */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {/* Date Display */}
                      <div className="flex items-center gap-1.5 bg-background/60 px-3 py-1.5 rounded-lg border border-border/40 shadow-2xs shrink-0">
                        <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-bold text-foreground tracking-wide">
                          {format(selectedDate, 'EEEE, MMM dd')}
                        </span>
                      </div>



                      {/* Block Custom Time Button */}
                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedTurfForCustomBlock(turf);
                          setIsBlockModalOpen(true);
                        }}
                        className="h-8 rounded-lg bg-background text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 border border-rose-500/50 hover:border-rose-600 text-[11px] font-extrabold tracking-wider px-3 py-1 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shadow-2xs shrink-0"
                      >
                        <Power className="w-3.5 h-3.5 text-rose-500" /> Manage Availability
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Card Content Section */}
                <CardContent className="px-4 pt-1.5 pb-3 relative flex-1">

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



                  {/* Grid Slots - Dynamically Grouped by Selected Duration */}
                  <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2.5 transition-all duration-300 ${turf.status === 'Closed' ? 'opacity-20 pointer-events-none' : ''
                    }`}>
                    {(() => {
                      const effectiveSlots = turf.slots.map(rawSlot => getEffectiveSlot(turf.id, rawSlot));
                      const groupedSlots = [];
                      const step = Math.max(1, playHours);

                      for (let i = 0; i < effectiveSlots.length; i += step) {
                        const actualDur = Math.min(step, effectiveSlots.length - i);
                        let totalPrice = 0;
                        let hasBooked = false;
                        let hasMaintenance = false;

                        for (let j = 0; j < actualDur; j++) {
                          const s = effectiveSlots[i + j];
                          totalPrice += s.price;
                          if (s.status === 'Booked') hasBooked = true;
                          else if (s.status === 'Maintenance') hasMaintenance = true;
                        }

                        let groupStatus = 'Available';
                        if (hasBooked) groupStatus = 'Booked';
                        else if (hasMaintenance) groupStatus = 'Maintenance';

                        const firstSlot = effectiveSlots[i];
                        groupedSlots.push({
                          slot: { ...firstSlot, status: groupStatus, price: totalPrice },
                          startIndex: i,
                          duration: actualDur,
                          price: totalPrice,
                          status: groupStatus,
                          displayTime: formatTimeRange(firstSlot.time, actualDur)
                        });
                      }

                      return groupedSlots.map((item, idx) => {
                        const { slot, startIndex, displayTime, status, price } = item;
                        const isFilteredOut = selectedLegendFilter !== "all" && status !== selectedLegendFilter;

                        // Available Grouped Slot
                        if (status === 'Available') {
                          return (
                            <div
                              key={idx}
                              onClick={() => handleSlotClick(turf, slot, startIndex)}
                              onMouseEnter={() => handleSlotMouseEnter(turf, startIndex)}
                              onMouseLeave={handleSlotMouseLeave}
                              className={`p-2 sm:p-2.5 rounded-xl border-2 border-emerald-500/40 bg-card hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 min-h-[68px] w-full max-w-full overflow-hidden ${isFilteredOut ? 'opacity-20 border-transparent shadow-none scale-[0.96] pointer-events-none' : ''}`}
                            >
                              <span className="font-extrabold text-[10px] sm:text-xs text-foreground tracking-tight truncate max-w-full text-center px-0.5">{displayTime}</span>
                              <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400">
                                Available {playHours > 1 ? `(${item.duration}h)` : ''}
                              </span>
                              <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">₹{price}</span>
                            </div>
                          );
                        }

                        // Booked Grouped Slot
                        if (status === 'Booked') {
                          const bDetails = getBookingDetailsMock(slot.time);
                          return (
                            <div
                              key={idx}
                              onClick={() => handleSlotClick(turf, slot, startIndex)}
                              className={`relative group/slot p-2 sm:p-2.5 rounded-xl border-2 border-rose-500/40 bg-card hover:border-rose-500 hover:shadow-md hover:-translate-y-0.5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 min-h-[68px] w-full max-w-full overflow-hidden ${isFilteredOut ? 'opacity-20 border-transparent shadow-none scale-[0.96] pointer-events-none' : ''}`}
                            >
                              <span className="font-extrabold text-[10px] sm:text-xs text-foreground tracking-tight truncate max-w-full text-center px-0.5">{displayTime}</span>
                              <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-500">BOOKED</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center gap-1 truncate max-w-full">
                                <Lock className="w-2.5 h-2.5 text-rose-500 shrink-0" /> <span className="truncate">Release Slot</span>
                              </span>
                            </div>
                          );
                        }

                        // Maintenance Grouped Slot
                        if (status === 'Maintenance') {
                          return (
                            <div
                              key={idx}
                              onClick={() => handleSlotClick(turf, slot, startIndex)}
                              className={`p-2 sm:p-2.5 rounded-xl border-2 border-amber-500/40 bg-amber-500/5 hover:border-amber-500 hover:shadow-md flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all duration-200 min-h-[68px] w-full max-w-full overflow-hidden ${isFilteredOut ? 'opacity-20 border-transparent shadow-none scale-[0.96] pointer-events-none' : ''}`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                              <span className="font-extrabold text-[10px] sm:text-xs text-foreground text-center tracking-tight truncate max-w-full px-0.5">{displayTime}</span>
                              <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-500">MAINTENANCE</span>
                            </div>
                          );
                        }

                        return null;
                      });
                    })()}
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
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border-2 ${bookingActionType === "booking"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent font-extrabold shadow-xs"
                  : "border-transparent text-muted-foreground hover:bg-muted/40"
                  }`}
              >
                Walk-in Booking
              </button>
              <button
                type="button"
                onClick={() => setBookingActionType("block")}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border-2 ${bookingActionType === "block"
                  ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-transparent font-extrabold shadow-xs"
                  : "border-transparent text-muted-foreground hover:bg-muted/40"
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
                    placeholder="Enter Name"
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
                    placeholder="Enter Mobile No"
                    value={bookingDetails.customerPhone}
                    onChange={(e) => setBookingDetails({ ...bookingDetails, customerPhone: e.target.value })}
                    className="h-10 rounded-lg text-sm"
                    required={bookingActionType === "booking"}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cust-payment" className="text-xs font-semibold">Payment Mode</Label>
                  <Select
                    value={bookingDetails.paymentMethod}
                    onValueChange={(val) => setBookingDetails({ ...bookingDetails, paymentMethod: val })}
                  >
                    <SelectTrigger id="cust-payment" className="h-10 rounded-lg text-sm">
                      <SelectValue placeholder="Payment Mode" />
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
                variant="outline"
                className="rounded-xl px-5 h-10 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 bg-transparent hover:bg-transparent hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs transition-colors cursor-pointer shadow-none"
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
                <p className="text-xs text-muted-foreground mt-0.5">{typeof generatedPass?.location === 'object' ? (generatedPass.location?.city || generatedPass.location?.address || 'Location unavailable') : generatedPass?.location}</p>
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
          Block Custom Time & Multi-Day Date Range Dialog Modal
          ------------------------------------------------------------- */}
      <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl border border-border/40 bg-popover shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-bold flex items-center gap-2">
              <Power className="h-5 w-5 text-emerald-500" />
              Block Turf Time & Date Range
            </DialogTitle>
            <DialogDescription className="text-xs">
              Block this facility for a single day or a multi-day date range (e.g. 15 Days maintenance, rain hold).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCustomBlockSubmit} className="space-y-4 py-2">
            {/* 1. Mode Selector: Single Day vs Multi-Day */}
            <div className="grid grid-cols-2 gap-2 bg-muted/40 p-1 rounded-xl border border-border/40">
              <button
                type="button"
                onClick={() => setCustomBlockForm(prev => ({ ...prev, blockType: "single" }))}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border-2 ${customBlockForm.blockType === "single"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent font-extrabold"
                  : "border-transparent text-muted-foreground hover:bg-muted/40"
                  }`}
              >
                Single Day Block
              </button>
              <button
                type="button"
                onClick={() => setCustomBlockForm(prev => ({ ...prev, blockType: "multiday" }))}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer border-2 ${customBlockForm.blockType === "multiday"
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-transparent font-extrabold"
                  : "border-transparent text-muted-foreground hover:bg-muted/40"
                  }`}
              >
                Multi-Day Date Range
              </button>
            </div>

            {/* Multi-Day Controls */}
            {customBlockForm.blockType === "multiday" && (
              <div className="space-y-3 p-3 bg-muted/20 rounded-xl border border-border/30">
                {/* Presets Bar */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1">Presets:</span>
                  {[
                    { label: "7 Days", days: 6 },
                    { label: "15 Days", days: 14 },
                    { label: "30 Days", days: 29 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        const start = format(selectedDate, "yyyy-MM-dd");
                        const end = format(addDays(selectedDate, p.days), "yyyy-MM-dd");
                        setCustomBlockForm(prev => ({ ...prev, startDate: start, endDate: end }));
                      }}
                      className="px-2.5 py-1 text-[10px] font-extrabold rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 cursor-pointer transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Date Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">Start Date</Label>
                    <Input
                      type="date"
                      value={customBlockForm.startDate}
                      onChange={(e) => setCustomBlockForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="h-9 text-xs rounded-lg"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">End Date</Label>
                    <Input
                      type="date"
                      value={customBlockForm.endDate}
                      onChange={(e) => setCustomBlockForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="h-9 text-xs rounded-lg"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. Time Scope: Full Day vs Custom Range */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Time Scope</Label>
              <div className="grid grid-cols-2 gap-2 bg-muted/30 p-1 rounded-xl border border-border/40">
                <button
                  type="button"
                  onClick={() => setCustomBlockForm(prev => ({ ...prev, timeScope: "custom" }))}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${customBlockForm.timeScope === "custom"
                    ? "bg-background text-foreground border border-border shadow-xs font-extrabold"
                    : "text-muted-foreground hover:bg-muted/30"
                    }`}
                >
                  Specific Hours
                </button>
                <button
                  type="button"
                  onClick={() => setCustomBlockForm(prev => ({ ...prev, timeScope: "full" }))}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${customBlockForm.timeScope === "full"
                    ? "bg-background text-foreground border border-border shadow-xs font-extrabold"
                    : "text-muted-foreground hover:bg-muted/30"
                    }`}
                >
                  Full Day (24 Hours)
                </button>
              </div>
            </div>

            {/* Specific Hours Inputs */}
            {customBlockForm.timeScope === "custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Start Time</Label>
                  <div className="flex items-center w-[140px] rounded-xl border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
                    <Input
                      value={customBlockForm.startTime}
                      onChange={(e) => setCustomBlockForm({ ...customBlockForm, startTime: e.target.value })}
                      placeholder="10:15"
                      className="h-10 border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm flex-1 bg-transparent shadow-none px-3"
                      required
                    />
                    <div className="h-5 w-px bg-border/60 shrink-0" />
                    <Select
                      value={customBlockForm.startPeriod}
                      onValueChange={(val) => setCustomBlockForm({ ...customBlockForm, startPeriod: val })}
                    >
                      <SelectTrigger className="w-[62px] h-10 border-0 rounded-none focus:ring-0 focus:ring-offset-0 text-sm bg-transparent shadow-none px-2">
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
                  <div className="flex items-center w-[140px] rounded-xl border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
                    <Input
                      value={customBlockForm.endTime}
                      onChange={(e) => setCustomBlockForm({ ...customBlockForm, endTime: e.target.value })}
                      placeholder="12:10"
                      className="h-10 border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm flex-1 bg-transparent shadow-none px-3"
                      required
                    />
                    <div className="h-5 w-px bg-border/60 shrink-0" />
                    <Select
                      value={customBlockForm.endPeriod}
                      onValueChange={(val) => setCustomBlockForm({ ...customBlockForm, endPeriod: val })}
                    >
                      <SelectTrigger className="w-[62px] h-10 border-0 rounded-none focus:ring-0 focus:ring-offset-0 text-sm bg-transparent shadow-none px-2">
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
            )}

            {/* Reason Selector */}
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
                  <SelectItem value="Monsoon Hold">Monsoon / Rain Hold</SelectItem>
                  <SelectItem value="Coaching">Coaching Session</SelectItem>
                  <SelectItem value="Private Event">Private / Owner Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <p>
                {customBlockForm.blockType === "multiday"
                  ? `Slots will be automatically blocked from ${customBlockForm.startDate} to ${customBlockForm.endDate}.`
                  : "All regular hourly slots overlapping this custom range will be blocked."}
              </p>
            </div>

            <DialogFooter className="mt-5 gap-2">
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
                className="rounded-xl px-5 border border-emerald-500/60 text-foreground bg-background hover:bg-emerald-500/10 hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-extrabold text-xs h-10 cursor-pointer transition-all"
              >
                Block Turf Now
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* -------------------------------------------------------------
          Active Blocked Schedules Dialog Modal
          ------------------------------------------------------------- */}
      <Dialog open={isSchedulesModalOpen} onOpenChange={setIsSchedulesModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-border/40 bg-popover shadow-xl">
          <DialogHeader>
            <DialogTitle className="font-bold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-emerald-500" />
              Active Multi-Day Blocked Schedules
            </DialogTitle>
            <DialogDescription className="text-xs">
              Manage multi-day date range holds across your facilities. Click Lift Hold to unblock immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3 max-h-[350px] overflow-y-auto pr-1">
            {blockedSchedules.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No active multi-day block schedules.</p>
            ) : (
              blockedSchedules.map((item) => (
                <div key={item.id} className="p-3 rounded-xl border border-border/50 bg-card flex items-center justify-between gap-3 shadow-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">{item.turfName}</span>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[8.5px] font-bold">
                        {item.reason}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                      {item.startDate} to {item.endDate}
                    </p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-500" />
                      {item.blockLabel}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteSchedule(item.id)}
                    className="h-8 px-2.5 rounded-lg border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-[10px] font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Lift Hold
                  </Button>
                </div>
              ))
            )}
          </div>
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

      {/* -------------------------------------------------------------
          Custom Play Duration Dialog Modal
          ------------------------------------------------------------- */}
      <Dialog open={isCustomDurationDialogOpen} onOpenChange={setIsCustomDurationDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border border-border/40 bg-popover p-6 shadow-2xl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" />
              Custom Play Duration
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select consecutive hours for walk-in bookings and slot reservations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-foreground">Duration (in Hours)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={tempCustomHours}
                  onChange={(e) => setTempCustomHours(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                  className="h-10 text-sm font-bold text-center rounded-xl border-emerald-500/40"
                />
                <span className="text-xs font-extrabold text-muted-foreground shrink-0">Hour(s)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {[4, 5, 6, 8].map(h => (
                <Button
                  key={h}
                  type="button"
                  variant="outline"
                  onClick={() => setTempCustomHours(h)}
                  className={`flex-1 h-8 rounded-lg text-xs font-bold ${tempCustomHours === h ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : ''}`}
                >
                  {h} hrs
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCustomDurationDialogOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPlayHours(tempCustomHours);
                setSelectedDurationOption("custom");
                setIsCustomDurationDialogOpen(false);
              }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 bg-transparent hover:bg-transparent hover:border-emerald-600 dark:hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-xs px-5 transition-colors cursor-pointer shadow-none"
            >
              Apply Duration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TimeSlots;
