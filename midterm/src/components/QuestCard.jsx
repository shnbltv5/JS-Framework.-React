import StatusBadge from "./StatusBadge.jsx";
import DifficultyStars from "./DifficultyStars.jsx";
import QuestAvatar from "./QuestAvatar.jsx";
import { difficultyTier } from "../constants.js";

export default function QuestCard({ quest, onSelect }) {
  return (
    <article className={`card difficulty-${difficultyTier(quest.difficulty)} status-${quest.status}`}>
      {quest.status === "completed" && <div className="ribbon" aria-hidden="true">🏆</div>}

      <div className="card-head">
        <QuestAvatar id={quest.id} />
        <h3>{quest.title}</h3>
      </div>

      <div className="card-top">
        <StatusBadge status={quest.status} />
        <DifficultyStars level={quest.difficulty} />
      </div>

      <p className="quest-meta">Region: {quest.region}</p>
      <p className="quest-meta">Reward: {quest.reward}g</p>

      <div className="card-bottom">
        <button type="button" className="btn btn-small" onClick={() => onSelect(quest.id)}>
          View details
        </button>
      </div>
    </article>
  );
}
