/**
 * Utility for automatic geolocation detection and reverse geocoding
 */
export async function detectUserCity() {
  // 1. Try Browser Geolocation API first
  if (typeof window !== "undefined" && "geolocation" in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000,
          enableHighAccuracy: true,
          maximumAge: 0,
        });
      });
      const { latitude, longitude } = position.coords;

      // Reverse Geocode using OpenStreetMap Nominatim first (Very accurate city/district/suburb)
      try {
        const osmRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        if (osmRes.ok) {
          const osmData = await osmRes.json();
          const addr = osmData.address || {};
          const cityCandidate =
            addr.city ||
            addr.town ||
            addr.state_district ||
            addr.district ||
            addr.county ||
            addr.suburb ||
            addr.village ||
            addr.municipality;

          if (cityCandidate && cityCandidate.trim()) {
            return cityCandidate.trim();
          }
        }
      } catch (err) {
        console.warn("[GEOLOCATION] OpenStreetMap fallback to BigDataCloud:", err);
      }

      // Secondary: BigDataCloud Reverse Geocoding
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      if (res.ok) {
        const data = await res.json();
        const city =
          data.city ||
          (data.localityInfo && data.localityInfo.administrative && (
            data.localityInfo.administrative.find((a) => a.adminLevel === 6 || a.adminLevel === 5 || a.adminLevel === 4)?.name
          )) ||
          data.locality ||
          data.principalSubdivision;
        if (city && city.trim()) {
          return city.trim();
        }
      }
    } catch (e) {
      console.warn("[GEOLOCATION] Browser position unavailable or permission denied, attempting IP fallback:", e);
    }
  }

  // 2. Fallback to IP Geolocation if browser position fails or is denied
  try {
    const ipRes = await fetch("https://ipapi.co/json/");
    if (ipRes.ok) {
      const ipData = await ipRes.json();
      if (ipData && (ipData.city || ipData.region)) {
        return ipData.city || ipData.region;
      }
    }
  } catch (e) {
    try {
      const fallbackRes = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client");
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const city = fallbackData.city || fallbackData.principalSubdivision || fallbackData.locality;
        if (city) return city;
      }
    } catch (err) {}
  }

  return "Mumbai";
}

/**
 * Opens location query in Google Maps (or Apple Maps for iOS/macOS)
 */
export function openMapLocation(locationStr) {
  if (!locationStr) return;
  const locText = typeof locationStr === "string" 
    ? locationStr 
    : (locationStr.city || locationStr.address || locationStr.name || "");
  
  if (!locText || !locText.trim()) return;

  const isApple = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent) && !window.MSStream;
  const query = encodeURIComponent(locText.trim());
  
  const mapUrl = isApple
    ? `https://maps.apple.com/?q=${query}`
    : `https://www.google.com/maps/search/?api=1&query=${query}`;

  window.open(mapUrl, "_blank", "noopener,noreferrer");
}
