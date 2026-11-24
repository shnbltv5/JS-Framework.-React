// Quest Board service worker (written by hand, no Workbox).
//
// During `npm run build` the plugin in sw/vite-plugin.js adds two constants on top of this file
// and saves it as dist/sw.js:
//   VERSION       — a hash of all built files; it changes after every code change
//   PRECACHE_URLS — the app shell: built JS/CSS, index.html, icons, manifest, offline page

const PREFIX = "quest-board";
const PRECACHE = `${PREFIX}-precache-${VERSION}`; // app shell of this version
const PAGES = `${PREFIX}-pages-${VERSION}`; // pages the user has visited (HTML)
const API = `${PREFIX}-api-v1`; // public API data (D&D monsters)
const STATIC = `${PREFIX}-static-v1`; // images and Google Fonts
const CURRENT_CACHES = [PRECACHE, PAGES, API, STATIC];

const OFFLINE_URL = "/offline.html";
const API_ORIGIN = "https://www.dnd5eapi.co";
const FONT_ORIGINS = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

const NETWORK_TIMEOUT_MS = 4000; // slower than this -> answer from the cache
const LIMITS = {
  [PAGES]: { maxEntries: 30 },
  [API]: { maxEntries: 80 },
  [STATIC]: { maxEntries: 40, maxAgeMs: 30 * 24 * 60 * 60 * 1000 }, // 30 days
};

// ---------- lifecycle ----------

// install: download and save the app shell. The new worker then waits
// until the user presses "Update" (see the message listener below).
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PRECACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
});

// activate: delete caches of old versions, then control the open pages right away
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      const outdated = names.filter((name) => name.startsWith(PREFIX) && !CURRENT_CACHES.includes(name));

      // Pages visited with the old version stay available offline (with the new index.html)
      for (const name of outdated.filter((n) => n.startsWith(`${PREFIX}-pages-`))) {
        const oldPages = await (await caches.open(name)).keys();
        for (const page of oldPages) await savePage(page.url);
      }

      await Promise.all(outdated.map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  // The user pressed "Update" in the app: the waiting worker becomes active
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();

  // The app tells us which page is open (also pages opened by React Router without a reload).
  // Every page is the same index.html, so we save the precached copy under that address.
  if (event.data?.type === "PAGE_VISITED") event.waitUntil(savePage(event.data.url));
});

// ---------- fetch: choose a strategy for every request ----------

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // POST (Firebase login, sign up) always goes to the network

  const url = new URL(request.url);

  // 1. Page navigation: network-first, offline -> saved page or the offline page
  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // 2. App shell (built JS/CSS, icons, manifest): cache-first from the precache
  if (url.origin === self.location.origin && !url.search && PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(cacheFirst(request, PRECACHE));
    return;
  }

  // 3. Public API (list and details of monsters): network-first, cache when offline
  if (url.origin === API_ORIGIN && url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(event, API));
    return;
  }

  // 4. Static files: other images of our site and Google Fonts: cache-first
  const isImage = url.origin === self.location.origin && request.destination === "image";
  if (isImage || FONT_ORIGINS.includes(url.origin)) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }

  // 5. Everything else is not touched and is never cached:
  //    Firebase Authentication, Google sign-in, tokens and user data.
});

// ---------- strategies ----------

async function handleNavigation(request) {
  const url = new URL(request.url);
  if (url.pathname === "/offline") return fromCache(OFFLINE_URL, PRECACHE);

  try {
    const response = await fetchWithTimeout(request, NETWORK_TIMEOUT_MS);
    if (response.ok) await putInCache(PAGES, pageKey(url), response.clone());
    return response;
  } catch {
    // No internet: a page the user has visited before, otherwise the offline page
    const saved = await fromCache(pageKey(url), PAGES);
    return saved ?? fromCache(OFFLINE_URL, PRECACHE);
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await fromCache(request, cacheName);
  if (cached && !isExpired(cached, cacheName)) return cached;

  try {
    const response = await fetch(request);
    if (response.ok || response.type === "opaque") await putInCache(cacheName, request, response.clone());
    return response;
  } catch (error) {
    if (cached) return cached; // expired, but better than nothing while offline
    return Response.error(); // a failed image/font: the page keeps working without it
  }
}

async function networkFirst(event, cacheName) {
  const { request } = event;
  const networkRequest = fetch(request).then(async (response) => {
    if (response.ok) await putInCache(cacheName, request, response.clone());
    return response;
  });
  // If the timeout wins, the request keeps running and still updates the cache
  event.waitUntil(networkRequest.catch(() => {}));

  try {
    return await withTimeout(networkRequest, NETWORK_TIMEOUT_MS);
  } catch {
    const cached = await fromCache(request, cacheName);
    if (cached) return markAsCached(cached);
    // Not saved and no network: a clear JSON error instead of a crash
    return new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json", "X-SW-Offline": "true" },
    });
  }
}

// ---------- helpers ----------

// Pages are saved without ?query, so /bestiary?page=2 opens offline if /bestiary was visited
function pageKey(url) {
  return url.origin + url.pathname;
}

async function savePage(href) {
  const url = new URL(href);
  if (url.pathname === "/offline" || url.pathname === OFFLINE_URL) return;
  const shell = await fromCache("/index.html", PRECACHE);
  if (shell) await putInCache(PAGES, pageKey(url), shell);
}

// ignoreVary: a server can answer with "Vary: Origin" (vite preview does). The browser sends
// Origin for lazy pages loaded with import(), but not for files saved during install,
// so without this option the saved files would not be found.
function fromCache(request, cacheName) {
  return caches.match(request, { cacheName, ignoreVary: true });
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

function fetchWithTimeout(request, ms) {
  return withTimeout(fetch(request), ms);
}

// Saves a response with the time it was saved (header X-SW-Cached-At)
// and removes the oldest entries when the cache is over its limit.
async function putInCache(cacheName, request, response) {
  const cache = await caches.open(cacheName);
  let stored = response;
  if (response.type !== "opaque") {
    const headers = new Headers(response.headers);
    headers.set("X-SW-Cached-At", String(Date.now()));
    stored = new Response(await response.blob(), { status: response.status, statusText: response.statusText, headers });
  }
  await cache.delete(request); // so the entry moves to the end (newest)
  await cache.put(request, stored);
  await trimCache(cache, LIMITS[cacheName]?.maxEntries);
}

async function trimCache(cache, maxEntries) {
  if (!maxEntries) return;
  const keys = await cache.keys(); // oldest first
  const extra = keys.slice(0, Math.max(0, keys.length - maxEntries));
  await Promise.all(extra.map((key) => cache.delete(key)));
}

function isExpired(response, cacheName) {
  const maxAgeMs = LIMITS[cacheName]?.maxAgeMs;
  const savedAt = Number(response.headers.get("X-SW-Cached-At"));
  return Boolean(maxAgeMs && savedAt && Date.now() - savedAt > maxAgeMs);
}

// The app reads this header and shows "You are viewing saved data"
function markAsCached(response) {
  const headers = new Headers(response.headers);
  headers.set("X-SW-Cache", "hit");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
