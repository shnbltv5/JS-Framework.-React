import { useDispatch, useSelector } from "react-redux";
import { feedCat, petCat } from "../features/cafe/cafeSlice.js";
import { selectCafe } from "../features/cafe/cafeSelectors.js";
import { FEED_COST, petValue } from "../features/cafe/gameData.js";
import { useSound } from "./useSound.js";

/** Pet and feed with sounds. pet() returns how many coins the pet gave (for the "+2" bubble). */
export function useCatActions() {
  const dispatch = useDispatch();
  const { upgrades, coins } = useSelector(selectCafe);
  const { meow, coin, nope } = useSound();

  function pet(cat) {
    dispatch(petCat(cat.id));
    meow(cat.id);
    return petValue(cat, upgrades);
  }

  function feed(cat) {
    if (cat.fullness >= 90 || coins < FEED_COST) nope();
    else coin();
    dispatch(feedCat(cat.id));
  }

  return { pet, feed };
}
