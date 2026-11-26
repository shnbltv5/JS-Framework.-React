import { useEffect, useRef, useState } from "react";
import Cat from "./Cat.jsx";
import { faceOf } from "../features/cafe/format.js";

// ---------- where cats walk (UI only, so it is local state, not Redux) ----------

function startSpot(index, total) {
  return { x: 8 + ((index + 0.5) * 80) / Math.max(total, 1), row: index % 2, flip: false };
}

function useWander(catIds) {
  const [spots, setSpots] = useState({});

  // New cats get a place, every 2.4 s one random cat walks somewhere else
  useEffect(() => {
    setSpots((old) => {
      const next = {};
      catIds.forEach((id, i) => (next[id] = old[id] ?? startSpot(i, catIds.length)));
      return next;
    });
  }, [catIds.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setInterval(() => {
      setSpots((old) => {
        const ids = Object.keys(old);
        if (ids.length === 0) return old;
        const id = ids[Math.floor(Math.random() * ids.length)];
        const x = 6 + Math.random() * 78;
        return { ...old, [id]: { ...old[id], x, flip: x < old[id].x } };
      });
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return spots;
}

// ---------- decorations ----------

function Window({ night, raining }) {
  return (
    <div className={`window ${night ? "is-night" : ""} ${raining ? "is-raining" : ""}`} aria-hidden="true">
      <div className="window-sky">
        {night ? (
          <>
            <span className="moon" />
            <span className="star s1" />
            <span className="star s2" />
            <span className="star s3" />
          </>
        ) : (
          <>
            <span className="cloud c1" />
            <span className="cloud c2" />
          </>
        )}
        {raining && <span className="rain" />}
      </div>
      <span className="window-cross" />
    </div>
  );
}

function CatTree() {
  return (
    <svg className="decor decor-tree" viewBox="0 0 80 140" aria-hidden="true">
      <g stroke="#4B2E4F" strokeWidth="3" strokeLinejoin="round">
        <rect x="16" y="34" width="12" height="96" rx="4" fill="#F3D9B1" />
        <rect x="50" y="70" width="12" height="60" rx="4" fill="#F3D9B1" />
        <rect x="4" y="128" width="72" height="10" rx="5" fill="#C9A7FF" />
        <rect x="2" y="24" width="44" height="12" rx="6" fill="#FF9FC4" />
        <rect x="36" y="62" width="40" height="11" rx="5.5" fill="#9EE6C9" />
      </g>
      <path d="M19 50 h6 M19 62 h6 M19 74 h6 M19 86 h6 M19 98 h6 M53 86 h6 M53 98 h6" stroke="#D4B184" strokeWidth="2" />
      <circle cx="38" cy="44" r="5" fill="#FFE27A" stroke="#4B2E4F" strokeWidth="2.5" />
      <path d="M38 36 v3" stroke="#4B2E4F" strokeWidth="2" />
    </svg>
  );
}

function FishTank() {
  return (
    <svg className="decor decor-tank" viewBox="0 0 110 80" aria-hidden="true">
      <rect x="5" y="8" width="100" height="62" rx="12" fill="#BDEBFF" stroke="#4B2E4F" strokeWidth="3" />
      <path d="M8 26 q12 -5 24 0 t24 0 t24 0 t24 0 v38 q0 4 -4 4 h-90 q-4 0 -4 -4z" fill="#8FD6F5" />
      <g className="fish">
        <path d="M30 44 q10 -9 20 0 q-10 9 -20 0z M30 44 l-7 -6 v12z" fill="#FF9A6B" stroke="#4B2E4F" strokeWidth="2" />
      </g>
      <g className="fish fish-2">
        <path d="M70 36 q8 -7 16 0 q-8 7 -16 0z M86 36 l6 -5 v10z" fill="#FFE27A" stroke="#4B2E4F" strokeWidth="2" />
      </g>
      <path d="M20 68 q2 -14 -3 -22 M24 68 q4 -10 2 -16" stroke="#5BBF8A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="2" y="68" width="106" height="10" rx="5" fill="#C9A7FF" stroke="#4B2E4F" strokeWidth="3" />
    </svg>
  );
}

function Counter() {
  return (
    <div className="counter" aria-hidden="true">
      <div className="counter-top">
        <span>🧁</span>
        <span>☕</span>
        <span>🍰</span>
      </div>
      <div className="counter-front" />
    </div>
  );
}

function FairyLights() {
  const colors = ["#FF5C9A", "#FFE27A", "#9EE6C9", "#B48CFF", "#6EB6FF"];
  return (
    <svg className="decor decor-lights" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 6 Q100 34 200 10 T400 8" fill="none" stroke="#4B2E4F" strokeWidth="2" />
      {Array.from({ length: 15 }, (_, i) => {
        const x = 14 + i * 26;
        const y = 6 + Math.sin((i / 14) * Math.PI * 2) * 7 + 10;
        return <circle key={i} className="bulb" cx={x} cy={y} r="5" fill={colors[i % colors.length]} style={{ animationDelay: `${(i % 5) * 0.3}s` }} />;
      })}
    </svg>
  );
}

// ---------- the room ----------

export default function Room({ cats, decor, selectedId, boost, onPet }) {
  const spots = useWander(cats.map((c) => c.id));
  const [particles, setParticles] = useState([]);
  const roomRef = useRef(null);
  const nextParticle = useRef(1);
  const now = Date.now();
  const hour = new Date().getHours();
  const night = hour < 7 || hour >= 20;

  function handleCatClick(cat, event) {
    // Hearts and "+coins" fly up where the cat was clicked
    const box = roomRef.current.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    const gained = onPet(cat);
    const id = nextParticle.current++;
    setParticles((old) => [...old.slice(-12), { id, x, y, text: `+${gained}` }]);
    setTimeout(() => setParticles((old) => old.filter((p) => p.id !== id)), 1100);

    // a little squish, made with the Web Animations API
    event.currentTarget.animate(
      [{ transform: "scale(1, 1)" }, { transform: "scale(1.12, 0.88)" }, { transform: "scale(0.95, 1.06)" }, { transform: "scale(1, 1)" }],
      { duration: 380, easing: "ease-out" },
    );
  }

  return (
    <div className={`room ${night ? "is-night" : ""}`} ref={roomRef}>
      <div className="wall" />
      {decor.includes("lights") && <FairyLights />}
      <Window night={night} raining={boost?.kind === "rain"} />

      <div className="menu-board" aria-hidden="true">
        <p className="menu-title">Today</p>
        <p>Tuna latte</p>
        <p>Catnip tea</p>
        <p>Purr-fait</p>
      </div>

      {decor.includes("tank") && <FishTank />}
      <div className="floor" />
      {decor.includes("rug") && <div className="rug" aria-hidden="true" />}
      {decor.includes("tree") && <CatTree />}
      {decor.includes("plant") && (
        <span className="decor decor-plant" aria-hidden="true">
          🪴
        </span>
      )}
      <Counter />

      {cats.map((cat) => {
        const spot = spots[cat.id] ?? startSpot(0, 1);
        const face = faceOf(cat, now);
        return (
          <button
            key={cat.id}
            type="button"
            className={`room-cat row-${spot.row} ${cat.id === selectedId ? "is-selected" : ""}`}
            style={{ left: `${spot.x}%` }}
            onClick={(e) => handleCatClick(cat, e)}
            aria-label={`Pet ${cat.name}`}
          >
            <span className="room-cat-inner" style={{ transform: spot.flip ? "scaleX(-1)" : undefined }}>
              <Cat cat={cat} mood={face} title={cat.name} />
            </span>
            {face === "sleeping" && (
              <span className="zzz" aria-hidden="true">
                z<span>z</span>
              </span>
            )}
            <span className="name-tag">{cat.name}</span>
          </button>
        );
      })}

      {particles.map((p) => (
        <span key={p.id} className="particle" style={{ left: `${p.x}%`, top: `${p.y}%` }} aria-hidden="true">
          <span className="heart">♥</span>
          <span className="plus">{p.text}</span>
        </span>
      ))}
    </div>
  );
}
