function formatText(value) {
  return value ? value : "—";
}

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

// Shows the details of the selected quest and its four states:
// idle (nothing selected), loading, error and success.
export default function QuestDetails({
  status,
  error,
  quest,
  pending,
  onComplete,
  onEdit,
  onRemove,
  onRetry,
}) {
  if (status === "idle") {
    return (
      <p className="state-message">Select a quest from the list to see its details.</p>
    );
  }

  if (status === "loading") {
    return (
      <p className="state-message" role="status">
        <span className="spinner" aria-hidden="true" />
        Loading quest details…
      </p>
    );
  }

  if (status === "error") {
    return (
      <div className="state-message error" role="alert">
        <p>Could not load the quest: {error}</p>
        <button type="button" className="btn" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  // status === "success"
  const busy = pending !== null;
  const completing =
    busy && pending.type === "complete" && pending.id === quest.id;
  const removing = busy && pending.type === "remove" && pending.id === quest.id;
  const isCompleted = quest.status === "Completed";

  return (
    <article className="details">
      <h2>{quest.title}</h2>

      <dl className="details-grid">
        <dt>Hero</dt>
        <dd>{formatText(quest.hero)}</dd>

        <dt>Difficulty</dt>
        <dd>
          <span className={`badge badge-${quest.difficulty.toLowerCase()}`}>
            {quest.difficulty}
          </span>
        </dd>

        <dt>Reward</dt>
        <dd>{quest.reward} gold</dd>

        <dt>Status</dt>
        <dd>
          <span className={`badge status-${quest.status.toLowerCase()}`}>
            {quest.status}
          </span>
        </dd>

        <dt>Location</dt>
        <dd>{formatText(quest.location)}</dd>

        <dt>Deadline</dt>
        <dd>{formatText(quest.deadline)}</dd>

        <dt>Posted</dt>
        <dd>{formatDateTime(quest.createdAt)}</dd>

        <dt>Completed</dt>
        <dd>{formatDateTime(quest.completedAt)}</dd>
      </dl>

      <h3>Description</h3>
      <p className="details-description">{formatText(quest.description)}</p>

      <div className="details-actions">
        {!isCompleted && (
          <button
            type="button"
            className="btn primary"
            onClick={() => onComplete(quest)}
            disabled={busy}
          >
            {completing ? "Completing…" : "Complete quest"}
          </button>
        )}
        <button type="button" className="btn" onClick={() => onEdit(quest)} disabled={busy}>
          Edit
        </button>
        <button
          type="button"
          className="btn danger"
          onClick={() => onRemove(quest)}
          disabled={busy}
        >
          {removing ? "Removing…" : "Remove"}
        </button>
      </div>

      {busy && <p className="hint">Another action is in progress, please wait…</p>}
    </article>
  );
}
