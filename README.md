# Quest Board — Task 3: Rendering and State

A single-page React dashboard themed as a fantasy quest board. Built with
functional components and `useState` only (no Redux, no Context, no
`useEffect`), exactly per the assignment's constraints.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/...`).

## What each requirement maps to

| Assignment requirement | Where it lives |
|---|---|
| Add / remove items | `Controls`'s form (`onAddQuest`) / each card's "Remove quest" button (`onRemove`) |
| Edit an item's status | The status `<select>` inside `QuestCard` |
| Change a local state of an item | "Strain −15 / Mend +15" condition meter inside `QuestCard` (`condition` state, moves both up and down like an HP bar) |
| Filter items | Status dropdown in `Controls` |
| Reorder / reverse the list | "Sort by" dropdown + "Reverse list" button in `Controls` |
| Reset an item's local state | "Reset" button inside `QuestCard` — plain `setCondition(100)` |
| Preserve local state when filtering/reordering | Cards are keyed by `quest.id` (stable identity) — see `QuestList.jsx` |
| Intentional full state reset via keys | "Start New Season" button bumps a `season` number folded into every key |
| `console.log` on re-renders | Every component logs `[render] <Name>` at the top of its function body |
| Multiple components, parent + child state | `App` owns the quest list; `Controls` owns its own add-quest form fields; `QuestCard` owns its own `condition`/`notesOpen` — three independent state owners |
| Props + conditional rendering | Status badges, the 🏆 ribbon on completed quests, the empty-state message, the collapsed/expanded quest log |
| Lists via `.map()` with stable keys | `QuestList.jsx` |

Each card also shows an emoji avatar (`quest.avatar`) for quick visual
identity, and the condition meter moves both up and down via two separate
buttons — a deliberately generic, symmetric increase/decrease pattern (any
dashboard with a resource bar looks similar), not copied from any specific
project.

## The "key by index (bug demo)" checkbox

This is the most important thing to understand before the defense. In
`Controls`, there's a checkbox: **"Key by index (bug demo)"**. It switches
`QuestList`'s key strategy between two modes:

- **`id` mode (default, correct):** `key={`s${season}-${quest.id}`}`. The key
  only depends on the quest's own id and the current "season" — never on
  where the quest currently sits in the visible/sorted array. Filtering,
  sorting, and reversing the list re-order the array, but each quest keeps
  the *same* key, so React matches it back to the *same* `QuestCard`
  instance and its local state (`condition`, `notesOpen`) survives untouched.

- **`index` mode (intentionally buggy):** `key={`s${season}-idx${index}`}`.
  The key depends on the item's position in the array being rendered right
  now. Strain or mend a card's condition, then filter or sort the list so
  that a *different* quest now lands on that same index — React sees the
  same key reappear and assumes it's the same component, so it reuses that
  component's state for what is now a completely different quest. The
  condition bar you changed "teleports" onto the wrong quest, and cards can
  visually flicker/reset. This is the textbook reason lists must never be
  keyed by index when the list can be filtered or reordered.

To demonstrate this live during the defense:
1. Leave the checkbox unchecked, strain/mend "Slay the Frost Wyrm"'s
   condition a bit, then change the status filter back and forth — the
   condition value stays correct.
2. Check the checkbox, change a card's condition, then change the sort
   order — watch the condition value "jump" to a different quest's card, or
   reset unexpectedly.
3. Uncheck it again to go back to the correct behavior.

## "Start New Season" — intentional reset via keys

Every key also includes the current `season` number. Clicking **Start New
Season** bumps `season`, which changes *every* card's key at once. React
therefore unmounts every existing `QuestCard` and mounts brand new ones,
wiping every card's `condition`/`notesOpen` back to their initial values in
one click. This is the standard React pattern for "reset a whole subtree on
purpose" — same trick often used to reset a form by changing its `key` when
you want a clean slate (e.g. switching between editing two different
records).

## Re-renders and `console.log`

Open the browser console. Every component logs `[render] <name>` (with the
quest title for `QuestCard`) each time React calls it. Interesting things to
try:

- On first load, you'll see **each log twice** in development — that's
  `<StrictMode>` in `main.jsx` intentionally double-invoking components to
  surface side-effect bugs. It does **not** happen in the production build
  (`npm run build` / the deployed site), so what the grader sees live on
  GitHub Pages will log once per real render.
- Edit one quest's status: `App`, `Header`, `Controls`, and `QuestList` all
  log again — none of them are memoized, so a parent re-render always calls
  them. But out of the 5 `QuestCard`s, **only the edited one** logs.
  `QuestCard` is the one component wrapped in `memo()`, and `App`'s
  `changeStatus` creates a new object only for the edited quest — every
  other quest object in the array keeps the exact same reference, so
  memo's shallow prop comparison says "nothing changed here" for the
  untouched cards and React skips calling their function bodies entirely.
  This is the clearest way to show the difference memo actually makes: turn
  it off (remove `memo(...)` in `QuestCard.jsx`) and all 5 cards will log
  on every edit instead of just 1.
- Type in the "Post Quest" form: only `Controls` logs, because the form's
  text lives in `Controls`'s own local state — it never touches `App`'s
  state (and doesn't trigger a re-render of `App` or anything below it)
  until you actually submit the form.

## Deploying to GitHub Pages

This project is meant to live at `task3/` inside the same repository as
your other coursework (`JS-Framework.-React`), deployed into a `task3`
**subfolder** of the `gh-pages` branch — so it does not overwrite the
already-deployed Task 2 site, which lives at the branch root.

That's why:
- `package.json`'s deploy script is `gh-pages -d dist --dest task3`
- `vite.config.js`'s `base` is `/JS-Framework.-React/task3/`

If your repository has a different name, update **both** of those to match.

### Steps (mirrors what worked for task2.1)

```bash
# from inside this task3 folder
npm install
npm run build      # sanity check — should finish with no errors

git init
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git add -A
git commit -m "Add task3 - Quest Board (rendering and state)"
git pull origin main --allow-unrelated-histories --no-rebase
# if an editor opens for a merge commit message, just save and close it
git push origin main

npm run deploy      # publishes dist/ into the task3/ folder of gh-pages
```

**Before running `git init`**: if you downloaded this project through a
chat client, double check the file named `.gitignore` still has its
leading dot. Some upload/download flows strip it, turning it into a plain
`gitignore` file that git will silently ignore. If you see a file just
named `gitignore` in the folder, rename it first:
```bash
mv gitignore .gitignore
```

After deploying, the live site will be at:
```
https://<your-username>.github.io/<your-repo>/task3/
```

Give GitHub Pages a minute after the first deploy of a new subfolder.
