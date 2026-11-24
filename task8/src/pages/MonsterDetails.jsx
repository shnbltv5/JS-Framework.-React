import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useMonster } from "../hooks/useMonsters.js";
import StatusMessage from "../components/StatusMessage.jsx";
import CachedNotice from "../components/CachedNotice.jsx";

const TYPE_ICONS = {
  aberration: "🐙", beast: "🐺", celestial: "👼", construct: "🗿", dragon: "🐉", elemental: "🔥",
  fey: "🧚", fiend: "😈", giant: "🪓", humanoid: "🧝", monstrosity: "🦂", ooze: "🫧",
  plant: "🌿", undead: "💀",
};
const ABILITIES = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];

// 18 -> "+4", 8 -> "-1"
function modifier(score) {
  const value = Math.floor((score - 10) / 2);
  return value >= 0 ? `+${value}` : String(value);
}

// { walk: "40 ft.", fly: "80 ft." } -> "walk 40 ft., fly 80 ft."
function describe(object) {
  return Object.entries(object ?? {})
    .map(([key, value]) => `${key.replace(/_/g, " ")} ${value}`)
    .join(", ");
}

function list(items) {
  return items?.length ? items.map((item) => item.name ?? item).join(", ") : null;
}

export default function MonsterDetails() {
  const { index } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { status, monster, isSavedCopy, savedAt, error, retry } = useMonster(index);
  const notFound = error?.kind === "not-found";
  const isOffline = error?.kind === "offline";

  function handleBack() {
    if (location.key !== "default") navigate(-1);
    else navigate("/bestiary");
  }

  return (
    <section>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={handleBack}>
          ← Back
        </button>
        <Link to="/bestiary" className="btn btn-ghost">
          All monsters
        </Link>
      </div>

      {status === "loading" && <StatusMessage variant="loading" title="Reading the bestiary..." />}

      {status === "failed" && notFound && (
        <StatusMessage
          variant="error"
          title="Monster not found"
          text={error.message}
          actionLabel="Browse all monsters"
          onAction={() => navigate("/bestiary")}
        />
      )}

      {status === "failed" && !notFound && (
        <StatusMessage
          variant="error"
          title={isOffline ? "Not available offline" : "Could not load this monster"}
          text={error.message}
          actionLabel="Try again"
          onAction={retry}
        >
          {isOffline && (
            <a className="btn btn-ghost" href="/offline">
              Offline page
            </a>
          )}
        </StatusMessage>
      )}

      {status === "succeeded" && (
        <article className="detail monster-detail">
          {isSavedCopy && <CachedNotice cachedAt={savedAt} />}

          <div className="card-head">
            <span className="quest-avatar" aria-hidden="true">
              {TYPE_ICONS[monster.type] ?? "👹"}
            </span>
            <div>
              <h2>{monster.name}</h2>
              <p className="quest-meta">
                {monster.size} {monster.type}
                {monster.subtype ? ` (${monster.subtype})` : ""} · {monster.alignment}
              </p>
            </div>
          </div>

          <dl className="facts">
            <div>
              <dt>Armor class</dt>
              <dd>{monster.armor_class?.map((ac) => ac.value).join(" / ")}</dd>
            </div>
            <div>
              <dt>Hit points</dt>
              <dd>
                {monster.hit_points} ({monster.hit_dice})
              </dd>
            </div>
            <div>
              <dt>Speed</dt>
              <dd>{describe(monster.speed)}</dd>
            </div>
            <div>
              <dt>Challenge</dt>
              <dd>
                {monster.challenge_rating} ({monster.xp} XP)
              </dd>
            </div>
          </dl>

          <table className="ability-table">
            <thead>
              <tr>
                {ABILITIES.map((ability) => (
                  <th key={ability} scope="col">
                    {ability.slice(0, 3).toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {ABILITIES.map((ability) => (
                  <td key={ability}>
                    {monster[ability]} <span>({modifier(monster[ability])})</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          <dl className="monster-traits">
            {monster.proficiencies?.length > 0 && (
              <div>
                <dt>Proficiencies</dt>
                <dd>
                  {monster.proficiencies
                    .map((p) => `${p.proficiency.name.replace(/^(Saving Throw|Skill): /, "")} +${p.value}`)
                    .join(", ")}
                </dd>
              </div>
            )}
            {list(monster.damage_immunities) && (
              <div>
                <dt>Damage immunities</dt>
                <dd>{list(monster.damage_immunities)}</dd>
              </div>
            )}
            {list(monster.damage_resistances) && (
              <div>
                <dt>Damage resistances</dt>
                <dd>{list(monster.damage_resistances)}</dd>
              </div>
            )}
            {list(monster.condition_immunities) && (
              <div>
                <dt>Condition immunities</dt>
                <dd>{list(monster.condition_immunities)}</dd>
              </div>
            )}
            <div>
              <dt>Senses</dt>
              <dd>{describe(monster.senses)}</dd>
            </div>
            <div>
              <dt>Languages</dt>
              <dd>{monster.languages || "—"}</dd>
            </div>
          </dl>

          {[
            ["Special abilities", monster.special_abilities],
            ["Actions", monster.actions],
            ["Legendary actions", monster.legendary_actions],
          ]
            .filter(([, items]) => items?.length > 0)
            .map(([title, items]) => (
              <div key={title} className="monster-section">
                <h3>{title}</h3>
                {items.map((item, i) => (
                  <p key={`${item.name}-${i}`}>
                    <strong>{item.name}.</strong> {item.desc}
                  </p>
                ))}
              </div>
            ))}
        </article>
      )}
    </section>
  );
}
