import { useState } from "react";
import { Search, MapPin, LocateFixed, ChevronDown, ChevronUp, X } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { cn } from "../ui/utils";

// Custom Monument SVG Icons for Popular Cities
const MumbaiIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    {/* Gateway of India outline */}
    <path d="M12 52V24L20 20L28 24V52" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M36 52V24L44 20L52 24V52" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M28 28H36V52H28V28Z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 36C22 30 42 30 42 36V52H22V36Z" fill="currentColor" fillOpacity="0.1" />
    <path d="M8 52H56" strokeLinecap="round" />
    <circle cx="32" cy="16" r="3" />
  </svg>
);

const DelhiIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    {/* India Gate outline */}
    <path d="M16 52V18H48V52" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 18H52V14H12V18Z" strokeLinecap="round" />
    <path d="M26 52V36C26 32 38 32 38 36V52" fill="currentColor" fillOpacity="0.1" />
    <path d="M8 52H56" strokeLinecap="round" />
    <path d="M24 24H40" strokeLinecap="round" />
  </svg>
);

const BengaluruIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    {/* Palace / Vidhana Soudha dome */}
    <path d="M14 52V28L32 16L50 28V52" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 52V34H40V52" strokeLinecap="round" fill="currentColor" fillOpacity="0.1" />
    <circle cx="32" cy="24" r="4" />
    <path d="M8 52H56" strokeLinecap="round" />
  </svg>
);

const HyderabadIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    {/* Charminar 4 minarets */}
    <path d="M14 52V14M24 52V24M40 52V24M50 52V14" strokeLinecap="round" />
    <path d="M14 24H50" strokeLinecap="round" />
    <path d="M24 38C24 32 40 32 40 38V52H24V38Z" fill="currentColor" fillOpacity="0.1" />
    <path d="M8 52H56" strokeLinecap="round" />
  </svg>
);

const ChandigarhIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    {/* Open Hand Monument */}
    <path d="M32 52V28M32 28L20 18M32 28L44 18M32 28L28 14M32 28L36 14" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="12" r="3" />
    <path d="M16 52H48" strokeLinecap="round" />
  </svg>
);

const AhmedabadIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    {/* Jhulta Minar / Heritage Arch */}
    <path d="M18 52V20L32 14L46 20V52" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M24 52V36C24 30 40 30 40 36V52" fill="currentColor" fillOpacity="0.1" />
    <path d="M10 52H54" strokeLinecap="round" />
  </svg>
);

const PuneIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    {/* Shaniwar Wada Fort Gate */}
    <path d="M16 52V22L32 16L48 22V52" strokeLinecap="round" />
    <path d="M26 52V34H38V52" strokeLinecap="round" fill="currentColor" fillOpacity="0.1" />
    <path d="M12 28H52" strokeLinecap="round" />
    <path d="M8 52H56" strokeLinecap="round" />
  </svg>
);

const ChennaiIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    {/* Temple Gopuram */}
    <path d="M20 52L24 16H40L44 52" strokeLinecap="round" />
    <path d="M22 40H42M24 30H40M26 20H38" strokeLinecap="round" />
    <path d="M12 52H52" strokeLinecap="round" />
  </svg>
);

const KolkataIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    {/* Howrah Bridge */}
    <path d="M12 52V24L32 14L52 24V52" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 36L52 36" strokeLinecap="round" />
    <path d="M20 36L32 20L44 36" strokeLinecap="round" />
    <path d="M8 52H56" strokeLinecap="round" />
  </svg>
);

const KochiIcon = ({ className }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} stroke="currentColor" strokeWidth="2">
    {/* Palm Tree & Beach Nets */}
    <path d="M32 52C32 52 30 32 24 24" strokeLinecap="round" />
    <path d="M24 24C18 20 12 24 12 24C12 24 18 28 24 24Z" fill="currentColor" fillOpacity="0.1" />
    <path d="M24 24C28 16 36 16 36 16C36 16 32 24 24 24Z" fill="currentColor" fillOpacity="0.1" />
    <path d="M24 24C32 24 38 30 38 30C38 30 30 32 24 24Z" fill="currentColor" fillOpacity="0.1" />
    <path d="M16 52H48" strokeLinecap="round" />
  </svg>
);

const POPULAR_CITIES = [
  { id: "mumbai", name: "Mumbai", icon: MumbaiIcon },
  { id: "delhi", name: "Delhi-NCR", icon: DelhiIcon },
  { id: "bengaluru", name: "Bengaluru", icon: BengaluruIcon },
  { id: "hyderabad", name: "Hyderabad", icon: HyderabadIcon },
  { id: "chandigarh", name: "Chandigarh", icon: ChandigarhIcon },
  { id: "ahmedabad", name: "Ahmedabad", icon: AhmedabadIcon },
  { id: "pune", name: "Pune", icon: PuneIcon },
  { id: "chennai", name: "Chennai", icon: ChennaiIcon },
  { id: "kolkata", name: "Kolkata", icon: KolkataIcon },
  { id: "kochi", name: "Kochi", icon: KochiIcon },
];

