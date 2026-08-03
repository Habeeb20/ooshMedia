// utils/geocodeCache.js

const CACHE_KEY = "geocode_cache_v1";
const TTL = 1000 * 60 * 60 * 24 * 30; // 30 days — LGA/state coordinates don't move

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable — cache just won't persist across reloads
  }
}

let memoryCache = null;
function getMemoryCache() {
  if (!memoryCache) memoryCache = loadCache();
  return memoryCache;
}

export function getCachedCoords(key) {
  const cache = getMemoryCache();
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL) {
    delete cache[key];
    saveCache(cache);
    return null;
  }
  return entry.coords;
}

export function setCachedCoords(key, coords) {
  const cache = getMemoryCache();
  cache[key] = { coords, timestamp: Date.now() };
  saveCache(cache);
}

// Prevents two components mounting simultaneously from both firing
// a geocode request for the same key before either has cached a result.
const inFlight = new Map();

export async function geocodeWithCache(key, fetchFn) {
  const cached = getCachedCoords(key);
  if (cached) return cached;

  if (inFlight.has(key)) return inFlight.get(key);

  const promise = fetchFn()
    .then((coords) => {
      if (coords) setCachedCoords(key, coords);
      inFlight.delete(key);
      return coords;
    })
    .catch((err) => {
      inFlight.delete(key);
      throw err;
    });

  inFlight.set(key, promise);
  return promise;
}