import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../providers/auth-provider";
import {
  ArrowRight,
  Calendar,
  Check,
  Heart,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Share2,
  Star,
  Wifi,
  Car,
  Coffee,
  Droplets,
  Shirt,
  Users,
  Trophy,
  Plus,
  Target,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { AnimatePresence } from "motion/react";
import { cn } from "../components/ui/utils";

const asset = (path) => `/assets${path}`;

const venue = {
  name: "Elite Turf Arena",
  location: "Powai, Mumbai",
  address: "123 Sports Complex, Hiranandani Gardens, Powai, Mumbai - 400076",
  rating: 4.9,
  reviews: 234,
  price: 1200,
  sport: "Football",
  description:
    "Elite Turf Arena is built for fast discovery and confident booking. The venue combines reliable lighting, verified access, and clear refund terms so players can decide quickly.",
};

const gallery = [
  asset("/venues/turf-1.webp"),
  asset("/venues/turf-2.webp"),
  asset("/venues/turf-3.webp"),
  asset("/venues/turf-4.webp"),
];

const amenities = [
  { icon: Car, label: "Free parking" },
  { icon: Shirt, label: "Changing rooms" },
  { icon: Droplets, label: "Showers" },
  { icon: Wifi, label: "Free Wi-Fi" },
  { icon: Coffee, label: "Cafe" },
  { icon: Users, label: "Coaching available" },
];

const slots = [
  { time: "6:00 AM - 7:00 AM", available: true },
  { time: "7:00 AM - 8:00 AM", available: true },
  { time: "8:00 AM - 9:00 AM", available: false },
  { time: "9:00 AM - 10:00 AM", available: true },
  { time: "10:00 AM - 11:00 AM", available: true },
  { time: "5:00 PM - 6:00 PM", available: true },
  { time: "6:00 PM - 7:00 PM", available: false },
  { time: "7:00 PM - 8:00 PM", available: true },
];

const reviews = [
  {
    name: "Rahul Sharma",
    rating: 5,
    date: "2 days ago",
    comment:
      "Excellent facility with clean turf and fast booking. The trust signals make the decision easy.",
  },
  {
    name: "Priya Patel",
    rating: 5,
    date: "1 week ago",
    comment:
      "Very professional experience. The slot selection and review details feel much more polished now.",
  },
  {
    name: "Arjun Malhotra",
    rating: 4,
    date: "2 weeks ago",
    comment:
      "Great lighting and easy access. The app makes comparison and booking simple.",
  },
];

const bookingFlow = ["Search", "Filter", "Slot selection", "Payment"];

export function VenueDetails() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState("Football");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [startTime, setStartTime] = useState("18:00");
  const [playHours, setPlayHours] = useState(1);
  const [isMobileBookingOpen, setIsMobileBookingOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const timeSlots = [
    { startHour: 15, label: "03:00 PM", endLabel: "04:00 PM" },
    { startHour: 16, label: "04:00 PM", endLabel: "05:00 PM" },
    { startHour: 17, label: "05:00 PM", endLabel: "06:00 PM", bookedBy: "Team Alpha" },
    { startHour: 18, label: "06:00 PM", endLabel: "07:00 PM" },
    { startHour: 19, label: "07:00 PM", endLabel: "08:00 PM" },
    { startHour: 20, label: "08:00 PM", endLabel: "09:00 PM" },
    { startHour: 21, label: "09:00 PM", endLabel: "10:00 PM" },
    { startHour: 22, label: "10:00 PM", endLabel: "11:00 PM", bookedBy: "Late Night Book" },
  ];

  const formatSlotRange = (startHour, hours) => {
    const formatHour = (h) => {
      const isPm = h >= 12 && h < 24;
      let hourNum = h % 12;
      if (hourNum === 0) hourNum = 12;
      const amPm = h >= 24 || h < 12 ? "AM" : "PM";
      const displayHour = h === 24 ? "12" : hourNum.toString();
      const displayAmPm = h === 24 ? "AM" : amPm;
      return `${displayHour.padStart(2, '0')}:00 ${displayAmPm}`;
    };

    const startStr = formatHour(startHour);
    const endStr = formatHour(startHour + hours);
    return `${startStr} - ${endStr}`;
  };

  const getStartHour = (timeStr) => {
    return parseInt(timeStr.split(":")[0]);
  };

  const hourToTimeStr = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const isOverlapping = (startHour) => {
    for (let i = 0; i < playHours; i++) {
      const checkHour = startHour + i;
      const slot = timeSlots.find(s => s.startHour === checkHour);
      if (slot && slot.bookedBy) {
        return true;
      }
    }
    return false;
  };

  const isOutOfBounds = (startHour) => {
    return startHour + playHours > 23;
  };

  useEffect(() => {
    const currentHour = getStartHour(startTime);
    if (isOverlapping(currentHour) || isOutOfBounds(currentHour)) {
      const firstAvailable = timeSlots.find(
        s => !s.bookedBy && !isOverlapping(s.startHour) && !isOutOfBounds(s.startHour)
      );
      if (firstAvailable) {
        setStartTime(hourToTimeStr(firstAvailable.startHour));
      }
    }
  }, [playHours]);

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      toast.success("Added to favorites!");
    } else {
      toast.info("Removed from favorites.");
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: venue.name || "SportXClub Venue",
      text: `Check out ${venue.name || "this venue"} on SportXClub!`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (err) {
        if (err.name !== "AbortError") {
          toast.error("Could not share.");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link.");
      }
    }
  };

  useEffect(() => {
    if (isMobileBookingOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileBookingOpen]);

  const renderBookingFields = () => (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm text-white/78">Select sport</p>
        <Select value={selectedSport} onValueChange={setSelectedSport}>
          <SelectTrigger className="w-1/2 h-[52px] rounded-[18px] border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white hover:bg-white/[0.06] transition-colors">
            <SelectValue placeholder="Select a sport" />
          </SelectTrigger>
          <SelectContent
            className="theme-adaptive rounded-[18px] border-white/[0.08] bg-[#101216] text-white"
            style={{ backgroundColor: '#101216', borderColor: 'rgba(255,255,255,0.08)', color: 'white' }}
          >
            {["Football", "Cricket", "Basketball"].map((item) => (
              <SelectItem
                key={item}
                value={item}
                className="rounded-[12px] my-1 data-[highlighted]:bg-[#6DFF3B]/10 data-[highlighted]:text-[#6DFF3B] cursor-pointer focus:bg-[#6DFF3B]/10 focus:text-[#6DFF3B]"
              >
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-white/78">Select date</p>
        <label className="flex items-center gap-3 rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
          <Calendar className="h-4 w-4 text-[#6DFF3B]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none"
          />
        </label>
      </div>

      <div className="space-y-3 pt-2">
        <p className="text-sm text-white/78">Duration</p>
        <Select value={playHours.toString()} onValueChange={(val) => setPlayHours(parseInt(val))}>
          <SelectTrigger className="w-full h-[52px] rounded-[18px] border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white hover:bg-white/[0.06] transition-colors">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent
            className="theme-adaptive rounded-[18px] border-white/[0.08] bg-[#101216] text-white"
            style={{ backgroundColor: '#101216', borderColor: 'rgba(255,255,255,0.08)', color: 'white' }}
          >
            {[1, 2, 3, 4].map((hours) => (
              <SelectItem
                key={hours}
                value={hours.toString()}
                className="rounded-[12px] my-1 data-[highlighted]:bg-[#6DFF3B]/10 data-[highlighted]:text-[#6DFF3B] cursor-pointer focus:bg-[#6DFF3B]/10 focus:text-[#6DFF3B]"
              >
                {hours} {hours === 1 ? "Hour" : "Hours"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 pt-2">
        <p className="text-sm text-white/78 flex justify-between">
          <span>Select start time</span>
        </p>
        <div className="grid gap-3 grid-cols-3">
          {timeSlots.map((slot) => {
            const slotHour = slot.startHour;
            const isBooked = !!slot.bookedBy;
            const overlaps = isOverlapping(slotHour);
            const outOfBounds = isOutOfBounds(slotHour);
            const isDisabled = isBooked || overlaps || outOfBounds;
            
            const isSelected = getStartHour(startTime) === slotHour;
            
            // Format time range with line break for PM/AM to match screenshot wrapping
            const formatHour = (h) => {
              let hourNum = h % 12;
              if (hourNum === 0) hourNum = 12;
              const amPm = h >= 24 || h < 12 ? "AM" : "PM";
              const displayHour = h === 24 ? "12" : hourNum.toString();
              return `${displayHour.padStart(2, '0')}:00 ${amPm}`;
            };
            const startStr = formatHour(slotHour);
            const endStr = formatHour(slotHour + playHours);
            const timeRange = `${startStr} - ${endStr}`;

            return (
              <button
                key={slotHour}
                type="button"
                disabled={isDisabled}
                onClick={() => setStartTime(hourToTimeStr(slotHour))}
                className={`p-3 rounded-[16px] border flex flex-col items-center justify-center transition-all min-h-[80px] text-center relative ${
                  isSelected
                    ? "bg-[#6DFF3B] border-[#6DFF3B] shadow-md shadow-[#6DFF3B]/20"
                    : isDisabled
                    ? "bg-red-500/10 border-red-500/20 cursor-not-allowed"
                    : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.15] cursor-pointer"
                }`}
              >
                <span className={`text-[11px] font-mono leading-relaxed max-w-[90px] mx-auto ${isSelected ? 'text-black font-bold' : isDisabled ? 'text-white/50' : 'text-white/70'}`}>
                  {timeRange}
                </span>
                
                <span className={`text-[9px] font-extrabold mt-1.5 uppercase tracking-wider ${
                  isSelected ? 'text-black' : isDisabled ? 'text-red-400' : 'text-[#6DFF3B]/80'
                }`}>
                  {isDisabled ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[20px] border border-[#6DFF3B]/18 bg-[#6DFF3B]/10 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[#6DFF3B]/80 font-bold">
          Review booking
        </p>
        <div className="mt-3 space-y-2 text-sm text-white/72">
          <div className="flex justify-between">
            <span>Sport:</span>
            <span className="text-white font-medium">{selectedSport}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span className="text-white font-medium">{selectedDate}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="shrink-0">Start Time:</span>
            <span className="text-white font-medium text-right max-w-[170px] break-words">
              {formatSlotRange(getStartHour(startTime), playHours)}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="shrink-0">Duration:</span>
            <span className="text-white font-medium text-right max-w-[170px] break-words">
              {playHours} hour{playHours > 1 ? "s" : ""}
            </span>
          </div>
          <div className="border-t border-white/10 pt-2 mt-1 flex justify-between items-center">
            <span className="text-xs text-white/50">Total Price ({playHours} hr{playHours > 1 ? "s" : ""}):</span>
            <span className="text-[#6DFF3B] text-base font-bold">₹{venue.price * playHours}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookingActions = () => (
    <div className="space-y-3">
      <div
        className="block cursor-pointer"
        onClick={() => {
          if (!currentUser) {
            toast.error("Please login first to continue to payment.");
            navigate("/login");
          } else {
            sessionStorage.setItem("sportxclub_booking", JSON.stringify({
              venue: venue.name,
              sport: selectedSport,
              date: selectedDate,
              time: `${startTime} for ${playHours} hour${playHours > 1 ? "s" : ""}`,
              price: venue.price * playHours,
            }));
            navigate("/payment");
          }
        }}
      >
        <Button className="h-12 w-full rounded-[18px] bg-[#6DFF3B] text-[#050505] hover:bg-[#86ff60] font-semibold transition-all">
          Continue to payment
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="ghost"
          className="h-11 rounded-[16px] border border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06] w-full"
        >
          <Phone className="h-4 w-4 mr-2" />
          Call venue
        </Button>
        <Button
          variant="ghost"
          className="h-11 rounded-[16px] border border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06] w-full"
        >
          <Menu className="h-4 w-4 mr-2" />
          Compare
        </Button>
      </div>
    </div>
  );

  const renderBookingFlow = () => (
    <div className="flex flex-col space-y-5 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">
            Booking flow
          </p>
          <h2 className="mt-2 text-xl text-white">
            Select sport, date, and slot
          </h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center shrink-0 rounded-full border border-[#6DFF3B]/18 bg-[#6DFF3B]/10">
          <Calendar className="h-5 w-5 text-[#6DFF3B]" />
        </div>
      </div>

      {renderBookingFields()}
      {renderBookingActions()}
    </div>
  );

  return (
    <div className="theme-adaptive bg-[#050505] text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6 pb-6 sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
        <Link
          to="/venues"
          className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white/72 transition hover:border-[#6DFF3B]/25 hover:bg-[#6DFF3B]/10"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to venues
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-1">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#101216]">
              <div className="relative w-full h-[280px] sm:h-auto sm:aspect-[16/9] overflow-hidden">
                <ImageWithFallback
                  src={gallery[0]}
                  alt={venue.name}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 image-overlay bg-[linear-gradient(180deg,rgba(5,5,5,0.06),rgba(5,5,5,0.82))]" />
                <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                  <Badge className="rounded-full border border-white/[0.08] bg-[#050505]/70 px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-[#ffffff]/78">
                    Secure payment
                  </Badge>
                </div>
                <div className="absolute right-5 top-5 flex gap-3">
                  <button
                    type="button"
                    onClick={handleFavoriteClick}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-[#050505]/70 text-[#ffffff]/80 backdrop-blur-md transition-all hover:bg-[#050505]/90 hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Add to favorites"
                  >
                    <Heart className={`h-4 w-4 transition-colors ${isFavorite ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleShareClick}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-[#050505]/70 text-[#ffffff]/80 backdrop-blur-md transition-all hover:bg-[#050505]/90 hover:scale-105 active:scale-95 cursor-pointer"
                    aria-label="Share venue"
                  >
                    <Share2 className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 right-4 md:bottom-5 md:left-5 md:max-w-xl">
                  <p className="text-sm uppercase tracking-[0.26em] text-[#6DFF3B]/80">
                    Sports venue
                  </p>
                  <h1 className="mt-3 text-3xl  tracking-tight text-[#ffffff] md:text-5xl">
                    {venue.name}
                  </h1>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#ffffff]/72">
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#6DFF3B]" />
                      {venue.location}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5">
                      <Star className="h-4 w-4 fill-[#6DFF3B] text-[#6DFF3B]" />
                      {venue.rating.toFixed(1)} ({venue.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-4 md:grid-cols-4">
                {gallery.map((image, index) => (
                  <div
                    key={image}
                    className="relative aspect-[4/3] w-full overflow-hidden rounded-[20px]"
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${venue.name} gallery ${index + 1}`}
                      className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>



            <Card className="rounded-[28px] border-white/[0.08] bg-[#101216]">
              <CardContent className="space-y-6 p-6 md:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[0.72rem]  uppercase tracking-[0.36em] text-[#6DFF3B]/85">
                      Overview
                    </p>
                    <h2 className="mt-3 text-2xl  text-white">
                      Book with confidence
                    </h2>
                  </div>

                </div>

                <p className="max-w-3xl text-sm leading-7 text-white/64 md:text-base">
                  {venue.description}
                </p>

                <div className="grid gap-3 md:grid-cols-3">
                  {["Real reviews", "Easy refund", "Secure payment"].map(
                    (item) => (
                      <div
                        key={item}
                        className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6DFF3B]/18 bg-[#6DFF3B]/10">
                            <ShieldCheck className="h-4 w-4 text-[#6DFF3B]" />
                          </div>
                          <p className=" text-white">{item}</p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-4">
              {bookingFlow.map((step, index) => (
                <div
                  key={step}
                  className={`rounded-[20px] border p-4 ${index === 2
                    ? "border-[#6DFF3B]/30 bg-[#6DFF3B]/10"
                    : "border-white/[0.08] bg-[#101216]"
                    }`}
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 text-sm  text-white">{step}</p>
                </div>
              ))}
            </div>

            <Card className="rounded-[28px] border-white/[0.08] bg-[#101216]">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl  text-white">Amenities</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {amenities.map((amenity) => {
                    const Icon = amenity.icon;
                    return (
                      <div
                        key={amenity.label}
                        className="flex items-center gap-3 rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-4 py-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#6DFF3B]/18 bg-[#6DFF3B]/10">
                          <Icon className="h-4 w-4 text-[#6DFF3B]" />
                        </div>
                        <span className="text-sm text-white/72">
                          {amenity.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-white/[0.08] bg-[#101216]">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl  text-white">Location map</h2>
                <div className="mt-5 rounded-[22px] border border-dashed border-white/[0.12] bg-[linear-gradient(135deg,rgba(109,255,59,0.08),rgba(255,255,255,0.03))] overflow-hidden">
                  <div className="h-[360px] w-full overflow-hidden bg-[#050505]/70 map-container">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(venue.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      allowFullScreen
                      title="Google Map"
                      className="w-full h-full"
                    />
                  </div>
                </div>
                <p className="mt-4 text-sm text-white/58">{venue.address}</p>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border-white/[0.08] bg-[#101216]">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[0.72rem]  uppercase tracking-[0.36em] text-[#6DFF3B]/85">
                      Reviews
                    </p>
                    <h2 className="mt-3 text-2xl  text-white">
                      Real reviews, shown clearly
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl  text-white">
                      {venue.rating.toFixed(1)}
                    </p>
                    <p className="text-sm text-white/52">
                      {venue.reviews} verified reviews
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.name}
                      className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className=" text-white">{review.name}</p>
                          <p className="mt-1 text-sm text-white/52">
                            {review.date}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: review.rating }).map(
                            (_, index) => (
                              <Star
                                key={index}
                                className="h-4 w-4 fill-[#6DFF3B] text-[#6DFF3B]"
                              />
                            ),
                          )}
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-white/66">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>


        </div>


      </div>
    </div>
  );
}
