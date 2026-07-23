const fs = require("fs");

const cities = [
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

for (const city of cities) {
  for (let i = 1; i <= 6; i++) {
    const sport = sportsOptions[i % sportsOptions.length];
    const badge = badgeOptions[i % badgeOptions.length];
    const image = imageOptions[i % imageOptions.length];
    
    // some fake sub-location or just city name
    const location = `Area ${i}, ${city}`;
    
    const turf = {
      id: id++,
      name: `${city} Sports Arena ${i}`,
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

fs.writeFileSync("turfs_generated.js", turfString);
