import { Link } from "react-router";
import { useSelector } from "react-redux";
import Cat from "../components/Cat.jsx";
import { selectCats } from "../features/cafe/cafeSelectors.js";
import { PERSONALITIES, moodOf } from "../features/cafe/gameData.js";
import { MOOD_TEXT, faceOf } from "../features/cafe/format.js";

export default function Cats() {
  const cats = useSelector(selectCats);
  const now = Date.now();

  return (
    <section className="page">
      <h1 className="page-title">Your cats</h1>
      <p className="page-lead">
        {cats.length} {cats.length === 1 ? "cat lives" : "cats live"} in the café. Open a profile to rename a cat or dress them up.
      </p>
      <ul className="album">
        {cats.map((cat) => (
          <li key={cat.id}>
            <Link to={`/cats/${cat.id}`} className="album-card">
              <Cat cat={cat} mood={faceOf(cat, now)} />
              <span className="album-name">{cat.name}</span>
              <span className="album-meta">
                {PERSONALITIES[cat.personality].emoji} {PERSONALITIES[cat.personality].label} · lv {cat.level}
              </span>
              <span className={`mood-pill mood-${moodOf(cat)}`}>{MOOD_TEXT[moodOf(cat)]}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/shop" className="btn btn-ghost">
        Adopt another cat
      </Link>
    </section>
  );
}
