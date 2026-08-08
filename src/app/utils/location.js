/**
 * Utility for automatic geolocation detection and reverse geocoding
 */
export async function detectUserCity() {
  // 1. Try Browser Geolocation API first
  if (typeof window !== "undefined" && "geolocation" in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 6000,
          enableHighAccuracy: true,
        });
      });
      const { latitude, longitude } = position.coords;

      // Reverse Geocode using BigDataCloud API (Free, fast, no API key required)
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      if (res.ok) {
        const data = await res.json();
        const city =
          data.city ||
          data.locality ||
          data.principalSubdivision ||
          (data.localityInfo && data.localityInfo.administrative && data.localityInfo.administrative[2] && data.localityInfo.administrative[2].name);
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
      if (ipData && ipData.city) {
        return ipData.city;
      }
    }
  } catch (e) {
    try {
      const fallbackRes = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client");
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const city = fallbackData.city || fallbackData.locality || fallbackData.principalSubdivision;
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
