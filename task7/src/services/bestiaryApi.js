// Public API: D&D 5e monsters (https://www.dnd5eapi.co), no key needed.
// These are real network requests, so the service worker can cache them
// (network-first) and show them offline.

const API_URL = "https://www.dnd5eapi.co/api/2014";

export class NotFoundError extends Error {}
export class OfflineError extends Error {}

/**
 * Every function returns { data, fromCache, cachedAt }.
 * fromCache is true when the service worker answered from its cache
 * (it adds the headers X-SW-Cache and X-SW-Cached-At).
 */
async function request(path, { signal } = {}) {
  let response;
  try {
    response = await fetch(API_URL + path, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    // No service worker (npm run dev) or a real network error
    throw navigator.onLine
      ? new Error("Could not reach the bestiary. Check your connection and try again.")
      : new OfflineError("You are offline and this page was not saved on this device yet.");
  }

  // The service worker had nothing saved for this request
  if (response.headers.get("X-SW-Offline")) {
    throw new OfflineError("You are offline and this page was not saved on this device yet.");
  }
  if (response.status === 404) throw new NotFoundError("This monster is not in the bestiary.");
  if (!response.ok) throw new Error(`The bestiary answered with an error (${response.status}).`);

  return {
    data: await response.json(),
    fromCache: response.headers.get("X-SW-Cache") === "hit",
    cachedAt: Number(response.headers.get("X-SW-Cached-At")) || null,
  };
}

// List: { count, results: [{ index, name, url }] }
export function fetchMonsters({ signal } = {}) {
  return request("/monsters", { signal });
}

// Details of one monster by its index, for example "adult-red-dragon"
export function fetchMonster(index, { signal } = {}) {
  return request(`/monsters/${encodeURIComponent(index)}`, { signal });
}
