import { useState } from "react";
import { useSelector } from "react-redux";
import Room from "../components/Room.jsx";
import CatPanel from "../components/CatPanel.jsx";
import { selectCafe } from "../features/cafe/cafeSelectors.js";
import { useCatActions } from "../hooks/useCatActions.js";

export default function Cafe() {
  const { cats, decor, boost } = useSelector(selectCafe);
  const { pet, feed } = useCatActions();
  // Which cat is shown in the card: UI state, so it stays local
  const [selectedId, setSelectedId] = useState(cats[0].id);
  const selected = cats.find((c) => c.id === selectedId) ?? cats[0];

  function handlePet(cat) {
    setSelectedId(cat.id);
    return pet(cat);
  }

  return (
    <section className="cafe-page">
      <div className="cafe-stage">
        <Room cats={cats} decor={decor} selectedId={selected.id} boost={boost} onPet={handlePet} />
        <p className="hint">Tap a cat to pet it. Happy, well-fed cats earn more coins.</p>
      </div>
      <CatPanel cat={selected} onPet={handlePet} onFeed={feed} />
    </section>
  );
}
