# Quest Board

A React single page application for browsing, searching and posting fantasy guild quests.
Midterm project for the React course (individual).

- **Deployed app:** _paste the public link here_
- **Stack:** React 18, Vite, plain CSS (no other libraries)

## Features

- **List view:** quest cards with status, difficulty, region and reward
- **Detail view:** full quest info, plus status actions (accept, complete, abandon, reopen)
- **Add a quest:** controlled form with validation and submit states
- **Search** by title/description, **filters** (region, difficulty, status), **sorting** (6 options), **pagination** (9 per page)
- **Loading, error, empty and success** states for every request, with a "Try again" action

## Data source

The app uses a **simulated API** (`src/api/questsApi.js`). It uses Promises, a random 300–900 ms delay,
a JSON seed file with **120 quests** (`src/data/quests.json`) and `localStorage` to keep changes between reloads.
Search, filtering, sorting and pagination are done inside the API, like on a real server.
To restore the original data, clear the site's `localStorage`.

## Project structure

```
src/
  api/questsApi.js        simulated async API
  data/quests.json        120 seed quests
  constants.js            regions, statuses, sort options, page size
  App.jsx                 selected quest + data version
  components/
    QuestBoard.jsx        list view: filters, page, request state, effect
    FilterBar.jsx         search / filters / sort inputs
    QuestList.jsx         renders the cards
    QuestCard.jsx         single quest card
    QuestAvatar.jsx       emoji icon for a quest
    Header.jsx            title bar
    Pagination.jsx        page buttons
    AddQuestForm.jsx      controlled form
    QuestDetail.jsx       detail view with its own effect
    StatusMessage.jsx     loading / error / empty message
    StatusBadge.jsx       status label
    DifficultyStars.jsx   difficulty display
```

## React concepts used

- State lives in the component that needs it (filters/page in `QuestBoard`, form values in `AddQuestForm`); `App` only holds the open quest id and a data version.
- `useEffect` fetches data with dependencies `[filters, page, version, retryCount]`.
- Every effect creates an `AbortController` and aborts it in cleanup, so outdated responses never overwrite newer ones (no race conditions).
- Lists use `key={quest.id}`. `QuestDetail` uses `key={selectedId}` to reset its state for a different quest.
- The board stays mounted (only hidden) while a quest is open, so filters and page are preserved.
- State updates are immutable (`{ ...prev, [name]: value }`).
- No direct DOM manipulation.

## Run locally

```bash
npm install
npm run dev
```

## Design

Same visual style as the previous coursework (dark wood background, parchment cards, Cinzel + Inter fonts).

## Build and deploy

```bash
npm run build
```

The `dist/` folder is a static site. Deploy on Vercel or Netlify by importing this GitHub repository
(build command `npm run build`, output directory `dist`). For GitHub Pages run `npm run deploy` (publishes `dist/` to the `gh-pages` branch). `vite.config.js` uses `base: "./"`, so assets load from any subfolder.
