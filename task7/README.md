# Quest Board — Progressive Web App (Task 7)

A React single page application for browsing and posting fantasy guild quests,
now an **installable Progressive Web App** that keeps working **offline**.
Everything from Task 6 still works: all routes, Firebase Authentication, protected pages,
search, filters, sorting, pagination, quest details, status changes, posting a quest,
the dashboard and the in-memory cache.

- **Deployed app:** _add the Vercel link here_
- **Stack:** React 18, React Router, Firebase Authentication, Vite, plain CSS, a hand-written service worker
- **Public API:** [D&D 5e API](https://www.dnd5eapi.co) for the Bestiary pages

## Routes

| Route         | Page            | Access                                   |
| ------------- | --------------- | ---------------------------------------- |
| `/`           | Home            | everyone                                 |
| `/about`      | About           | everyone                                 |
| `/quests`     | Quests list     | everyone                                 |
| `/quests/:id` | Quest details   | everyone                                 |
| `/dashboard`  | Dashboard       | everyone                                 |
| `/bestiary`   | Bestiary (public API list) | everyone                      |
| `/bestiary/:index` | Monster details (public API) | everyone                 |
| `/offline`    | Offline page (static `offline.html`, precached) | everyone   |
| `/login`      | Login           | guests only (logged-in → `/profile`)     |
| `/signup`     | Sign up         | guests only (logged-in → `/profile`)     |
| `/profile`    | Profile         | logged-in only (guest → `/login`)        |
| `*`           | Not Found (404) | everyone                                 |

## Progressive Web App

| File | What it does |
| ---- | ------------ |
| `public/manifest.json` | name, short_name, start_url, scope, `display: standalone`, theme and background color, icons 192, 512 and maskable 512 |
| `index.html` | links the manifest, theme-color, favicon and apple-touch-icon |
| `sw/service-worker.js` | the service worker (no Workbox) |
| `sw/vite-plugin.js` | during `npm run build` creates `dist/sw.js` with the precache list and a version |
| `src/pwa/registerServiceWorker.js` | registers `/sw.js` (production only) and handles updates |
| `src/components/UpdatePrompt.jsx` | "A new version is available" + **Update now** |
| `src/hooks/useOnlineStatus.js` | online/offline state from the `online` / `offline` events |
| `public/offline.html` | the offline page with **Retry Connection** |

### Service worker lifecycle

- **install** — saves the app shell in `quest-board-precache-<version>`: built JS/CSS, `index.html`,
  icons, manifest and `offline.html`.
- **activate** — deletes caches of old versions, keeps visited pages, then `clients.claim()`.
- **fetch** — chooses a strategy for each request (below).
- **Updates** — after a new deploy the browser downloads the new `sw.js` (it is never taken from the HTTP
  cache: `updateViaCache: "none"`, `Cache-Control: no-cache` in `vercel.json`, a check every 30 min).
  The new worker waits; the app shows **Update now**; the button sends `SKIP_WAITING`,
  the new worker activates and the page reloads once. Nothing has to be cleared by hand,
  `localStorage` and the login session stay.

### Caching strategies

| Requests | Strategy | Cache | Limit |
| -------- | -------- | ----- | ----- |
| App shell (JS, CSS, icons, manifest, offline page) | precache, cache-first | `quest-board-precache-<version>` | replaced on every version |
| Page navigation | network-first (4 s timeout) → saved page → `offline.html` | `quest-board-pages-<version>` | 30 pages |
| D&D API list and details | **network-first** (4 s timeout) → cached copy | `quest-board-api-v1` | 80 responses |
| Images and Google Fonts | **cache-first** | `quest-board-static-v1` | 40 files, 30 days |
| Firebase Auth, Google sign-in, all POST requests | **not cached** (network only) | — | — |

- When the API answer comes from the cache, the service worker adds the header `X-SW-Cache: hit`
  and the time it was saved (`X-SW-Cached-At`). The Bestiary shows **"You are viewing saved data from …"**.
- A request that is not saved while offline gets a JSON `503` instead of a crash; the page shows
  "Not available offline" with **Try again** and a link to the offline page.
- When the connection comes back, `useFetch` loads the data again (the `online` event).
- Quest data lives in `localStorage` (simulated API), so quests also work offline.

### Offline

- `/offline` is a static page with its own styles; it is precached, so it opens without internet.
- **Retry Connection** sends a real request (not only `navigator.onLine`) and opens the wanted page again.
- An unvisited page opened offline shows the offline page; visited pages open from the cache.
- The NavBar shows **Online / Offline**, and an offline banner appears under the header.

## Mobile

- Works from **320px** wide, portrait and landscape, without horizontal scroll.
- Under 720px the navigation becomes a **Menu** button (`aria-expanded`), the menu closes after a click.
- Buttons, links and inputs are at least 44px high on touch screens; inputs use 16px text (no zoom on iOS).
- All grids use `minmax(min(…px, 100%), 1fr)`; on phones the pagination shows Previous / current / Next.

### How to check the PWA locally

```bash
npm install
npm run build
npm run preview   # http://localhost:4173 — the service worker works only in the build
```

DevTools → **Application**: Manifest (installable), Service workers, Cache storage.
**Network → Offline** to test offline mode. Lighthouse → "Progressive Web App"/installability.

## Authentication

- `src/firebase.js` — initializes Firebase from `VITE_FIREBASE_*` variables.
- `src/services/authService.js` — `signUp`, `logIn`, `logInWithGoogle`, `logOut` and readable error messages.
- `src/context/AuthContext.jsx` — `AuthProvider` + `useAuth()`. It subscribes to
  `onAuthStateChanged` (and unsubscribes in the effect cleanup) and keeps `user` and `loading`.
- **Sessions persist after refresh:** Firebase keeps the session in the browser (local persistence);
  on page load `onAuthStateChanged` returns the saved user.
- **Auth loading:** until Firebase answers, `loading` is `true` — guards show "Checking your session…"
  instead of redirecting, and the NavBar hides Login/Profile links.
- `ProtectedRoute` — guests are redirected to `/login` (the wanted page is remembered and opened after login).
- `GuestRoute` — logged-in users can't open `/login` or `/signup`.
- NavBar shows **Login / Sign up** for guests and **Profile / Logout** for logged-in users.
- Signup validation: valid email, password ≥ 6 characters, passwords must match.

## Caching strategy

The cache is a small custom service: `src/services/queryCache.js` (no library).
Quest functions for the UI are in `src/services/quests.js`; components never call the API directly.

| Resource           | Query key                                   | Used by       |
| ------------------ | ------------------------------------------- | ------------- |
| Page of the list   | `["quests", "list", { search, region, difficulty, status, sort, page, pageSize }]` | Quests page   |
| One quest          | `["quests", "detail", id]`                  | Quest details |
| All quests         | `["quests", "everything"]`                  | Dashboard     |

**When cached data is used:** a key is stored after a successful response. For **60 seconds (TTL)**
the same key is answered from memory without a request (cache **hit**). After 60 seconds the
data is stale and the next read sends a new request (cache **miss**). If the same request is
already running, the second caller waits for it instead of sending a duplicate.

**When the cache is invalidated:** after **creating a quest** and after **changing a quest's
status**, every key that starts with `["quests"]` is removed, so lists, details and dashboard
statistics are loaded fresh. Failed requests are never cached. The cache lives in memory,
so a page reload also clears it (the quest data itself is kept by the simulated API in `localStorage`).

**Outdated requests:** every screen aborts its previous request in the `useFetch` effect cleanup
(`AbortController`). A request that finishes after its key was invalidated is not saved.

Open the browser console to see `[cache] HIT / MISS / STALE / WAIT / INVALIDATE` messages.

## Environment variables

1. Copy `.env.example` to `.env.local`.
2. Fill in the values from Firebase Console → Project settings → Your apps → SDK setup and configuration.

`.env.local` is in `.gitignore`. `VITE_` variables are built into the browser bundle: this is a
public client config, not a secret. Access is protected by Firebase "Authorized domains".

## Run locally

```bash
npm install
npm run dev
```

## Deploy (Vercel)

Import the repository, set **Root Directory** to `task7`, framework **Vite**, and add the four
`VITE_FIREBASE_*` variables in **Settings → Environment Variables**. `vercel.json` sends every
path to `index.html`, so direct links and refresh work, sends `/offline` to `offline.html` and
turns off HTTP caching for `sw.js`. Add the Vercel domain in
Firebase → Authentication → Settings → **Authorized domains** (needed for Google sign-in).
