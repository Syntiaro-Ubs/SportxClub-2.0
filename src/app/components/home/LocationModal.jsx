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

// Detailed Monument SVG Icons for Popular Cities matching Image 2
const MumbaiIcon = ({ className }) => (
  <svg viewBox="0 0 64 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
    {/* Gateway of India */}
    <path d="M4 44H60" strokeLinecap="round" />
    <path d="M8 44V16L14 12L20 16V44" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M44 44V16L50 12L56 16V44" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 20H44V44H20V20Z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M25 44V28C25 24 39 24 39 28V44" fill="currentColor" fillOpacity="0.1" strokeLinecap="round" />
    <path d="M12 24H16M48 24H52M12 32H16M48 32H52" strokeLinecap="round" />
    <path d="M14 12V8M50 12V8" strokeLinecap="round" />
    <path d="M20 16C20 16 26 10 32 10C38 10 44 16 44 16" strokeLinecap="round" />
  </svg>
);

const DelhiIcon = ({ className }) => (
  <svg viewBox="0 0 64 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
    {/* India Gate */}
    <path d="M6 44H58" strokeLinecap="round" />
    <path d="M12 44V12H52V44" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 12H56V6H8V12Z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 44V26C22 20 42 20 42 26V44" fill="currentColor" fillOpacity="0.1" strokeLinecap="round" />
    <path d="M18 16H46M18 20H46" strokeLinecap="round" />
  </svg>
);

const BengaluruIcon = ({ className }) => (
  <svg viewBox="0 0 64 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
    {/* Vidhana Soudha */}
    <path d="M4 44H60" strokeLinecap="round" />
    <path d="M8 44V24H56V44" strokeLinecap="round" />
    <path d="M16 24V16H48V24" strokeLinecap="round" />
    <path d="M26 16C26 12 32 8 32 8C32 8 38 12 38 16" fill="currentColor" fillOpacity="0.15" strokeLinecap="round" />
    <path d="M24 44V32C24 28 40 28 40 32V44" fill="currentColor" fillOpacity="0.1" strokeLinecap="round" />
    <path d="M12 32H18M46 32H52M12 38H18M46 38H52" strokeLinecap="round" />
  </svg>
);

const HyderabadIcon = ({ className }) => (
  <svg viewBox="0 0 64 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
    {/* Charminar */}
    <path d="M4 44H60" strokeLinecap="round" />
    <path d="M10 44V8L14 4L18 8V44" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M46 44V8L50 4L54 8V44" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 22H46V44H18V22Z" strokeLinecap="round" />
    <path d="M24 44V30C24 24 40 24 40 30V44" fill="currentColor" fillOpacity="0.1" strokeLinecap="round" />
    <path d="M22 16H42V22H22V16Z" strokeLinecap="round" />
  </svg>
);

const ChandigarhIcon = ({ className }) => (
  <svg viewBox="0 0 64 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
    {/* Open Hand Monument */}
    <path d="M8 44H56" strokeLinecap="round" />
    <path d="M24 44V32H40V44" strokeLinecap="round" />
    <path d="M32 32V20" strokeLinecap="round" />
    <path d="M32 20C26 14 18 16 18 16C18 16 22 24 32 20Z" fill="currentColor" fillOpacity="0.15" strokeLinecap="round" />
    <path d="M32 20C38 12 48 14 48 14C48 14 42 22 32 20Z" fill="currentColor" fillOpacity="0.15" strokeLinecap="round" />
  </svg>
);

const AhmedabadIcon = ({ className }) => (
  <svg viewBox="0 0 64 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
    {/* Sidi Saiyyed / Fort Minarets */}
    <path d="M4 44H60" strokeLinecap="round" />
    <path d="M10 44V12L16 6L22 12V44" strokeLinecap="round" />
    <path d="M42 44V12L48 6L54 12V44" strokeLinecap="round" />
    <path d="M22 24H42V44H22V24Z" strokeLinecap="round" />
    <path d="M26 44V32C26 28 38 28 38 32V44" fill="currentColor" fillOpacity="0.1" strokeLinecap="round" />
  </svg>
);

