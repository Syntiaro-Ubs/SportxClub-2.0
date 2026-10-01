/**
 * SEO Utility — SportXClub
 * 
 * Central place for all page-level meta tag configurations.
 * Used with react-helmet-async to dynamically update <head> per route.
 */

export const SITE_URL = "https://www.sportxclub.in";
export const SITE_NAME = "SportXClub";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Build a full page title with brand suffix
 * @param {string} pageTitle - The page-specific title
 * @returns {string}
 */
export function buildTitle(pageTitle) {
  if (!pageTitle) return `${SITE_NAME} — Book Sports Venues, Turfs & Grounds Online in India`;
  return `${pageTitle} | ${SITE_NAME}`;
}

/**
 * Build canonical URL for a given path
 * @param {string} path - e.g. "/venues" or "/venues/123"
 * @returns {string}
 */
export function buildCanonical(path = "/") {
  return `${SITE_URL}${path}`;
}

/**
 * Generate LocalBusiness / SportsActivityLocation JSON-LD schema for a venue
 * @param {Object} venue - Venue data object
 * @returns {string} Stringified JSON-LD
 */
export function buildVenueSchema(venue) {
  if (!venue) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "name": venue.name || "Sports Venue",
    "description": venue.description || `Book ${venue.sport || "sports"} at ${venue.name}`,
    "url": `${SITE_URL}/venues/${venue.id}`,
    "image": venue.image || DEFAULT_OG_IMAGE,
    "priceRange": "₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, Credit Card, UPI",
    "openingHours": venue.opening_time && venue.closing_time
      ? `Mo-Su ${venue.opening_time}-${venue.closing_time}`
      : "Mo-Su 06:00-23:00",
  };

  // Add address if location data available
  const addr = typeof venue.location === "string" ? venue.location : venue.location?.address || "";
  const city = typeof venue.location === "object" ? venue.location?.city : "";
  if (addr || city) {
    schema.address = {
      "@type": "PostalAddress",
      "streetAddress": addr,
      "addressLocality": city || addr,
      "addressRegion": venue.state || "India",
      "addressCountry": "IN",
    };
  }

  // Add rating if available
  if (venue.rating && Number(venue.rating) > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": Number(venue.rating).toFixed(1),
      "reviewCount": Number(venue.reviews) || 1,
      "bestRating": "5",
      "worstRating": "1",
    };
  }

  // Add geo if available
  if (venue.lat && venue.lng) {
    schema.geo = {
      "@type": "GeoCoordinates",
      "latitude": venue.lat,
      "longitude": venue.lng,
    };
  }

  return JSON.stringify(schema);
}

/**
 * Generate SportsEvent JSON-LD schema for a tournament
 * @param {Object} tournament - Tournament data object
 * @returns {string} Stringified JSON-LD
 */
export function buildTournamentSchema(tournament) {
  if (!tournament) return null;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": tournament.name || "Sports Tournament",
    "description": tournament.description || `Join the ${tournament.name} tournament on SportXClub`,
    "sport": tournament.sport || "Sports",
    "startDate": tournament.start_date || tournament.startDate,
    "endDate": tournament.end_date || tournament.endDate,
    "url": `${SITE_URL}/tournaments`,
    "location": {
      "@type": "Place",
      "name": tournament.venue_name || tournament.location || "Sports Venue",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN",
      },
    },
    "organizer": {
      "@type": "Organization",
      "name": "SportXClub",
      "url": SITE_URL,
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  });
}

/**
 * SEO metadata configuration for all static pages
 */
export const PAGE_SEO = {
  home: {
    title: `${SITE_NAME} — Book Sports Venues, Turfs & Grounds Online in India`,
    description: "Book football turfs, cricket grounds, badminton courts & more near you. Find the best sports venues across India. Instant booking, real-time slot availability, best prices on SportXClub.",
    canonical: buildCanonical("/"),
    keywords: "book sports venue, turf booking, cricket ground booking, football ground near me, badminton court booking, sports booking india, book turf online",
  },
  venues: {
    title: buildTitle("Book Sports Venues & Turfs Near You"),
    description: "Browse and book the best football turfs, cricket grounds, badminton courts and sports venues near you. Real-time slot availability. Instant online booking. Best prices guaranteed.",
    canonical: buildCanonical("/venues"),
    keywords: "book turf online, sports venue near me, football turf booking, cricket ground booking, badminton court near me, futsal court booking",
  },
  tournaments: {
    title: buildTitle("Sports Tournaments Near You — Join & Play"),
    description: "Find and join football, cricket, badminton and other sports tournaments near you. Register your team and compete. Upcoming sports tournaments across India on SportXClub.",
    canonical: buildCanonical("/tournaments"),
    keywords: "sports tournaments india, football tournament near me, cricket tournament registration, badminton tournament, sports competition india",
  },
  community: {
    title: buildTitle("Sports Community — Connect, Play & Share"),
    description: "Join India's fastest growing sports community. Find teammates, share game highlights, and connect with sports lovers in your city on SportXClub.",
    canonical: buildCanonical("/community"),
    keywords: "sports community india, find sports teammates, sports social network, play sports near me",
  },
  aiAssistant: {
    title: buildTitle("AI Sports Assistant — Smart Venue & Game Recommendations"),
    description: "Get personalized sports venue recommendations, game tips, and booking assistance from our AI Sports Assistant powered by advanced AI.",
    canonical: buildCanonical("/ai-assistant"),
    keywords: "ai sports assistant, sports venue recommendations, sports booking ai",
  },
  squadBooking: {
    title: buildTitle("Squad Booking — Book a Venue for Your Team"),
    description: "Book sports venues for your entire squad. Group booking for football, cricket, badminton and more. Easy team booking on SportXClub.",
    canonical: buildCanonical("/squad-booking"),
    keywords: "squad booking sports, team venue booking, group sports booking",
  },
  terms: {
    title: buildTitle("Terms & Conditions"),
    description: "Read SportXClub's Terms and Conditions. Understand your rights and responsibilities when using our sports venue booking platform.",
    canonical: buildCanonical("/terms"),
  },
  privacy: {
    title: buildTitle("Privacy Policy"),
    description: "SportXClub's Privacy Policy. Learn how we collect, use, and protect your personal data on our sports booking platform.",
    canonical: buildCanonical("/privacy"),
  },
  refundPolicy: {
    title: buildTitle("Refund & Cancellation Policy"),
    description: "Understand SportXClub's refund and cancellation policy for sports venue bookings. Easy cancellations and transparent refund process.",
    canonical: buildCanonical("/refund-policy"),
  },
  login: {
    title: buildTitle("Login — Access Your SportXClub Account"),
    description: "Login to your SportXClub account to manage bookings, view upcoming games and tournaments.",
    canonical: buildCanonical("/login"),
  },
  register: {
    title: buildTitle("Sign Up — Create Your SportXClub Account"),
    description: "Create a free SportXClub account to book sports venues, join tournaments and connect with sports lovers near you.",
    canonical: buildCanonical("/register"),
  },
};
