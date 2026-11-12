# Quest Board — Firebase Auth & Caching (Task 6)

A React single page application for browsing and posting fantasy guild quests.
Task 5 (React Router) extended with **Firebase Authentication**, **environment variables**
and a **cache for server data**. Everything from Task 5 still works: all routes, search,
filters, sorting, pagination, quest details, status changes, posting a quest and the dashboard.

- **Deployed app:** _add your Vercel URL here_
- **Stack:** React 18, React Router, Firebase Authentication, Vite, plain CSS

## Routes

| Route         | Page            | Access                                   |
| ------------- | --------------- | ---------------------------------------- |
| `/`           | Home            | everyone                                 |
| `/about`      | About           | everyone                                 |
| `/quests`     | Quests list     | everyone                                 |
| `/quests/:id` | Quest details   | everyone                                 |
| `/dashboard`  | Dashboard       | everyone                                 |
| `/login`      | Login           | guests only (logged-in → `/profile`)     |
| `/signup`     | Sign up         | guests only (logged-in → `/profile`)     |
| `/profile`    | Profile         | logged-in only (guest → `/login`)        |
| `*`           | Not Found (404) | everyone                                 |

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

Import the repository, set **Root Directory** to `task6`, framework **Vite**, and add the four
`VITE_FIREBASE_*` variables in **Settings → Environment Variables**. `vercel.json` sends every
path to `index.html`, so direct links and refresh work. Add the Vercel domain in
Firebase → Authentication → Settings → **Authorized domains** (needed for Google sign-in).