const PuneIcon = ({ className }) => (
  <svg viewBox="0 0 64 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
    {/* Shaniwar Wada Fort Gate */}
    <path d="M4 44H60" strokeLinecap="round" />
    <path d="M10 44V20L16 16V44" strokeLinecap="round" />
    <path d="M48 44V20L54 16V44" strokeLinecap="round" />
    <path d="M16 24H48V44H16V24Z" strokeLinecap="round" />
    <path d="M24 44V32C24 28 40 28 40 32V44" fill="currentColor" fillOpacity="0.1" strokeLinecap="round" />
    <path d="M20 20H44" strokeLinecap="round" />
  </svg>
);

const ChennaiIcon = ({ className }) => (
  <svg viewBox="0 0 64 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
    {/* Temple Gopuram */}
    <path d="M4 44H60" strokeLinecap="round" />
    <path d="M16 44L20 12H44L48 44" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 36H46M20 28H44M22 20H42" strokeLinecap="round" />
    <path d="M26 44V34C26 30 38 30 38 34V44" fill="currentColor" fillOpacity="0.1" strokeLinecap="round" />
    <path d="M32 12V6" strokeLinecap="round" />
  </svg>
);

const KolkataIcon = ({ className }) => (
  <svg viewBox="0 0 64 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
    {/* Victoria Memorial */}
    <path d="M4 44H60" strokeLinecap="round" />
    <path d="M8 44V28H56V44" strokeLinecap="round" />
    <path d="M18 28V20H46V28" strokeLinecap="round" />
    <path d="M26 20C26 14 32 10 32 10C32 10 38 14 38 20" fill="currentColor" fillOpacity="0.15" strokeLinecap="round" />
    <path d="M26 44V34C26 30 38 30 38 34V44" fill="currentColor" fillOpacity="0.1" strokeLinecap="round" />
  </svg>
);

const KochiIcon = ({ className }) => (
  <svg viewBox="0 0 64 48" fill="none" className={className} stroke="currentColor" strokeWidth="1.6">
    {/* Houseboat & Palm Trees */}
    <path d="M4 44C12 40 52 40 60 44" strokeLinecap="round" />
    <path d="M10 40C10 32 18 28 32 28C46 28 54 32 54 40" strokeLinecap="round" fill="currentColor" fillOpacity="0.1" />
    <path d="M20 28V20H44V28" strokeLinecap="round" />
    <path d="M50 44C50 44 48 24 42 16" strokeLinecap="round" />
    <path d="M42 16C36 12 30 16 30 16C30 16 36 20 42 16Z" fill="currentColor" fillOpacity="0.15" strokeLinecap="round" />
    <path d="M42 16C46 8 54 8 54 8C54 8 50 16 42 16Z" fill="currentColor" fillOpacity="0.15" strokeLinecap="round" />
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
            className="flex items-center gap-2.5 text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-[#6DFF3B] hover:opacity-80 transition cursor-pointer"
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

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 sm:gap-2 w-full select-none justify-items-center">
                {filteredPopular.map((city) => {
                  const Icon = city.icon;
                  const isSelected = activeCity === city.name;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelect(city.name)}
                      className={cn(
                        "flex flex-col items-center justify-center transition-all duration-200 group cursor-pointer text-center w-full py-1 rounded-xl",
                        isSelected
                          ? isDark
                            ? "text-[#6DFF3B]"
                            : "text-emerald-600"
                          : isDark
                            ? "text-white/60 hover:text-white"
                            : "text-slate-500 hover:text-slate-900"
                      )}
                    >
                      <div className="h-8 w-9 sm:h-10 sm:w-11 flex items-center justify-center mb-0.5 transition-transform group-hover:scale-110">
                        <Icon className="h-7 w-9 sm:h-9 sm:w-10" />
                      </div>
                      <span
                        className={cn(
                          "text-[10px] sm:text-[11px] tracking-tight whitespace-nowrap text-center",
                          isSelected ? "font-black" : "font-semibold"
                        )}
                      >
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
                    className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 dark:text-[#6DFF3B] hover:opacity-80 transition cursor-pointer"
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
