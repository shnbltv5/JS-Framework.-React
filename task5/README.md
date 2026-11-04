# Quest Board — React Router

A React single page application for browsing, searching and posting fantasy guild quests.
My midterm project, extended with **React Router**: pages, nested routes, URL parameters and lazy loading.

- **Deployed app:** https://shnbltv5.github.io/JS-Framework.-React/task5/
- **Stack:** React 18, React Router, Vite, plain CSS

## Routes

| Route         | Page            |
| ------------- | --------------- |
| `/`           | Home            |
| `/about`      | About           |
| `/quests`     | Quests list     |
| `/quests/:id` | Quest details   |
| `/dashboard`  | Dashboard       |
| `/login`      | Login           |
| `*`           | Not Found (404) |

## Features

- `RootLayout` with `NavBar` and `<Outlet />`; nested `quests` routes; `App.jsx` contains routing only
- **Quests:** reusable `QuestCard`, search, 3 filters (region, difficulty, status), 6 sort options, pagination (9 per page) — all stored in the URL with `useSearchParams`
- **Quest details:** `useParams` + request by id, 9 details, status actions (accept / complete / abandon / reopen), Back and All quests links
- **Post a quest:** controlled form with validation (from the midterm)
- **Dashboard:** 6 statistics, breakdowns by status, difficulty and region, top-5 rewards, region filter (in the URL), links to quests
- **Lazy loading:** 6 pages with `React.lazy` + `Suspense`
- Loading, error, empty and not-found states; outdated requests are cancelled with `AbortController`
- Custom 404 page; invalid ids (`/quests/abc`, `/quests/9999`) show "Quest not found"
- Direct URLs, page refresh and browser Back / Forward work everywhere

## Data source

A **simulated API** in `src/services/service.js`: Promises, a random 300–900 ms delay, a JSON seed file with
**120 quests** (`src/data/quests.json`) and `localStorage` to keep changes. Search, filtering, sorting and
pagination happen inside the API, like on a real server. To restore the original data, clear the site's `localStorage`.

## Project structure

```
src/
  main.jsx                 BrowserRouter + root
  App.jsx                  routes only (+ lazy imports)
  constants.js             regions, statuses, sort options, page size
  data/quests.json         120 seed quests
  services/service.js      all API requests (simulated async API)
  hooks/
    useFetch.js            loading / success / error, cancels old requests
    useQuestFilters.js     filters + page <-> URL search params
  layouts/RootLayout.jsx   NavBar + Suspense + Outlet + footer
  pages/                   Home, About, Quests, QuestDetails, Dashboard, Login, NotFound
  components/              NavBar, QuestCard, QuestList, FilterBar, Pagination, AddQuestForm,
                           QuestDetail, StatusMessage, StatusBadge, DifficultyStars, QuestAvatar
  styles/                  index.css (midterm styles), pages.css (new pages)
  assets/quest-board.svg
```

## Run locally

```bash
npm install
npm run dev
```

## Deploy (GitHub Pages, folder `task5` of the repo)

Automatic: every push to `main` that changes `task5/` runs `.github/workflows/deploy-task5.yml`,
which builds the app and publishes it to the `task5/` folder of the `gh-pages` branch.

Manual alternative:

```bash
npm run deploy
```

`vite.config.js` sets `base: "/JS-Framework.-React/task5/"` and `BrowserRouter` gets the same `basename`.
GitHub Pages has no server-side routing, so `gh-pages-root/404.html` (published to the root of `gh-pages`)
sends direct links like `/task5/quests/12` back to the app as `/task5/?route=/quests/12`,
and a small script in `index.html` restores the real URL before React starts.
Direct links, refresh and Back / Forward all work.
