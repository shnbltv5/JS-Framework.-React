# Defense notes — Task 3: Rendering and State

The rubric asks you to explain, **using your own app**: re-rendering,
reconciliation, component identity, keys, and state preservation/reset.
Below is exactly what to say for each, pointing at a concrete place in
Quest Board.

## 1. Re-rendering

**Definition to give:** rendering is React calling your component function
to figure out what the UI should look like. Re-rendering happens whenever
state changes in that component or in one of its ancestors.

**Show it live:** open the console, click "Mend +15" on a card. You'll see
```
[render] App
[render] Header
[render] Controls
[render] QuestList
[render] QuestCard: <that one quest's title>
```
Say: "Clicking Mend changes state inside that one `QuestCard`. React
re-renders that component — but note it does NOT re-render `App` or its
siblings, because the state that changed lives *inside* `QuestCard`, not in
`App`. Re-rendering starts at whichever component actually owns the state
that changed."

Then click a quest's status dropdown instead, and contrast: now `App`
**does** re-render (because `quests` is `App`'s state), and that re-render
cascades down through `Header`, `Controls`, `QuestList` — because a parent
re-rendering always calls its children again by default.

## 2. Reconciliation

**Definition to give:** reconciliation is the process React uses to compare
the new tree of elements it just rendered against the previous tree, and
figure out the minimum real DOM changes needed — instead of tearing down
and rebuilding everything from scratch.

**Show it live:** edit one quest's status. Say: "React just called `App`
again, which called `QuestList` again, which called `.map()` again and
produced 5 new `QuestCard` elements. React doesn't throw away and recreate
all 5 DOM nodes — it walks the new tree next to the old tree, matches each
element to its previous counterpart, and only patches the one `<select>`
whose value actually changed. That matching step — deciding which new
element corresponds to which old element — is reconciliation."

## 3. Component identity

**Definition to give:** two elements are considered "the same component
instance" across renders if they have the same **type** and the same
**key** at the same position in the tree. Same identity = React reuses the
existing instance (and its local state). Different identity = React
unmounts the old instance and mounts a brand new one.

**Show it live:** point at `QuestList.jsx`'s key comment. Say: "Every
`<QuestCard>` here has type `QuestCard` — that's fixed. What can change is
the `key`. As long as a quest's key stays the same across renders, React
treats it as the *same* component identity, no matter where it moved to in
the list. The moment its key changes, React treats it as a completely
different identity — even though it's rendering the exact same quest
data."

## 4. Keys

**Definition to give:** `key` is the hint you give React to tell it which
array item is which, across re-renders — because without a key, React would
only have array *position* to go on, which breaks the moment the array is
filtered, sorted, or reordered.

**Show it live — the checkbox in Controls, "Key by index (bug demo)":**
1. Leave it unchecked (id mode). Strain or mend "Slay the Frost Wyrm"'s
   condition a bit. Change the sort order a few times. The condition value
   stays attached to that quest. Say: "The key is `s${season}-${quest.id}`
   — it only depends on the quest's own permanent id, never on its
   position. Sorting changes position, not identity, so React keeps
   matching it to the same `QuestCard` instance."
2. Check the box (index mode). Change a card's condition. Change the sort
   order. Watch the condition value jump to a different quest, or reset.
   Say: "Now the key is `s${season}-idx${index}` — literally just the
   array position. When
   sorting changes which quest sits at index 1, React sees the *same key*
   reappear at that slot and assumes it's the *same component* — so it
   hands quest A's old local state to quest B's card. This is exactly why
   array index is the wrong key whenever a list can be filtered or
   reordered."

## 5. State preservation / reset

**Preservation (the default, correct behavior):** as shown above, keying
by `quest.id` means each card's `condition` and `notesOpen` survive
filtering, sorting, and reversing — because the identity React tracks (the
key) never changes even though the item's position does.

**Reset — two different mechanisms, on purpose:**
- **Manual reset** (ordinary state update): the "Reset" button just calls
  `setCondition(100)` and `setNotesOpen(false)` from inside `QuestCard`
  itself. The component instance stays the same; only its state value
  changes. This is the normal way to reset one specific value.
- **Reset via key** (forced remount): the "Start New Season" button
  increments `season` in `App`, which is folded into *every* card's key at
  once. Every `QuestCard`'s key changes, so React concludes every one of
  them is now "a different component" — it unmounts all 5 old instances
  (discarding their state) and mounts 5 brand new ones from scratch. Say:
  "This is the standard React technique for intentionally wiping an entire
  subtree's state in one move — changing the key is a deliberate signal to
  React that this should be treated as a fresh instance, not an update to
  the old one."

## Anticipate this follow-up question

**"Why does `memo()` matter here, and how does it relate to reconciliation
and identity?"**

Say: "`QuestCard` is wrapped in `memo()`. When I edit one quest's status,
`App`'s `changeStatus` uses `.map()` in a way that only creates a *new*
object for the edited quest — every other quest object in the array keeps
the exact same reference it had before. `memo()` does a shallow comparison
of props between renders; for the 4 untouched cards, `quest` is the same
reference and the callbacks are the same reference (they're wrapped in
`useCallback`), so `memo()` sees 'nothing changed' and skips calling that
component function entirely — you can see this because only the edited
card's `console.log` fires, not all 5. Reconciliation still *walks* the
tree to check, but `memo()` lets React skip the expensive part — actually
re-running the component and diffing its output — when it can already
tell from props alone that the result would be identical."
