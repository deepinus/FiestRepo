const KEYS = {
  PROFILE: 'audioguide_profile',
  TOUR_CACHE: 'audioguide_tour_cache',
  TOUR_HISTORY: 'audioguide_tour_history',
};

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.PROFILE));
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export function getCachedTours(city) {
  try {
    const cache = JSON.parse(localStorage.getItem(KEYS.TOUR_CACHE)) || {};
    const key = city.toLowerCase().trim();
    const entry = cache[key];
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      delete cache[key];
      localStorage.setItem(KEYS.TOUR_CACHE, JSON.stringify(cache));
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheTours(city, data) {
  try {
    const cache = JSON.parse(localStorage.getItem(KEYS.TOUR_CACHE)) || {};
    cache[city.toLowerCase().trim()] = { data, timestamp: Date.now() };
    localStorage.setItem(KEYS.TOUR_CACHE, JSON.stringify(cache));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

export function clearCachedTours(city) {
  try {
    const cache = JSON.parse(localStorage.getItem(KEYS.TOUR_CACHE)) || {};
    delete cache[city.toLowerCase().trim()];
    localStorage.setItem(KEYS.TOUR_CACHE, JSON.stringify(cache));
  } catch {}
}

export function getTourHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.TOUR_HISTORY)) || [];
  } catch {
    return [];
  }
}

export function saveTourToHistory(entry) {
  try {
    const history = getTourHistory();
    history.unshift({ ...entry, id: Date.now() });
    localStorage.setItem(KEYS.TOUR_HISTORY, JSON.stringify(history.slice(0, 50)));
  } catch {}
}
