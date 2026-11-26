import { useId } from "react";
import { FURS } from "../features/cafe/gameData.js";

const INK = "#4B2E4F";
const PINK = "#FF8FB8";
const WHITE = "#FFFFFF";

// Eyes for every mood
function Eyes({ mood, color }) {
  if (mood === "happy") {
    return (
      <g fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round">
        <path d="M48 64 q7 -9 14 0" />
        <path d="M78 64 q7 -9 14 0" />
      </g>
    );
  }
  if (mood === "sleeping") {
    return (
      <g fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round">
        <path d="M48 61 q7 7 14 0" />
        <path d="M78 61 q7 7 14 0" />
      </g>
    );
  }
  const big = mood === "hungry" || mood === "starving";
  return (
    <g className="cat-eyes">
      {[55, 85].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy="62" rx={big ? 7.5 : 6.5} ry={big ? 9 : 8} fill={color} stroke={INK} strokeWidth="2.5" />
          <ellipse cx={cx} cy="63" rx={big ? 4 : 3} ry={big ? 6.5 : 5.5} fill={INK} />
          <circle cx={cx - 2.5} cy="58.5" r={big ? 2.8 : 2.2} fill={WHITE} />
        </g>
      ))}
      {mood === "grumpy" && (
        <g stroke={INK} strokeWidth="3.5" strokeLinecap="round">
          <path d="M46 50 l14 5" />
          <path d="M94 50 l-14 5" />
        </g>
      )}
    </g>
  );
}

function Accessory({ id }) {
  switch (id) {
    case "bow":
      return (
        <g transform="translate(98 30) rotate(18)" stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
          <path d="M0 0 L-14 -9 L-14 9 Z" fill="#FF5C9A" />
          <path d="M0 0 L14 -9 L14 9 Z" fill="#FF5C9A" />
          <circle r="4.5" fill="#FF8FB8" />
        </g>
      );
    case "glasses":
      return (
        <g stroke={INK} strokeWidth="2.5">
          <rect x="42" y="54" width="25" height="16" rx="6" fill="#3A2240" />
          <rect x="73" y="54" width="25" height="16" rx="6" fill="#3A2240" />
          <path d="M67 60 h6" fill="none" />
          <path d="M47 58 l6 0" stroke={WHITE} strokeWidth="2" strokeLinecap="round" opacity=".7" />
          <path d="M78 58 l6 0" stroke={WHITE} strokeWidth="2" strokeLinecap="round" opacity=".7" />
        </g>
      );
    case "party":
      return (
        <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
          <path d="M56 32 L71 -4 L86 32 Z" fill="#9EE6C9" />
          <path d="M61 22 L80 18 M65 11 L76 9" stroke="#FF5C9A" strokeWidth="4" strokeLinecap="round" />
          <circle cx="71" cy="-6" r="5" fill="#FFE27A" />
        </g>
      );
    case "flower":
      return (
        <g stroke={INK} strokeWidth="2">
          {[
            [44, 34, "#FFB3C9"],
            [57, 27, "#FFE27A"],
            [70, 25, "#DCC8FF"],
            [83, 27, "#FFB3C9"],
            [96, 34, "#9EE6C9"],
          ].map(([x, y, fill]) => (
            <g key={x}>
              <circle cx={x} cy={y} r="7" fill={fill} />
              <circle cx={x} cy={y} r="2.5" fill="#FFF6D6" strokeWidth="1.5" />
            </g>
          ))}
        </g>
      );
    case "crown":
      return (
        <g stroke={INK} strokeWidth="2.5" strokeLinejoin="round">
          <path d="M50 32 L51 8 L62 20 L70 3 L78 20 L89 8 L90 32 Z" fill="#FFD54F" />
          <circle cx="70" cy="22" r="3.5" fill="#FF5C9A" />
        </g>
      );
    default:
      return null;
  }
}

/**
 * A cute sticker cat drawn with SVG.
 * mood: happy | okay | grumpy | hungry | starving | sleeping
 */
