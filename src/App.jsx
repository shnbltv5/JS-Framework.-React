import { useState, useCallback } from "react";
import Header from "./components/Header.jsx";
import Controls from "./components/Controls.jsx";
import QuestList from "./components/QuestList.jsx";
import { initialQuests, makeId, sortQuests } from "./data.js";

export default function App() {
  console.log("[render] App");

  const [quests, setQuests] = useState(initialQuests);
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [reversed, setReversed] = useState(false);
  const [keyMode, setKeyMode] = useState("id"); // "id" (safe) | "index" (bug demo)
  const [season, setSeason] = useState(0);

  // useCallback + functional updates (prev => ...) mean these functions
  // never need `quests` in a dependency array and their reference never
  // changes across renders. That matters for QuestCard's memo() to be able
  // to skip re-rendering cards whose props truly didn't change.
  const addQuest = useCallback((data) => {
    setQuests((prev) => [...prev, { id: makeId(), status: "Active", ...data }]);
  }, []);

  const removeQuest = useCallback((id) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const changeStatus = useCallback((id, status) => {
    // Only the matching quest gets a new object reference; every other
    // quest object in the array is untouched, so QuestCard's memo() bails
    // out for all the cards that weren't edited.
    setQuests((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
  }, []);

  const startNewSeason = useCallback(() => setSeason((s) => s + 1), []);

  // Derived data — never stored in state, recomputed each render from
  // `quests`, `filterStatus`, `sortBy`, `reversed`.
  let visibleQuests = quests.filter(
    (q) => filterStatus === "All" || q.status === filterStatus
  );
  visibleQuests = sortQuests(visibleQuests, sortBy);
  if (reversed) visibleQuests = [...visibleQuests].reverse();

  return (
    <div className="page">
      <Header visibleCount={visibleQuests.length} totalCount={quests.length} />

      <Controls
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        reversed={reversed}
        onToggleReversed={() => setReversed((r) => !r)}
        keyMode={keyMode}
        onKeyModeChange={setKeyMode}
        onNewSeason={startNewSeason}
        onAddQuest={addQuest}
      />

      <QuestList
        quests={visibleQuests}
        season={season}
        keyMode={keyMode}
        onStatusChange={changeStatus}
        onRemove={removeQuest}
      />

      <footer className="board-footer">
        <p>Quest Board · React SPA · Fall 2026</p>
      </footer>
    </div>
  );
}
