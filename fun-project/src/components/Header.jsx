import { NavLink, Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toggleMute } from "../features/cafe/cafeSlice.js";
import { selectAverageHappiness, selectBoost, selectCoins, selectIncome, selectMuted } from "../features/cafe/cafeSelectors.js";
import { BOOSTS } from "../features/cafe/gameData.js";
import { formatCoins, formatRate } from "../features/cafe/format.js";
import CoinIcon from "./CoinIcon.jsx";

const LINKS = [
  { to: "/", label: "Café", icon: "☕", end: true },
  { to: "/shop", label: "Shop", icon: "🛍️" },
  { to: "/cats", label: "Cats", icon: "🐾" },
  { to: "/trophies", label: "Trophies", icon: "🏆" },
];

export default function Header() {
  const dispatch = useDispatch();
  const coins = useSelector(selectCoins);
  const income = useSelector(selectIncome);
  const happiness = useSelector(selectAverageHappiness);
  const boost = useSelector(selectBoost);
  const muted = useSelector(selectMuted);
  const boostLeft = boost ? Math.max(0, Math.ceil((boost.until - Date.now()) / 1000)) : 0;

  return (
    <header className="header">
      <Link to="/" className="brand">
        <img src="/favicon.svg" alt="" width="40" height="40" />
        <span>Whisker Café</span>
      </Link>

      <nav className="nav" aria-label="Main">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? "nav-link is-active" : "nav-link")}>
            <span className="nav-icon" aria-hidden="true">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="hud">
        <div className="hud-coins" title="Coins">
          <CoinIcon size={26} />
          <strong>{formatCoins(coins)}</strong>
          <span className="hud-rate">+{formatRate(income)}/s</span>
        </div>
        <div className="hud-chip" title="Average happiness">
          <span aria-hidden="true">💗</span> {happiness}%
        </div>
        {boostLeft > 0 && (
          <div className="hud-chip hud-boost" title={BOOSTS[boost.kind].label}>
            ×{BOOSTS[boost.kind].multiplier} · {boostLeft}s
          </div>
        )}
        <button
          type="button"
          className="icon-btn"
          onClick={() => dispatch(toggleMute())}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          aria-pressed={!muted}
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </div>
    </header>
  );
}
