import { useState } from "react";
import Header from "./components/Header.jsx";
import QuestBoard from "./components/QuestBoard.jsx";
import QuestDetail from "./components/QuestDetail.jsx";

export default function App() {
  // Only app-wide state lives here: which quest is open, and a data version
  // that tells the board to reload after quests change.
  const [selectedId, setSelectedId] = useState(null);
  const [version, setVersion] = useState(0);

  function handleDataChanged() {
    setVersion((v) => v + 1);
  }

  return (
    <div className="app">
      <Header />

      {/* The board stays mounted while a quest is open, so its filters, sorting
          and page are preserved. It is only hidden. */}
      <div hidden={selectedId !== null}>
        <QuestBoard
          version={version}
          onSelect={setSelectedId}
          onChanged={handleDataChanged}
        />
      </div>

      {selectedId !== null && (
        // key resets QuestDetail's state when a different quest is opened
        <QuestDetail
          key={selectedId}
          id={selectedId}
          onBack={() => setSelectedId(null)}
          onChanged={handleDataChanged}
        />
      )}

      <footer className="board-footer">
        <p>Quest Board · React SPA · Fall 2026</p>
      </footer>
    </div>
  );
}
