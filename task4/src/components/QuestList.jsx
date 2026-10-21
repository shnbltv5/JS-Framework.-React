// Shows the quest list and handles its four states:
// loading, error, empty and success.
export default function QuestList({ quests, status, error, selectedId, onSelect, onRetry }) {
  if (status === "loading") {
    return (
      <p className="state-message" role="status">
        <span className="spinner" aria-hidden="true" />
        Loading quests…
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="state-message error" role="alert">
        <p>Could not load quests: {error}</p>
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (quests.length === 0) {
    return (
      <p className="state-message">
        No quests yet. Create the first one with “+ New quest”.
      </p>
    );
  }

  return (
    <ul className="quest-list">
      {quests.map((quest) => (
        <li key={quest.id}>
          <button
            type="button"
            className={quest.id === selectedId ? "quest-item selected" : "quest-item"}
            onClick={() => onSelect(quest.id)}
            aria-pressed={quest.id === selectedId}
          >
            <span className="quest-item-title">{quest.title}</span>
            <span className="quest-item-hero">{quest.hero}</span>
            <span className="quest-item-badges">
              <span className={`badge badge-${quest.difficulty.toLowerCase()}`}>
                {quest.difficulty}
              </span>
              <span className={`badge status-${quest.status.toLowerCase()}`}>
                {quest.status}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
