/**
 * FastCache: Stale-While-Revalidate (SWR) Client Caching Layer
 * Provides instant 0ms data retrieval for public API endpoints
 * and silently revalidates in the background.
 */

const memoryCache = new Map();
const CACHE_PREFIX = "spx_cache_";
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const fastCache = {
  get(key) {
    try {
      // 1. Check in-memory first
      if (memoryCache.has(key)) {
        const item = memoryCache.get(key);
        if (Date.now() < item.expiry) {
          return item.data;
        }
      }

      // 2. Check sessionStorage
      const raw = sessionStorage.getItem(CACHE_PREFIX + key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() < parsed.expiry) {
          memoryCache.set(key, parsed);
          return parsed.data;
        } else {
          sessionStorage.removeItem(CACHE_PREFIX + key);
        }
      }
    } catch (e) {
      console.warn("fastCache get error:", e);
    }
    return null;
  },

  set(key, data, ttlMs = DEFAULT_TTL_MS) {
    try {
      const entry = {
        data,
        expiry: Date.now() + ttlMs,
        updatedAt: Date.now(),
      };
      memoryCache.set(key, entry);
      sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (e) {
      console.warn("fastCache set error (storage full or quota exceeded):", e);
    }
  },

  invalidate(key) {
    try {
      memoryCache.delete(key);
      sessionStorage.removeItem(CACHE_PREFIX + key);
    } catch (e) {}
  },

  invalidateAll() {
    try {
      memoryCache.clear();
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith(CACHE_PREFIX)) {
          sessionStorage.removeItem(k);
        }
      });
    } catch (e) {}
  },

  /**
   * Fast Fetch with Stale-While-Revalidate pattern
   * @param {string} url - API Endpoint
   * @param {object} options - Fetch options
   * @param {function} onRevalidate - Optional callback called when background fetch completes with fresh data
   * @param {number} ttlMs - Cache duration
   */
  async fetchWithSWR(url, options = {}, onRevalidate = null, ttlMs = DEFAULT_TTL_MS) {
    const key = url;
    const cached = this.get(key);

    // Background revalidation
    const revalidatePromise = (async () => {
      try {
        const res = await fetch(url, options);
        if (res.ok) {
          const freshData = await res.json();
          this.set(key, freshData, ttlMs);
          if (onRevalidate) {
            onRevalidate(freshData);
          }
          return freshData;
        }
      } catch (err) {
        console.warn("Background cache revalidation failed for", url, err);
      }
      return null;
    })();

    // If cache hit, return immediately (0ms delay)
    if (cached) {
      return cached;
    }

    // If cache miss, wait for revalidate promise
    return await revalidatePromise;
  },
};
