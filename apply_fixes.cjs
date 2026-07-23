const fs = require("fs");
const path = require("path");

const homepagePath = path.join(__dirname, "src", "app", "components", "home", "homepage.jsx");
let content = fs.readFileSync(homepagePath, "utf-8");

// 1. Add activeCity state to HeroSection
const heroStateFind = /const \[isPaused, setIsPaused\] = useState\(false\);/;
const heroStateReplace = `const [isPaused, setIsPaused] = useState(false);

  const [activeCity, setActiveCity] = useState(
    () => localStorage.getItem("preferred-city") || "Mumbai",
  );

  useEffect(() => {
    const handleCityChange = (e) => {
      setActiveCity(e.detail);
    };
    window.addEventListener("preferredCityChanged", handleCityChange);
    return () => {
      window.removeEventListener("preferredCityChanged", handleCityChange);
    };
  }, []);`;

content = content.replace(heroStateFind, heroStateReplace);

// 2. Add filtering to Recommended Venues mapping
const mapStartFind = /\{\/\* Grid of Poster-Style Cards \(BookMyShow Movie Poster Format\) \*\/\}\r?\n\s*<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">\r?\n\s*\{recommendedVenues\.map\(\(venue\) => \(/;
const mapStartReplace = `{/* Grid of Poster-Style Cards (BookMyShow Movie Poster Format) */}
          {(() => {
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
                {filteredVenues.map((venue) => (`;
                
content = content.replace(mapStartFind, mapStartReplace);

// 3. Close IIFE for map
// Finding:
//                </div>
//              </motion.div>
//            ))}
//          </div>
//        </div>
const mapEndFind = /<\/div>\r?\n\s*<\/motion\.div>\r?\n\s*\)\)}\r?\n\s*<\/div>\r?\n\s*<\/div>/;
const mapEndReplace = `</div>
              </motion.div>
            ))}
              </div>
            );
          })()}
        </div>`;
content = content.replace(mapEndFind, mapEndReplace);

// 4. Move LocationModal out of center section to right section
const locModalFind = /\{\/\* Location Pill \*\/\}\r?\n\s*<LocationModal[\s\S]*?<\/button>\r?\n\s*\}\r?\n\s*\/>\r?\n\s*<\/div>\r?\n\r?\n\s*\{\/\* Right Section: Sign In \+ Hamburger Menu Toggle \*\/\}\r?\n\s*<div className="flex flex-1 items-center justify-end gap-4">\r?\n\s*\{\/\* Auth Section: Login or Profile \*\/\}/;

const locModalReplace = `</div>

          {/* Right Section: Sign In + Hamburger Menu Toggle */}
          <div className="flex flex-1 items-center justify-end gap-4">
            {/* Location Pill */}
            <LocationModal
              activeCity={activeCity}
              onCitySelect={handleCitySelect}
              trigger={
                <button
                  className={cn(
                    "hidden md:flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full border shadow-sm transition-all duration-200 cursor-pointer",
                    isDark
                      ? "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-white focus:ring-2 focus:ring-[#6DFF3B]/10"
                      : "border-slate-200 bg-[#F1F3F6]/60 hover:bg-[#F1F3F6]/80 text-slate-700 focus:ring-2 focus:ring-emerald-500/10",
                  )}
                >
                  <MapPin
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isDark ? "text-[#6DFF3B]" : "text-emerald-600",
                    )}
                  />
                  <span className="text-[0.825rem] lg:text-[0.875rem] font-semibold">
                    {activeCity === "All" ? "All Cities" : activeCity}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 shrink-0 transition-transform",
                      isDark ? "text-white/40" : "text-slate-400",
                    )}
                  />
                </button>
              }
            />

            {/* Auth Section: Login or Profile */}`;

content = content.replace(locModalFind, locModalReplace);

fs.writeFileSync(homepagePath, content, "utf-8");
console.log("Successfully applied regex fixes to homepage.jsx");