const OTHER_CITIES = [
  "Aalo", "Abohar", "Abu Road", "Achampet", "Acharapakkam",
  "Addanki", "Adilabad", "Adimali", "Adipur", "Adoni",
  "Agar Malwa", "Agartala", "Agiripalli", "Agra", "Ahilyanagar (Ahmednagar)",
  "Ahmedgarh", "Ahore", "Aizawl", "Ajmer", "Akaltara",
  "Akbarpur", "Akividu", "Akluj", "Akola", "Akot",
  "Alakode", "Alangudi", "Alangulam", "Alappuzha", "Alathur",
  "Alibaug", "Aligarh", "Alipurduar", "Allagadda", "Almora",
  "Amritsar", "Aurangabad", "Bhopal", "Bhubaneswar", "Coimbatore",
  "Dehradun", "Faridabad", "Ghaziabad", "Goa", "Gurgaon",
  "Guwahati", "Gwalior", "Indore", "Jabalpur", "Jaipur",
  "Jalandhar", "Jammu", "Jamshedpur", "Jodhpur", "Kanpur",
  "Kolhapur", "Kozhikode", "Lucknow", "Ludhiana", "Madurai",
  "Mangalore", "Meerut", "Nagpur", "Nashik", "Navi Mumbai",
  "Noida", "Patna", "Pondicherry", "Raipur", "Rajkot",
  "Ranchi", "Shimla", "Surat", "Thane", "Thiruvananthapuram",
  "Udaipur", "Vadodara", "Varanasi", "Vijayawada", "Visakhapatnam"
];

export function LocationModal({ trigger, activeCity, onCitySelect }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllCities, setShowAllCities] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleSelect = (cityName) => {
    onCitySelect(cityName);
    setOpen(false);
    toast.success(`Location set to ${cityName}`);
  };

  const handleDetectLocation = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetecting(false);
          handleSelect("Navi Mumbai");
        },
        (error) => {
          setIsDetecting(false);
          handleSelect("Navi Mumbai");
        },
        { timeout: 3000 }
      );
    } else {
      setIsDetecting(false);
      handleSelect("Navi Mumbai");
    }
  };

  const filteredPopular = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOther = OTHER_CITIES.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedOtherCities = showAllCities
    ? filteredOther
    : filteredOther.slice(0, 35);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className={cn(
          "max-w-4xl w-[95vw] p-6 sm:p-8 rounded-3xl overflow-hidden transition-colors duration-300 max-h-[90vh] flex flex-col gap-6",
          isDark
            ? "bg-[#0d0f15] border-white/10 text-white shadow-2xl"
            : "bg-white border-slate-200 text-slate-900 shadow-2xl"
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Select Your City</DialogTitle>
        </DialogHeader>

        {/* 1. Top Search Bar */}
        <div className="relative shrink-0">
          <Search
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5",
              isDark ? "text-white/40" : "text-slate-400"
            )}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for your city"
            className={cn(
              "w-full h-12 pl-12 pr-10 rounded-2xl border text-sm transition-all outline-none",
              isDark
                ? "border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:border-[#6DFF3B] focus:ring-1 focus:ring-[#6DFF3B]"
                : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            )}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 2. Detect My Location Button */}
        <div className="shrink-0 border-b pb-4 border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-rose-500 hover:text-rose-600 transition cursor-pointer"
          >
            <LocateFixed className={cn("h-4 w-4", isDetecting && "animate-spin")} />
            <span>{isDetecting ? "Detecting location..." : "Detect my location"}</span>
          </button>
        </div>

        {/* Scrollable Cities Container */}
        <div className="overflow-y-auto pr-1 space-y-8 flex-1 custom-scrollbar">
          {/* 3. Popular Cities Section */}
          {filteredPopular.length > 0 && (
            <div className="space-y-4">
              <h4
                className={cn(
                  "text-xs font-extrabold uppercase tracking-widest text-center",
                  isDark ? "text-white/60" : "text-slate-500"
                )}
              >
                Popular Cities
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {filteredPopular.map((city) => {
                  const Icon = city.icon;
                  const isSelected = activeCity === city.name;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelect(city.name)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 group cursor-pointer text-center h-[96px]",
                        isSelected
                          ? isDark
                            ? "border-[#6DFF3B] bg-[#6DFF3B]/10 text-[#6DFF3B] shadow-[0_0_15px_rgba(109,255,59,0.2)]"
                            : "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-md"
                          : isDark
                            ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-white/90"
                            : "border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 text-slate-800"
                      )}
                    >
                      <div
                        className={cn(
                          "h-10 w-10 flex items-center justify-center transition-transform group-hover:scale-110 mb-1.5",
                          isSelected
                            ? isDark
                              ? "text-[#6DFF3B]"
                              : "text-emerald-600"
                            : isDark
                              ? "text-white/70 group-hover:text-white"
                              : "text-slate-600 group-hover:text-slate-900"
                        )}
                      >
                        <Icon className="h-8 w-8" />
                      </div>
                      <span className="text-xs font-extrabold tracking-tight whitespace-nowrap text-center">
                        {city.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Other Cities Section */}
          {filteredOther.length > 0 && (
            <div className="space-y-4 pt-2">
              <h4
                className={cn(
                  "text-xs font-extrabold uppercase tracking-widest text-center",
                  isDark ? "text-white/60" : "text-slate-500"
                )}
              >
                Other Cities
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2.5">
                {displayedOtherCities.map((cityName) => {
                  const isSelected = activeCity === cityName;
                  return (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => handleSelect(cityName)}
                      className={cn(
                        "text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors cursor-pointer truncate font-medium",
                        isSelected
                          ? isDark
                            ? "bg-[#6DFF3B]/20 text-[#6DFF3B] font-bold"
                            : "bg-emerald-100 text-emerald-800 font-bold"
                          : isDark
                            ? "text-white/70 hover:text-white hover:bg-white/5"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      {cityName}
                    </button>
                  );
                })}
              </div>

              {/* 5. Show All / Hide All Cities Toggle */}
              {filteredOther.length > 35 && !searchTerm && (
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAllCities(!showAllCities)}
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-500 hover:text-rose-600 transition cursor-pointer"
                  >
                    <span>{showAllCities ? "Hide all cities" : "View all cities"}</span>
                    {showAllCities ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
