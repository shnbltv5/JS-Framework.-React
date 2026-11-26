import { useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Cat from "../components/Cat.jsx";
import CoinIcon from "../components/CoinIcon.jsx";
import { adoptCat, buyAccessory, buyDecor, buyUpgrade, rerollCandidates } from "../features/cafe/cafeSlice.js";
import { selectAdoption, selectCafe } from "../features/cafe/cafeSelectors.js";
import { ACCESSORIES, DECOR, MAX_CATS, PERSONALITIES, REROLL_COST, UPGRADES } from "../features/cafe/gameData.js";
import { formatCoins } from "../features/cafe/format.js";
import { useSound } from "../hooks/useSound.js";

const TABS = [
  { id: "cats", label: "Adopt", icon: "🐱" },
  { id: "upgrades", label: "Upgrades", icon: "⚙️" },
  { id: "decor", label: "Decor", icon: "🪴" },
  { id: "style", label: "Style", icon: "🎀" },
];

// The price button: shows how many coins are missing when it's too expensive
function BuyButton({ price, coins, onBuy, doneText }) {
  if (doneText) return <span className="owned">{doneText}</span>;
  const missing = price - coins;
  return (
    <button type="button" className="btn btn-price" onClick={onBuy} disabled={missing > 0}>
      <span className="price-line">
        <CoinIcon size={18} /> {formatCoins(price)}
      </span>
      {missing > 0 && <span className="missing">need {formatCoins(missing)} more</span>}
    </button>
  );
}

function ShopRow({ emoji, name, meta, text, children }) {
  return (
    <li className="shop-row">
      <span className="shop-emoji" aria-hidden="true">{emoji}</span>
      <div className="shop-info">
        <h3>{name}</h3>
        {meta && <p className="shop-meta">{meta}</p>}
        <p>{text}</p>
      </div>
      {children}
    </li>
  );
}

export default function Shop() {
  const dispatch = useDispatch();
  const { coin } = useSound();
  const cafe = useSelector(selectCafe);
  const adoption = useSelector(selectAdoption);
  // The open tab is in the URL: /shop?tab=decor
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === searchParams.get("tab")) ? searchParams.get("tab") : "cats";

  function buy(action) {
    coin();
    dispatch(action);
  }

  return (
    <section className="page">
      <h1 className="page-title">Shop</h1>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tab ${tab === t.id ? "is-active" : ""}`}
            onClick={() => setSearchParams(t.id === "cats" ? {} : { tab: t.id })}
          >
            <span aria-hidden="true">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === "cats" && (
        <>
          <p className="page-lead">
            {adoption.isFull
              ? "The café is full — 8 cats is the limit. Every cat here already has a home."
              : `Room for ${MAX_CATS - cafe.cats.length} more ${MAX_CATS - cafe.cats.length === 1 ? "cat" : "cats"}. Each new cat costs twice as much as the last one.`}
          </p>
          <ul className="adopt-grid">
            {cafe.candidates.map((candidate, index) => {
              const personality = PERSONALITIES[candidate.personality];
              return (
                <li key={candidate.key} className="adopt-card">
                  <div className="adopt-portrait">
                    <Cat cat={{ ...candidate, accessory: null }} mood="happy" />
                  </div>
                  <h3>{candidate.name}</h3>
                  <p className="badge">
                    <span aria-hidden="true">{personality.emoji}</span> {personality.label}
                  </p>
                  <p className="adopt-quirk">{personality.quirk}</p>
                  {!adoption.isFull && (
                    <BuyButton price={adoption.price} coins={cafe.coins} onBuy={() => buy(adoptCat(index))} />
                  )}
                </li>
              );
            })}
          </ul>
          {!adoption.isFull && (
            <button
              type="button"
              className="btn btn-ghost reroll"
              disabled={cafe.coins < REROLL_COST}
              onClick={() => buy(rerollCandidates())}
            >
              Meet other cats · <CoinIcon size={16} /> {REROLL_COST}
            </button>
          )}
        </>
      )}

      {tab === "upgrades" && (
        <ul className="shop-list">
          {UPGRADES.map((u) => {
            const level = cafe.upgrades[u.id];
            const maxed = level >= u.maxLevel;
            return (
              <ShopRow
                key={u.id}
                emoji={u.emoji}
                name={u.name}
                meta={u.maxLevel > 1 ? `Level ${level} of ${u.maxLevel}` : null}
                text={u.text}
              >
                <BuyButton
                  price={u.price(level)}
                  coins={cafe.coins}
                  onBuy={() => buy(buyUpgrade(u.id))}
                  doneText={maxed ? (u.maxLevel > 1 ? "Max level" : "Installed") : null}
                />
              </ShopRow>
            );
          })}
        </ul>
      )}

      {tab === "decor" && (
        <>
          <p className="page-lead">Decorations appear in the café, and every one makes cats lose happiness a little slower.</p>
          <ul className="shop-list">
            {DECOR.map((d) => (
              <ShopRow key={d.id} emoji={d.emoji} name={d.name} text="Calmer cats: −6% happiness loss">
                <BuyButton
                  price={d.price}
                  coins={cafe.coins}
                  onBuy={() => buy(buyDecor(d.id))}
                  doneText={cafe.decor.includes(d.id) ? "In the café" : null}
                />
              </ShopRow>
            ))}
          </ul>
        </>
      )}

      {tab === "style" && (
        <>
          <p className="page-lead">Buy an accessory, then put it on a cat in the cat's profile.</p>
          <ul className="shop-list">
            {ACCESSORIES.map((a) => (
              <ShopRow key={a.id} emoji={a.emoji} name={a.name} text="Just for looks. Cats love it anyway.">
                <BuyButton
                  price={a.price}
                  coins={cafe.coins}
                  onBuy={() => buy(buyAccessory(a.id))}
                  doneText={cafe.accessories.includes(a.id) ? "In the wardrobe" : null}
                />
              </ShopRow>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
