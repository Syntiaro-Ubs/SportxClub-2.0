const fs = require("fs");

const POPULAR_CITIES = [
  "Mumbai",
  "Delhi-NCR",
  "Bengaluru",
  "Hyderabad",
  "Chandigarh",
  "Ahmedabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Kochi",
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

fs.writeFileSync("turfs_generated.txt", turfString);