export default function Cat({ cat, mood = "okay", className = "", title }) {
  const clipId = useId();
  const fur = FURS.find((f) => f.id === cat.fur) ?? FURS[0];
  const isDark = cat.fur === "midnight";
  const white = cat.fur === "snow" ? "#F2EEF7" : WHITE;
  const patchColor = isDark ? "#FFF3DC" : cat.fur === "ginger" ? "#6B6180" : "#FFB677";
  const hungry = mood === "hungry" || mood === "starving";

  return (
    <svg
      className={`cat ${className}`}
      viewBox="0 -12 140 145"
      role="img"
      aria-label={title ?? `${cat.name}, a ${fur.label.toLowerCase()} cat`}
    >
      {/* tail (outline + fur), it sways */}
      <g className="cat-tail">
        <path d="M98 112 C 132 114, 138 78, 120 64" fill="none" stroke={INK} strokeWidth="17" strokeLinecap="round" />
        <path d="M98 112 C 132 114, 138 78, 120 64" fill="none" stroke={fur.base} strokeWidth="10.5" strokeLinecap="round" />
        {cat.pattern === "tabby" && (
          <path d="M127 92 l7 -2 M126 78 l7 -4" stroke={fur.shade} strokeWidth="4" strokeLinecap="round" />
        )}
      </g>

      {/* body */}
      <g className="cat-body">
        <ellipse cx="70" cy="101" rx="35" ry="27" fill={fur.base} stroke={INK} strokeWidth="3.5" />
        {(cat.pattern === "tuxedo" || cat.pattern === "socks") && (
          <ellipse cx="70" cy="105" rx="15" ry="18" fill={cat.pattern === "tuxedo" ? white : fur.base} />
        )}
        {cat.pattern === "tabby" && (
          <path d="M44 92 l9 3 M42 102 l9 2 M96 92 l-9 3 M98 102 l-9 2" stroke={fur.shade} strokeWidth="3.5" strokeLinecap="round" />
        )}
        {[57, 83].map((x) => (
          <ellipse
            key={x}
            cx={x}
            cy="124"
            rx="10"
            ry="6.5"
            fill={cat.pattern === "socks" || cat.pattern === "tuxedo" ? white : fur.base}
            stroke={INK}
            strokeWidth="3"
          />
        ))}
      </g>

      {/* head */}
      <g className="cat-head">
        <g stroke={INK} strokeWidth="3.5" strokeLinejoin="round">
          <path d="M34 46 L36 12 L60 31 Z" fill={fur.base} />
          <path d="M106 46 L104 12 L80 31 Z" fill={fur.base} />
        </g>
        <path d="M40 38 L41 21 L53 31 Z" fill="#FFB3C9" />
        <path d="M100 38 L99 21 L87 31 Z" fill="#FFB3C9" />

        <clipPath id={clipId}>
          <ellipse cx="70" cy="60" rx="40" ry="33" />
        </clipPath>
        <ellipse cx="70" cy="60" rx="40" ry="33" fill={fur.base} />
        <g clipPath={`url(#${clipId})`}>
          {cat.pattern === "patches" && <ellipse cx="50" cy="44" rx="22" ry="17" fill={patchColor} />}
          {cat.pattern === "tuxedo" && <ellipse cx="70" cy="86" rx="18" ry="14" fill={white} />}
          {cat.pattern === "tabby" && (
            <g stroke={fur.shade} strokeWidth="3.5" strokeLinecap="round">
              <path d="M62 30 l2 9 M70 28 v11 M78 30 l-2 9" />
              <path d="M30 58 h9 M31 66 h8 M110 58 h-9 M109 66 h-8" />
            </g>
          )}
        </g>
        <ellipse cx="70" cy="60" rx="40" ry="33" fill="none" stroke={INK} strokeWidth="3.5" />

        <ellipse cx="45" cy="73" rx="7" ry="4" fill={PINK} opacity=".55" />
        <ellipse cx="95" cy="73" rx="7" ry="4" fill={PINK} opacity=".55" />

        <Eyes mood={mood} color={cat.eyes} />

        <path d="M66 69 h8 l-4 4.5 z" fill={PINK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        {hungry ? (
          <ellipse cx="70" cy="79" rx="4" ry="4.5" fill="#B3476B" stroke={INK} strokeWidth="2" />
        ) : (
          <path d="M62 75 q4 4.5 8 0 q4 4.5 8 0" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        )}
        <g stroke={INK} strokeWidth="2" strokeLinecap="round" opacity=".55">
          <path d="M28 68 l14 2 M29 76 l13 -1 M112 68 l-14 2 M111 76 l-13 -1" />
        </g>
        {mood === "grumpy" && <path d="M104 46 q4 6 0 9 q-4 -3 0 -9z" fill="#9FD8FF" stroke={INK} strokeWidth="1.5" />}

        <Accessory id={cat.accessory} />
      </g>
    </svg>
  );
}
