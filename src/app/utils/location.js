/**
 * Utility for automatic geolocation detection and reverse geocoding
 */
export async function detectUserCity() {
  if (typeof window !== "undefined") {
    const cachedCity = sessionStorage.getItem("spx_detected_city") || localStorage.getItem("preferred-city");
    if (cachedCity && cachedCity !== "All" && cachedCity !== "All Cities") {
      return cachedCity;
    }
  }

  // Helper fetch with timeout
  const fetchWithTimeout = async (url, options = {}, timeoutMs = 2500) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      return null;
    }
  };

  // 1. Try Browser Geolocation API first with short timeout
  if (typeof window !== "undefined" && "geolocation" in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 2500,
          enableHighAccuracy: false,
          maximumAge: 600000, // 10 minutes cache
        });
      });
      const { latitude, longitude } = position.coords;

      // Reverse Geocode using BigDataCloud or OpenStreetMap
      try {
        const res = await fetchWithTimeout(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          {},
          2000
        );
        if (res && res.ok) {
          const data = await res.json();
          const city =
            data.city ||
            (data.localityInfo?.administrative?.find((a) => a.adminLevel === 6 || a.adminLevel === 5 || a.adminLevel === 4)?.name) ||
            data.locality ||
            data.principalSubdivision;
          if (city && city.trim()) {
            const trimmed = city.trim();
            sessionStorage.setItem("spx_detected_city", trimmed);
            return trimmed;
          }
        }
      } catch (err) {
        console.warn("[GEOLOCATION] Geocode fast fallback:", err);
      }
    } catch (e) {
      // Browser position denied or timed out
    }
  }

  // 2. Fast Fallback to IP Geolocation
  try {
    const fallbackRes = await fetchWithTimeout("https://api.bigdatacloud.net/data/reverse-geocode-client", {}, 2000);
    if (fallbackRes && fallbackRes.ok) {
      const fallbackData = await fallbackRes.json();
      const city = fallbackData.city || fallbackData.principalSubdivision || fallbackData.locality;
      if (city && city.trim()) {
        const trimmed = city.trim();
        sessionStorage.setItem("spx_detected_city", trimmed);
        return trimmed;
      }
    }
  } catch (err) {}

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
