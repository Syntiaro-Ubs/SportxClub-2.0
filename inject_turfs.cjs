const fs = require("fs");
const path = require("path");

const POPULAR_CITIES = [
  "Mumbai", "Delhi-NCR", "Bengaluru", "Hyderabad", "Chandigarh",
  "Ahmedabad", "Pune", "Chennai", "Kolkata", "Kochi"
];

const SUB_LOCATIONS = {
  "Mumbai": ["Andheri", "Bandra", "Borivali", "Goregaon", "Juhu", "Malad", "Navi Mumbai", "Powai", "South Mumbai", "Thane"],
  "Delhi-NCR": ["Connaught Place", "Dwarka", "Gurgaon", "Noida", "South Extension", "Vasant Kunj"],
  "Bengaluru": ["HSR Layout", "Indiranagar", "Jayanagar", "Koramangala", "Malleswaram", "Whitefield"],
  "Hyderabad": ["Banjara Hills", "Gachibowli", "Hitec City", "Jubilee Hills", "Kukatpally", "Madhapur"],
  "Chandigarh": ["Sector 17", "Sector 22", "Sector 35", "Sector 43", "Zirakpur", "Mohali"],
  "Ahmedabad": ["Bopal", "Navrangpura", "Paldi", "Prahlad Nagar", "Satellite", "Vastrapur"],
  "Pune": ["Baner", "Hinjewadi", "Koregaon Park", "Kothrud", "Viman Nagar", "Wakad"],
  "Chennai": ["Adyar", "Anna Nagar", "Nungambakkam", "OMR", "T Nagar", "Velachery"],
  "Kolkata": ["Ballygunge", "Dum Dum", "New Town", "Park Street", "Salt Lake", "South City"],
  "Kochi": ["Edappally", "Fort Kochi", "Kaloor", "Kakkanad", "Marine Drive", "Palarivattom"],
};

const sportsOptions = [
  "Football • Box Cricket",
  "Cricket • Football",
  "Badminton",
  "Lawn Tennis",
  "Volleyball",
  "Basketball",
];

const badgeOptions = ["PROMOTED", "POPULAR", "FAST FILLING", "TOP RATED", "FEATURED", "NEW"];
const imageOptions = [
  "/venues/champions_sports_arena_football.jpg",
  "/venues/metro_sports_park_cricket.jpg",
  "/venues/grand_playfield_badminton.png",
  "/venues/new_tennis_turf.png",
  "/venues/new_volleyball_turf.png",
];

let turfs = [];
let id = 1;

for (const city of POPULAR_CITIES) {
  for (let i = 0; i < 6; i++) {
    const sport = sportsOptions[i % sportsOptions.length];
    const badge = badgeOptions[i % badgeOptions.length];
    const image = imageOptions[i % imageOptions.length];
    
    const sublocations = SUB_LOCATIONS[city] || [];
    const subloc = sublocations[i % sublocations.length] || city;
    const location = `${subloc}, ${city}`;
    
    const turf = {
      id: id++,
      name: `${subloc} Sports Arena`,
      location: location,
      sport: sport,
      rating: (4.0 + Math.random()).toFixed(1),
      reviews: Math.floor(Math.random() * 200) + 50 + "",
      price: "₹" + (Math.floor(Math.random() * 10) + 5) * 100,
      unit: "/ hr",
      badge: badge,
      image: `asset("${image}")`
    };
    turfs.push(turf);
  }
}

let turfString = "const recommendedVenues = [\n";
for (const t of turfs) {
  turfString += `  {
    id: ${t.id},
    name: "${t.name}",
    location: "${t.location}",
    sport: "${t.sport}",
    rating: "${t.rating}",
    reviews: "${t.reviews}",
    price: "${t.price}",
    unit: "${t.unit}",
    badge: "${t.badge}",
    image: ${t.image},
  },\n`;
}
turfString += "];";

const homepagePath = path.join(__dirname, "src", "app", "components", "home", "homepage.jsx");
let content = fs.readFileSync(homepagePath, "utf-8");

// Replace array
const arrayRegex = /const recommendedVenues = \[[\s\S]*?\];/;
content = content.replace(arrayRegex, turfString);

// Add activeCity state
const stateRegex = /  const prevSlideRef = useRef\(currentSlide\);\n\n  useEffect\(\(\) => {\n    prevSlideRef\.current = currentSlide;\n  }, \[currentSlide\]\);/;
const stateReplacement = `  const prevSlideRef = useRef(currentSlide);

  const [activeCity, setActiveCity] = useState(
    () => localStorage.getItem("preferred-city") || "Mumbai",
  );

  useEffect(() => {
    const handleCityChange = (e) => {
      const customEvent = e;
      setActiveCity(customEvent.detail);
    };
    window.addEventListener("preferredCityChanged", handleCityChange);
    return () => {
      window.removeEventListener("preferredCityChanged", handleCityChange);
    };
  }, []);

  useEffect(() => {
    prevSlideRef.current = currentSlide;
  }, [currentSlide]);`;
content = content.replace(stateRegex, stateReplacement);

// Add filtering and empty state
const mapRegex = /          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">\n            {recommendedVenues\.map\(\(venue\) => \(\n              <motion\.div/g;
const mapReplacement = `          {(() => {
            const filteredVenues = recommendedVenues.filter((venue) => activeCity === "All" || activeCity === "Cities" || venue.location.includes(activeCity) || (activeCity === "Navi Mumbai" && venue.location.includes("Mumbai")));
            
            if (filteredVenues.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-3xl mt-4 transition-colors duration-300" style={{ borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner", isDark ? "bg-white/5 text-white/40" : "bg-slate-100 text-slate-400")}>
                    <MapPin className="h-8 w-8" />
                  </div>
                  <h3 className={cn("text-lg font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>No venues in {activeCity} yet</h3>
                  <p className={cn("text-sm max-w-sm", isDark ? "text-white/60" : "text-slate-500")}>We're expanding rapidly! Check back soon or try selecting a different city.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                {filteredVenues.map((venue) => (
                  <motion.div`;
content = content.replace(mapRegex, mapReplacement);

// Close IIFE
const endRegex = /            \)\)}\n          <\/div>\n        <\/div>/g;
const endReplacement = `            ))}
              </div>
            );
          })()}
        </div>`;
content = content.replace(endRegex, endReplacement);

fs.writeFileSync(homepagePath, content, "utf-8");
console.log("Successfully injected turfs and filter logic");
