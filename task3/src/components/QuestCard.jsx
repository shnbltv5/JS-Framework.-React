import { useState } from "react";

const MAX_CONDITION = 100;
const STEP = 15;
const EXHAUSTED_THRESHOLD = 25;

export default function QuestCard({ quest, onStatusChange, onRemove }) {
  console.log("[render] QuestCard:", quest.title);

  // Local state, private to THIS card instance. Two different quests never
  // share these values — each mounted QuestCard gets its own. `condition`
  // can move UP or DOWN (unlike a simple counter), same shape as an HP bar.
  const [condition, setCondition] = useState(MAX_CONDITION);
  const [notesOpen, setNotesOpen] = useState(false);

  function strain() {
    setCondition((c) => Math.max(c - STEP, 0));
  }

  function mend() {
    setCondition((c) => Math.min(c + STEP, MAX_CONDITION));
  }

  function resetProgress() {
    setCondition(MAX_CONDITION);
    setNotesOpen(false);
  }

  const isCompleted = quest.status === "Completed";
  const isAbandoned = quest.status === "Abandoned";
  const isExhausted = condition <= EXHAUSTED_THRESHOLD;

  return (
    <article className={`quest-card difficulty-${quest.difficulty.toLowerCase()} status-${quest.status.toLowerCase()}`}>
      {isCompleted && <div className="ribbon">🏆</div>}

      <div className="quest-card-top">
        <span className="quest-avatar" aria-hidden="true">
          {quest.avatar || "❔"}
        </span>
        <div className="quest-card-heading">
          <h3>{quest.title}</h3>
          <span className={`badge badge-${quest.difficulty.toLowerCase()}`}>{quest.difficulty}</span>
        </div>
      </div>

      <p className="quest-hero">Hero: {quest.hero}</p>
      <p className="quest-reward">Reward: {quest.reward}g</p>

      <div className="quest-status-row">
        <label>
          Status
          <select value={quest.status} onChange={(e) => onStatusChange(quest.id, e.target.value)}>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Abandoned">Abandoned</option>
          </select>
        </label>
      </div>

      <div className={`quest-progress ${isAbandoned ? "faded" : ""}`}>
        <div className="progress-label">
          Condition: {condition}/{MAX_CONDITION}
          {isExhausted && <span className="exhausted-tag"> ⚠ Exhausted</span>}
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill ${isExhausted ? "low" : ""}`}
            style={{ width: `${(condition / MAX_CONDITION) * 100}%` }}
          />
        </div>
        <div className="progress-buttons">
          <button type="button" className="btn small danger-fill" onClick={strain} disabled={condition <= 0}>
            Strain −{STEP}
          </button>
          <button type="button" className="btn small" onClick={mend} disabled={condition >= MAX_CONDITION}>
            Mend +{STEP}
          </button>
          <button type="button" className="btn small ghost" onClick={resetProgress}>
            Reset
          </button>
        </div>
      </div>

      <button type="button" className="btn link" onClick={() => setNotesOpen((v) => !v)}>
        {notesOpen ? "Hide quest log ▲" : "Show quest log ▼"}
      </button>
      {notesOpen && <p className="quest-flavor">{quest.flavor}</p>}

      <button type="button" className="btn danger" onClick={() => onRemove(quest.id)}>
        Remove quest
      </button>
    </article>
  );
}

