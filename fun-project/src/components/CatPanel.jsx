import { Link } from "react-router";
import Cat from "./Cat.jsx";
import NeedBar from "./NeedBar.jsx";
import CoinIcon from "./CoinIcon.jsx";
import { FEED_COST, PERSONALITIES, catIncome, moodOf } from "../features/cafe/gameData.js";
import { MOOD_TEXT, faceOf, formatRate } from "../features/cafe/format.js";

// The card next to the café: the chosen cat, its needs and actions
export default function CatPanel({ cat, onPet, onFeed }) {
  const personality = PERSONALITIES[cat.personality];
  const mood = moodOf(cat);
  const petsInLevel = cat.pets % 15;

  return (
    <aside className="cat-panel" aria-label={`${cat.name}'s card`}>
      <div className="panel-portrait">
        <Cat cat={cat} mood={faceOf(cat, Date.now())} />
      </div>
      <h2 className="panel-name">{cat.name}</h2>
      <p className="badge">
        <span aria-hidden="true">{personality.emoji}</span> {personality.label} · level {cat.level}
      </p>
      <p className="speech">“{personality.line}”</p>

      <NeedBar label="Fullness" icon="🐟" value={cat.fullness} tone="mint" />
      <NeedBar label="Happiness" icon="💗" value={cat.happiness} tone="pink" />

      <p className="panel-meta">
        {MOOD_TEXT[mood]} · earns <CoinIcon size={14} /> {formatRate(catIncome(cat))}/s
      </p>
      {cat.level < 10 && (
        <p className="panel-meta">
          {15 - petsInLevel} pets to level {cat.level + 1}
        </p>
      )}

      <div className="panel-actions">
        <button type="button" className="btn btn-pink" onClick={() => onPet(cat)}>
          Pet {cat.name}
        </button>
        <button type="button" className="btn btn-mint" onClick={() => onFeed(cat)}>
          Feed · <CoinIcon size={16} /> {FEED_COST}
        </button>
      </div>
      <Link to={`/cats/${cat.id}`} className="text-link">
        Open {cat.name}'s profile
      </Link>
    </aside>
  );
}
