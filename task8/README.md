# Quest Board — Redux Toolkit (Task 8)

A React single page application for browsing and posting fantasy guild quests.
In Task 8 the data layer was refactored to **Redux Toolkit**. Everything from the earlier tasks still works:
all routes, Firebase Authentication, protected pages, search (now with **debounce**), filters, sorting and
pagination in the URL, quest details, posting a quest, status changes, the dashboard, the Bestiary (public API),
the installable PWA, the service worker and offline mode.

- **Deployed app:** _add the Vercel link here_
- **Stack:** React 18, **Redux Toolkit + React Redux**, React Router, Firebase Authentication, Vite, plain CSS,
  a hand-written service worker
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

## Redux Toolkit

### Project structure

```
src/
  store/index.js                 configureStore: quests + dashboard + bestiary reducers
  features/
    shared.js                    cache time (60 s), error -> { message, kind }, status helper
    quests/
      questsThunks.js            fetchQuests, fetchQuestById, createQuest, updateQuestStatus
      questsSlice.js             entities, lists, details, create / statusUpdate state
      questsSelectors.js         selectQuestById, selectListState, selectVisibleQuests (memoized) ...
    dashboard/
      dashboardThunks.js         fetchAllQuests
      dashboardSlice.js          ids of all quests + loading state
      dashboardSelectors.js      selectDashboardQuests, selectDashboardStats (memoized)
      calculateStats.js          pure statistics functions
    bestiary/
      bestiaryThunks.js          fetchMonsters, fetchMonster
      bestiarySlice.js           monster list + opened monsters, with offline-copy info
      bestiarySelectors.js       selectMonster, selectFilteredMonsters (memoized)
  services/                      API only (no Redux): service.js, bestiaryApi.js, authService.js
  hooks/                         useQuestList, useQuest, useDashboard, useMonsters / useMonster,
                                 useDebouncedValue, useQuestFilters (URL), useOnlineStatus
  components/, pages/            UI: read with useSelector (through the hooks), change with useDispatch
```

`main.jsx` wraps the app in `<Provider store={store}>`. Redux logic (`features/`), API calls (`services/`),
hooks (`hooks/`) and UI (`components/`, `pages/`) are separate.

### Slices

| Slice | State | Why |
| ----- | ----- | --- |
| `quests` | `entities` (id → quest), `loadedAt`, `lists` (by key), `details` (by id), `create`, `statusUpdate`, `listsVersion` | All quest objects are stored **once** in `entities`. Lists and the dashboard keep only **ids**, so a status change updates one object and every page shows it. |
| `dashboard` | `ids`, `status`, `error`, `fetchedAt`, `loaded`, `version` | Which quests are counted. The statistics are **not** stored: a memoized selector calculates them. |
| `bestiary` | `list` (items, status, error, `fromCache`, `cachedAt`, `loadedAt`), `details` (index → monster) | Public API data. `fromCache` comes from the service worker header and shows the "saved data" notice. |

### Async thunks (`createAsyncThunk`)

| Thunk | Type | What it does |
| ----- | ---- | ------------ |
| `fetchQuests` | list | One page for search / filters / sort / page. Skipped if the same list was loaded < 60 s ago (`condition`). |
| `fetchQuestById` | details | One quest. Skipped if the quest is already in the store and fresh — opening a quest from the list sends no request. |
| `createQuest` | mutation | Posts a quest. On success the lists and the dashboard are marked outdated and load again. |
| `updateQuestStatus` | business operation | Accept / complete / abandon / reopen. Updates the entity; lists and dashboard reload. |
| `fetchAllQuests` | list | All quests for the dashboard; objects are saved by the `quests` slice (cross-slice `extraReducers`). |
| `fetchMonsters`, `fetchMonster` | list, details | Bestiary. Loaded again only when we have nothing or only an offline copy. |

Every thunk catches the service error and returns `rejectWithValue({ message, kind })`
(`kind` = `not-found`, `offline` or `error`), because Redux state must be serializable.
`pending`, `fulfilled` and `rejected` are handled in `extraReducers` of the slices.

### Selectors

| Selector | Memoized | Used by |
| -------- | -------- | ------- |
| `selectVisibleQuests(state, key)` | ✅ `createSelector` | Quests page: list ids → quest objects |
| `selectDashboardQuests(state)` | ✅ `createSelector` | dashboard ids → quest objects |
| `selectDashboardStats(state, region)` | ✅ `createSelector` | Dashboard: statistics are recalculated only when quests or region change |
| `selectFilteredMonsters(state, search)` | ✅ `createSelector` | Bestiary search over 334 monsters |
| `selectQuestById`, `selectListState`, `selectDetailsState`, `selectCreateState`, `selectStatusUpdate`, `selectMonster`, `selectMonsterList` | simple | hooks and components |

### Loading, errors, retries, stale requests

- **Loading / error / empty / success:** every list and details entry has `status`
  (`idle → loading → succeeded | failed`) and `error`. Pages show loading, an error with **Try again**,
  "not found", an empty state, or the data.
- **Retry:** `retry()` dispatches the thunk again with `force: true` (skips the cache check).
- **Stale requests:** the hooks call `request.abort()` in the `useEffect` cleanup (new filters, new id,
  leaving the page). Every entry stores the `requestId` of its newest request, and `fulfilled` / `rejected`
  of an older request are ignored.
- **No unnecessary requests:** `condition` of the thunks skips data that is already in the store and fresh
  (60 s). Going back to a list page, reopening the dashboard or opening a quest from the list is instant.
- **Refresh after mutations:** `createQuest.fulfilled` and `updateQuestStatus.fulfilled` clear the saved lists
  (`listsVersion + 1`) and the dashboard (`version + 1`); the hooks depend on these numbers and load again.

### What is NOT in Redux (on purpose)

- **Authentication** stays in `AuthContext`: Firebase keeps the session itself and gives a `user`
  object with methods (not serializable). Context only shares it with the app.
- **Filters, sorting, page, search text** stay in the **URL** (`useSearchParams`): they survive refresh, links
  and Back/Forward. Copying them into Redux would duplicate state.
- **Temporary UI state** (form inputs, "form open", mobile menu, update prompt) stays in `useState`.
- The search request is **debounced** (`useDebouncedValue`, 400 ms): the URL changes on every letter,
  the request waits for a pause in typing.

Install **Redux DevTools** in Chrome to see every action (`quests/fetchList/pending`, `.../fulfilled` …) and the state.

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
- When the connection comes back, the Bestiary hooks load the data again (the `online` event).
- Offline, data that Redux loaded earlier also shows the "saved data" notice.
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

Import the repository, set **Root Directory** to `task8`, framework **Vite**, and add the four
`VITE_FIREBASE_*` variables in **Settings → Environment Variables**. `vercel.json` sends every
path to `index.html`, so direct links and refresh work, sends `/offline` to `offline.html` and
turns off HTTP caching for `sw.js`. Add the Vercel domain in
Firebase → Authentication → Settings → **Authorized domains** (needed for Google sign-in).
