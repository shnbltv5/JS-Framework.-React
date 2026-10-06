import { useState } from "react";
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

  // Plain functions using functional updates (prev => ...), so they always
  // work off the latest state without needing `quests` read directly here.
  function addQuest(data) {
    setQuests((prev) => [...prev, { id: makeId(), status: "Active", ...data }]);
  }

  function removeQuest(id) {
    setQuests((prev) => prev.filter((q) => q.id !== id));
  }

  function changeStatus(id, status) {
    // Only the matching quest gets a new object reference; every other
    // quest object in the array is left untouched.
    setQuests((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
  }

  function startNewSeason() {
    setSeason((s) => s + 1);
  }

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
