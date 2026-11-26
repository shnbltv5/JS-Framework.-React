import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetGame } from "../features/cafe/cafeSlice.js";
import { selectAchievementList, selectCafe } from "../features/cafe/cafeSelectors.js";
import { formatCoins } from "../features/cafe/format.js";

export default function Trophies() {
  const dispatch = useDispatch();
  const list = useSelector(selectAchievementList);
  const { stats, cats } = useSelector(selectCafe);
  const [confirming, setConfirming] = useState(false);
  const unlocked = list.filter((a) => a.unlocked).length;
  const days = Math.max(1, Math.ceil((Date.now() - stats.startedAt) / 86_400_000));

  return (
    <section className="page">
      <h1 className="page-title">Trophies</h1>
      <div className="progress-line">
        <span>
          {unlocked} of {list.length} unlocked
        </span>
        <div className="need-track">
          <div className="need-fill" style={{ width: `${(unlocked / list.length) * 100}%` }} />
        </div>
      </div>

      <ul className="trophies">
        {list.map((a) => (
          <li key={a.id} className={`trophy ${a.unlocked ? "is-unlocked" : ""}`}>
            <span className="trophy-emoji" aria-hidden="true">{a.unlocked ? a.emoji : "🔒"}</span>
            <h3>{a.name}</h3>
            <p>{a.hint}</p>
          </li>
        ))}
      </ul>

      <h2 className="section-title">Café stats</h2>
      <dl className="facts stats-grid">
        <div><dt>Coins earned</dt><dd>{formatCoins(stats.earned)}</dd></div>
        <div><dt>Pets given</dt><dd>{stats.pets}</dd></div>
        <div><dt>Fish served</dt><dd>{stats.feeds}</dd></div>
        <div><dt>Cats living here</dt><dd>{cats.length}</dd></div>
        <div><dt>Café events</dt><dd>{stats.events}</dd></div>
        <div><dt>Days open</dt><dd>{days}</dd></div>
      </dl>

      <div className="danger-zone">
        {confirming ? (
          <>
            <p>This deletes your cats, coins and trophies. Start a new café?</p>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                dispatch(resetGame());
                setConfirming(false);
              }}
            >
              Yes, start over
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setConfirming(false)}>
              Keep playing
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => setConfirming(true)}>
            Start a new café
          </button>
        )}
      </div>
    </section>
  );
}
