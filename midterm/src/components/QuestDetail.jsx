import { useEffect, useState } from "react";
import { getQuest, updateQuestStatus } from "../api/questsApi.js";
import { TRANSITIONS } from "../constants.js";
import StatusBadge from "./StatusBadge.jsx";
import DifficultyStars from "./DifficultyStars.jsx";
import QuestAvatar from "./QuestAvatar.jsx";
import StatusMessage from "./StatusMessage.jsx";

export default function QuestDetail({ id, onBack, onChanged }) {
  const [status, setStatus] = useState("loading");
  const [quest, setQuest] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    getQuest(id, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setQuest(data);
        setStatus("success");
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [id, retryCount]);

  async function handleStatusChange(nextStatus) {
    setUpdating(true);
    setActionError(null);
    try {
      const updated = await updateQuestStatus(quest.id, nextStatus);
      setQuest(updated);
      onChanged(); // tell the board its data is outdated
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main>
      <button type="button" className="btn btn-ghost" onClick={onBack}>
        Back to the board
      </button>

      {status === "loading" && <StatusMessage variant="loading" title="Loading quest..." />}

      {status === "error" && (
        <StatusMessage
          variant="error"
          title="Could not load this quest"
          text={error}
          actionLabel="Try again"
          onAction={() => setRetryCount((c) => c + 1)}
        />
      )}

      {status === "success" && (
        <article className={`panel detail status-${quest.status}`}>
          {quest.status === "completed" && <div className="ribbon" aria-hidden="true">🏆</div>}
          <div className="card-head">
            <QuestAvatar id={quest.id} />
            <h2>{quest.title}</h2>
          </div>
          <div className="card-top">
            <StatusBadge status={quest.status} />
            <DifficultyStars level={quest.difficulty} />
          </div>
          <p>{quest.description}</p>

          <dl className="facts">
            <div>
              <dt>Region</dt>
              <dd>{quest.region}</dd>
            </div>
            <div>
              <dt>Reward</dt>
              <dd>{quest.reward}g</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>
                {quest.durationDays} {quest.durationDays === 1 ? "day" : "days"}
              </dd>
            </div>
            <div>
              <dt>Posted by</dt>
              <dd>{quest.giver}</dd>
            </div>
            <div>
              <dt>Posted on</dt>
              <dd>{new Date(quest.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>

          {actionError && (
            <p className="field-error" role="alert">
              {actionError}
            </p>
          )}

          <div className="form-actions">
            {TRANSITIONS[quest.status].map((action) => (
              <button
                key={action.to}
                type="button"
                className="btn"
                disabled={updating}
                onClick={() => handleStatusChange(action.to)}
              >
                {updating ? "Saving..." : action.label}
              </button>
            ))}
          </div>
        </article>
      )}
    </main>
  );
}
