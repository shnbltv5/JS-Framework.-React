import { useState } from "react";
import { useDispatch, useStore } from "react-redux";
import { collectAwayCoins } from "../features/cafe/cafeSlice.js";
import { AWAY_LIMIT_MS, AWAY_RATE, totalIncome } from "../features/cafe/gameData.js";
import { formatCoins } from "../features/cafe/format.js";
import CoinIcon from "./CoinIcon.jsx";

function describe(ms) {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

// When the game opens: how much did the café earn while the tab was closed?
export default function AwayModal() {
  const dispatch = useDispatch();
  const store = useStore();

  // Calculated once, on the first render, from the saved game
  const [away] = useState(() => {
    const cafe = store.getState().cafe;
    const now = Date.now();
    const elapsed = Math.min(now - cafe.lastSeen, AWAY_LIMIT_MS);
    if (elapsed < 60_000) return null;
    const coins = Math.floor((elapsed / 1000) * totalIncome(cafe, now) * AWAY_RATE);
    return coins > 0 ? { coins, time: describe(elapsed) } : null;
  });
  const [open, setOpen] = useState(away !== null);

  if (!open) return null;

  function handleCollect() {
    dispatch(collectAwayCoins(away.coins));
    setOpen(false);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="away-title">
        <span className="modal-emoji" aria-hidden="true">🌙</span>
        <h2 id="away-title">Welcome back!</h2>
        <p>
          You were away for {away.time}. The night staff kept the café open and earned
        </p>
        <p className="modal-amount">
          <CoinIcon size={30} /> {formatCoins(away.coins)}
        </p>
        <button type="button" className="btn btn-pink" onClick={handleCollect} autoFocus>
          Collect coins
        </button>
      </div>
    </div>
  );
}
