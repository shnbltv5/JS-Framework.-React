# Quest Board — Task 4 (Async React: Effects & API)

React 18 + Vite. Only `useState` and `useEffect`; no custom hooks, no debounce, no fetching libraries.
The data lives in a fake async API (`src/api/fakeApi.js`: Promises, 500–3000 ms delay, 5 % error chance).
Only that file touches `localStorage`.

## Run
```
npm install
npm run dev
```

## Deploy (GitHub Pages, folder `task4` of the repo)
```
npm run deploy
```
Live: https://shnbltv5.github.io/JS-Framework.-React/task4/

## Requirements → where
| Requirement | Where |
|---|---|
| Load list with `useEffect` | `App.jsx` Effect 1, deps `[reloadCount]` |
| Create / Edit / Remove | `handleCreate`, `handleUpdate`, `handleRemove` + `QuestForm` |
| Select → load richer details | `App.jsx` Effect 2, deps `[selectedId, detailsAttempt]`, `getItem(id)` |
| Complete (update via API) | `handleComplete(quest)` |
| ≥ 7 detail fields | `QuestDetails.jsx` (Hero, Difficulty, Reward, Status, Location, Deadline, Posted, Completed, Description) |
| Loading / error / empty / success | `QuestList`, `QuestDetails`, banners |
| Reload button | top bar |
| Cleanup + race condition | `let ignore = false` / `return () => { ignore = true }` in both effects |
| Stale closure | `handleComplete` captures `id` & `title` at click; functional `setState` compares ids; `pending` lock disables conflicting actions |
