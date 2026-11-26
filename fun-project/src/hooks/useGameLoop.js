import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startEvent, tick } from "../features/cafe/cafeSlice.js";
import { selectCats, selectEvent } from "../features/cafe/cafeSelectors.js";
import { randomEvent } from "../features/cafe/catFactory.js";
import { MAX_CATS } from "../features/cafe/gameData.js";

/** The heartbeat of the game: one tick per second while the app is open. */
export function useGameLoop() {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setInterval(() => dispatch(tick(1)), 1000);
    return () => clearInterval(timer);
  }, [dispatch]);
}

/** Something happens in the café every 45–75 seconds. */
export function useRandomEvents() {
  const dispatch = useDispatch();
  const cats = useSelector(selectCats);
  const event = useSelector(selectEvent);
  const hasEvent = event !== null;

  useEffect(() => {
    if (hasEvent) return; // wait until the current card is closed
    const delay = 45_000 + Math.random() * 30_000;
    const timer = setTimeout(() => dispatch(startEvent(randomEvent(cats, cats.length < MAX_CATS))), delay);
    return () => clearTimeout(timer);
    // cats are read only when the timer fires; a new cat must not restart the countdown
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, hasEvent]);
}
