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
  { id: "mumbai", name: "Mumbai", image: "/cities/mumbai.png" },
  { id: "delhi", name: "Delhi-NCR", image: "/cities/delhi.png" },
  { id: "bengaluru", name: "Bengaluru", image: "/cities/bengaluru.png" },
  { id: "hyderabad", name: "Hyderabad", image: "/cities/hyderabad.png" },
  { id: "chandigarh", name: "Chandigarh", image: "/cities/chandigarh.png" },
  { id: "ahmedabad", name: "Ahmedabad", image: "/cities/ahmedabad.png" },
  { id: "pune", name: "Pune", image: "/cities/pune.png" },
  { id: "chennai", name: "Chennai", image: "/cities/chennai.png" },
  { id: "kolkata", name: "Kolkata", image: "/cities/kolkata.png" },
  { id: "kochi", name: "Kochi", image: "/cities/kochi.png" },
];

const SUB_LOCATIONS = {
  "Mumbai": ["All Mumbai", "Andheri", "Bandra", "Borivali", "Juhu", "South Mumbai", "Powai", "Goregaon"],
  "Delhi-NCR": ["All Delhi-NCR", "Connaught Place", "Gurugram", "Noida", "Saket", "Vasant Kunj", "Dwarka"],
  "Bengaluru": ["All Bengaluru", "Koramangala", "Indiranagar", "Whitefield", "Jayanagar", "HSR Layout", "Malleswaram"],
  "Hyderabad": ["All Hyderabad", "Banjara Hills", "Jubilee Hills", "HITEC City", "Gachibowli", "Madhapur"],
  "Chandigarh": ["All Chandigarh", "Sector 17", "Sector 22", "Sector 35", "Mohali", "Panchkula"],
  "Ahmedabad": ["All Ahmedabad", "Vastrapur", "SG Highway", "Navrangpura", "Satellite", "Bopal"],
  "Pune": ["All Pune", "Koregaon Park", "Viman Nagar", "Hinjewadi", "Kothrud", "Wakad", "Baner"],
  "Chennai": ["All Chennai", "T Nagar", "Adyar", "Velachery", "Anna Nagar", "Nungambakkam"],
  "Kolkata": ["All Kolkata", "Park Street", "Salt Lake", "New Town", "Ballygunge", "Alipore"],
  "Kochi": ["All Kochi", "Edappally", "Fort Kochi", "Kakkanad", "MG Road", "Palarivattom"],
};


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
  const [selectedMainCity, setSelectedMainCity] = useState(null);

  const handleFinalSelect = (locationName) => {
    onCitySelect(locationName);
    setOpen(false);
    setSelectedMainCity(null);
    toast.success(`Location set to ${locationName}`);
  };

  const handleCityClick = (cityName) => {
    if (SUB_LOCATIONS[cityName]) {
      setSelectedMainCity(cityName === selectedMainCity ? null : cityName);
    } else {
      handleFinalSelect(cityName);
    }
  };

  const handleDetectLocation = () => {
    setIsDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetecting(false);
          handleFinalSelect("Navi Mumbai");
        },
        (error) => {
          setIsDetecting(false);
          handleFinalSelect("Navi Mumbai");
        },
        { timeout: 3000 }
      );
    } else {
      setIsDetecting(false);
      handleFinalSelect("Navi Mumbai");
    }
  };

  const filteredPopular = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOther = OTHER_CITIES.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              "absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px]",
              isDark ? "text-white/40" : "text-slate-400"
            )}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for your city"
            className={cn(
              "w-full h-12 pl-12 pr-10 rounded-full border-[1.5px] text-[15px] font-medium transition-all outline-none bg-transparent",
              isDark
                ? "border-[#6DFF3B] text-white placeholder:text-white/40 focus:ring-1 focus:ring-[#6DFF3B]"
                : "border-[#059669] text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-[#059669]"
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
        <div className="shrink-0 mt-[-12px]">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="flex items-center gap-2 text-[15px] font-medium text-[#059669] dark:text-[#6DFF3B] hover:opacity-80 transition cursor-pointer px-1"
          >
            <LocateFixed className={cn("h-4 w-4", isDetecting && "animate-spin")} />
            <span>{isDetecting ? "Detecting location..." : "Allow my location"}</span>
          </button>
        </div>

        {/* Scrollable Cities Container */}
        <div className="overflow-y-auto pr-1 space-y-6 flex-1 custom-scrollbar">
          {/* 3. Popular Cities Section */}
          {filteredPopular.length > 0 && (
            <div className="space-y-4">
              <h4
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.1em] text-center mb-6 mt-0",
                  isDark ? "text-white/60" : "text-slate-500"
                )}
              >
                Popular Cities
              </h4>

              <div className="grid grid-cols-10 gap-1.5 sm:gap-3 pb-2 pt-2 w-full select-none px-1">
                {filteredPopular.map((city) => {
                  const isSelected = activeCity === city.name || selectedMainCity === city.name;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleCityClick(city.name)}
                      className={cn(
                        "flex flex-col items-center justify-start transition-all duration-200 group cursor-pointer text-center rounded-xl outline-none min-w-0 w-full",
                        isSelected
                          ? isDark
                            ? "text-[#6DFF3B]"
                            : "text-slate-800"
                          : isDark
                            ? "text-white/60 hover:text-white"
                            : "text-slate-500 hover:text-slate-800"
                      )}
                    >
                      <div className="h-7 w-7 sm:h-10 sm:w-10 md:h-12 md:w-12 flex items-center justify-center mb-2 transition-transform group-hover:scale-105">
                        <img src={city.image} alt={city.name} className={cn("h-full w-full object-contain", isDark ? "opacity-80 group-hover:opacity-100" : "opacity-90 group-hover:opacity-100")} />
                      </div>
                      <span
                        className={cn(
                          "text-[9px] sm:text-[11px] tracking-tight text-center leading-tight block w-full break-words hyphens-auto",
                          isSelected ? "font-semibold text-slate-800 dark:text-[#6DFF3B]" : "font-medium text-slate-500 dark:text-white/60"
                        )}
                      >
                        {city.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedMainCity && SUB_LOCATIONS[selectedMainCity] && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-white/90">
                      Popular Areas in {selectedMainCity}
                    </h5>
                    <button onClick={() => setSelectedMainCity(null)} className="text-[11px] font-bold text-emerald-600 dark:text-[#6DFF3B] hover:opacity-80 uppercase tracking-wide">
                      Close
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {SUB_LOCATIONS[selectedMainCity].map(area => {
                      const finalName = area.startsWith("All ") ? selectedMainCity : `${area}, ${selectedMainCity}`;
                      const isAreaSelected = activeCity === finalName;
                      return (
                        <button
                          key={area}
                          onClick={() => handleFinalSelect(finalName)}
                          className={cn(
                            "px-4 py-2 text-xs sm:text-sm rounded-full transition-all font-semibold border shadow-sm",
                            isAreaSelected
                              ? isDark
                                ? "bg-[#6DFF3B]/20 border-[#6DFF3B]/50 text-[#6DFF3B]"
                                : "bg-emerald-100 border-emerald-300 text-emerald-800"
                              : isDark
                                ? "border-white/10 hover:bg-white/10 hover:text-white text-white/70"
                                : "border-slate-200 hover:bg-slate-200 hover:text-slate-900 text-slate-600 bg-white"
                          )}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. Other Cities Section */}
          {filteredOther.length > 0 && (
            <div className={cn("text-center", (showAllCities || searchTerm) ? "space-y-4 pt-2" : "pt-0")}>
              {(showAllCities || searchTerm) ? (
                <>
                  <h4
                    className={cn(
                      "text-xs font-extrabold uppercase tracking-widest text-center",
                      isDark ? "text-white/60" : "text-slate-500"
                    )}
                  >
                    Other Cities
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2.5 text-left">
                    {filteredOther.map((cityName) => {
                      const isSelected = activeCity === cityName;
                      return (
                        <button
                          key={cityName}
                          type="button"
                          onClick={() => handleCityClick(cityName)}
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
                  {!searchTerm && (
                    <div className="text-center pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAllCities(false)}
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 dark:text-[#6DFF3B] hover:opacity-80 transition cursor-pointer"
                      >
                        <span>Hide all cities</span>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center pt-0">
                  <button
                    type="button"
                    onClick={() => setShowAllCities(true)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#059669] dark:text-[#6DFF3B] hover:opacity-80 transition cursor-pointer"
                  >
                    <span>View all cities</span>
                    <ChevronDown className="h-4 w-4" />
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
