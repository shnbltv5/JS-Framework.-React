import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { getQuest, updateQuestStatus, NotFoundError } from "../services/service.js";
import { useFetch } from "../hooks/useFetch.js";
import { STATUS_LABELS, TRANSITIONS } from "../constants.js";
import StatusBadge from "./StatusBadge.jsx";
import DifficultyStars from "./DifficultyStars.jsx";
import QuestAvatar from "./QuestAvatar.jsx";
import StatusMessage from "./StatusMessage.jsx";

export default function QuestDetail({ id }) {
  const navigate = useNavigate();
  const location = useLocation();

  const fetchQuest = useCallback(({ signal }) => getQuest(id, { signal }), [id]);
  const { status, data, error, retry } = useFetch(fetchQuest);

  // After a status change we show the updated quest without loading it again
  const [updatedQuest, setUpdatedQuest] = useState(null);
  const quest = updatedQuest ?? data;

  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState(null);

  async function handleStatusChange(nextStatus) {
    setUpdating(true);
    setActionError(null);
    try {
      const updated = await updateQuestStatus(quest.id, nextStatus);
      setUpdatedQuest(updated);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  // location.key is "default" when the page was opened directly by URL:
  // there is no previous page in the app, so Back goes to the list.
  function handleBack() {
    if (location.key !== "default") navigate(-1);
    else navigate("/quests");
  }

  const notFound = error instanceof NotFoundError;

  return (
    <section>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={handleBack}>
          ← Back
        </button>
        <Link to="/quests" className="btn btn-ghost">
          All quests
        </Link>
      </div>

      {status === "loading" && <StatusMessage variant="loading" title="Loading quest..." />}

      {status === "error" && notFound && (
        <StatusMessage
          variant="error"
          title="Quest not found"
          text={`${error.message} It may have been removed from the board.`}
          actionLabel="Browse all quests"
          onAction={() => navigate("/quests")}
        />
      )}

      {status === "error" && !notFound && (
        <StatusMessage
          variant="error"
          title="Could not load this quest"
          text={error.message}
          actionLabel="Try again"
          onAction={retry}
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
              <dt>Quest ID</dt>
              <dd>#{quest.id}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{STATUS_LABELS[quest.status]}</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>{quest.difficulty} of 5</dd>
            </div>
            <div>
              <dt>Region</dt>
              <dd>
                <Link to={`/quests?region=${encodeURIComponent(quest.region)}`}>{quest.region}</Link>
              </dd>
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
              <dt>Reward per day</dt>
              <dd>{Math.round(quest.reward / quest.durationDays)}g</dd>
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
    </section>
  );
}
