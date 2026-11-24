import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { updateQuestStatus } from "../features/quests/questsThunks.js";
import { resetStatusUpdate } from "../features/quests/questsSlice.js";
import { selectStatusUpdate } from "../features/quests/questsSelectors.js";
import { useQuest } from "../hooks/useQuest.js";
import { STATUS_LABELS, TRANSITIONS } from "../constants.js";
import StatusBadge from "./StatusBadge.jsx";
import DifficultyStars from "./DifficultyStars.jsx";
import QuestAvatar from "./QuestAvatar.jsx";
import StatusMessage from "./StatusMessage.jsx";

export default function QuestDetail({ id }) {
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch();

  // The quest comes from the store. After a status change the store has the new quest,
  // so this page, the list and the dashboard all show the new status.
  const { status, quest, error, retry } = useQuest(id);

  // pending / fulfilled / rejected of updateQuestStatus are saved in the store
  const statusUpdate = useSelector(selectStatusUpdate);
  const isThisQuest = quest !== null && statusUpdate.id === quest.id;
  const updating = isThisQuest && statusUpdate.status === "loading";
  const actionError = isThisQuest && statusUpdate.status === "failed" ? statusUpdate.error.message : null;

  // An old error from another quest must not be shown here
  useEffect(() => {
    dispatch(resetStatusUpdate());
  }, [dispatch, id]);

  function handleStatusChange(nextStatus) {
    dispatch(updateQuestStatus({ id: quest.id, status: nextStatus }));
  }

  // location.key is "default" when the page was opened directly by URL:
  // there is no previous page in the app, so Back goes to the list.
  function handleBack() {
    if (location.key !== "default") navigate(-1);
    else navigate("/quests");
  }

  const notFound = error?.kind === "not-found";

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

      {status === "failed" && notFound && (
        <StatusMessage
          variant="error"
          title="Quest not found"
          text={`${error.message} It may have been removed from the board.`}
          actionLabel="Browse all quests"
          onAction={() => navigate("/quests")}
        />
      )}

      {status === "failed" && !notFound && (
        <StatusMessage
          variant="error"
          title="Could not load this quest"
          text={error.message}
          actionLabel="Try again"
          onAction={retry}
        />
      )}

      {status === "succeeded" && (
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
