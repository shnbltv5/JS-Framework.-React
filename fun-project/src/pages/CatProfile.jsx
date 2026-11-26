import { useState } from "react";
import { Link, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Cat from "../components/Cat.jsx";
import NeedBar from "../components/NeedBar.jsx";
import CoinIcon from "../components/CoinIcon.jsx";
import { renameCat, wearAccessory } from "../features/cafe/cafeSlice.js";
import { selectCafe, selectCatById } from "../features/cafe/cafeSelectors.js";
import { ACCESSORIES, FEED_COST, FURS, PERSONALITIES, catIncome } from "../features/cafe/gameData.js";
import { faceOf, formatRate } from "../features/cafe/format.js";
import { useCatActions } from "../hooks/useCatActions.js";

const NAME_PATTERN = /^[\p{L}\p{N} '-]{1,14}$/u;

function RenameForm({ cat, onDone }) {
  const dispatch = useDispatch();
  const [name, setName] = useState(cat.name);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const clean = name.trim();
    if (!NAME_PATTERN.test(clean)) {
      setError("Use 1–14 letters, numbers or spaces.");
      return;
    }
    dispatch(renameCat({ id: cat.id, name: clean }));
    onDone();
  }

  return (
    <form className="rename" onSubmit={handleSubmit} noValidate>
      <label className="sr-only" htmlFor="cat-name">
        New name
      </label>
      <input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={14} autoFocus />
      <button type="submit" className="btn btn-pink">Save name</button>
      <button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}

export default function CatProfile() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const cat = useSelector((state) => selectCatById(state, id));
  const { accessories } = useSelector(selectCafe);
  const { pet, feed } = useCatActions();
  const [renaming, setRenaming] = useState(false);

  if (!cat) {
    return (
      <section className="page empty-state">
        <span className="empty-emoji" aria-hidden="true">🙀</span>
        <h1 className="page-title">This cat doesn't live here</h1>
        <p className="page-lead">Maybe it was just a dream about a cat.</p>
        <Link to="/cats" className="btn btn-pink">See your cats</Link>
      </section>
    );
  }

  const personality = PERSONALITIES[cat.personality];
  const fur = FURS.find((f) => f.id === cat.fur);

  return (
    <section className="page profile">
      <Link to="/cats" className="text-link">← All cats</Link>

      <div className="profile-grid">
        <div className="profile-portrait">
          <Cat cat={cat} mood={faceOf(cat, Date.now())} />
        </div>

        <div className="profile-info">
          {renaming ? (
            <RenameForm key={cat.id} cat={cat} onDone={() => setRenaming(false)} />
          ) : (
            <div className="profile-name">
              <h1 className="page-title">{cat.name}</h1>
              <button type="button" className="btn btn-ghost btn-small" onClick={() => setRenaming(true)}>
                Rename
              </button>
            </div>
          )}
          <p className="badge">
            <span aria-hidden="true">{personality.emoji}</span> {personality.label}
          </p>
          <p className="speech">“{personality.line}”</p>
          <p>{personality.quirk}</p>

          <NeedBar label="Fullness" icon="🐟" value={cat.fullness} tone="mint" />
          <NeedBar label="Happiness" icon="💗" value={cat.happiness} tone="pink" />

          <dl className="facts">
            <div><dt>Level</dt><dd>{cat.level} / 10</dd></div>
            <div><dt>Pets</dt><dd>{cat.pets}</dd></div>
            <div><dt>Earns</dt><dd><CoinIcon size={15} /> {formatRate(catIncome(cat))}/s</dd></div>
            <div><dt>Fur</dt><dd>{fur.label}, {cat.pattern}</dd></div>
            <div><dt>Lives here since</dt><dd>{new Date(cat.adoptedAt).toLocaleDateString()}</dd></div>
          </dl>

          <div className="panel-actions">
            <button type="button" className="btn btn-pink" onClick={() => pet(cat)}>Pet {cat.name}</button>
            <button type="button" className="btn btn-mint" onClick={() => feed(cat)}>
              Feed · <CoinIcon size={16} /> {FEED_COST}
            </button>
          </div>

          <h2 className="section-title">Wardrobe</h2>
          {accessories.length === 0 ? (
            <p>
              The wardrobe is empty. <Link to="/shop?tab=style" className="text-link">Buy an accessory</Link>
            </p>
          ) : (
            <div className="wardrobe">
              <button
                type="button"
                className={`chip ${cat.accessory === null ? "is-active" : ""}`}
                onClick={() => dispatch(wearAccessory({ catId: cat.id, accessoryId: null }))}
              >
                Nothing
              </button>
              {ACCESSORIES.filter((a) => accessories.includes(a.id)).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`chip ${cat.accessory === a.id ? "is-active" : ""}`}
                  aria-pressed={cat.accessory === a.id}
                  onClick={() => dispatch(wearAccessory({ catId: cat.id, accessoryId: a.id }))}
                >
                  <span aria-hidden="true">{a.emoji}</span> {a.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
