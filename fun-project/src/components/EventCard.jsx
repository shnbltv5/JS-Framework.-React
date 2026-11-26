import { useDispatch, useSelector } from "react-redux";
import { resolveEvent } from "../features/cafe/cafeSlice.js";
import { selectCats, selectEvent } from "../features/cafe/cafeSelectors.js";
import { MAX_CATS, PERSONALITIES } from "../features/cafe/gameData.js";
import Cat from "./Cat.jsx";

const EVENTS = {
  critic: {
    emoji: "🧐",
    title: "A food critic walked in",
    text: () => "Give them the window seat and the whole café earns double for 30 seconds.",
    button: "Serve the critic",
  },
  zoomies: {
    emoji: "🌀",
    title: "Zoomies!",
    text: () => "Every cat is running laps around the tables. Everyone gets happier.",
    button: "Watch the chaos",
  },
  rain: {
    emoji: "🌧️",
    title: "Rainy afternoon",
    text: () => "People hide from the rain in your café. Income ×1.5 for 40 seconds.",
    button: "Open the doors",
  },
  cup: {
    emoji: "☕",
    title: "Crash!",
    text: (e) => `${e.catName} pushed a cup off the counter and looks very proud. A new cup costs 15 coins.`,
    button: "Sweep it up",
  },
  kitten: {
    emoji: "🐣",
    title: "A kitten at the door",
    text: (e) => `${e.kitten.name}, a tiny ${PERSONALITIES[e.kitten.personality].label.toLowerCase()} kitten, is looking at you through the glass.`,
    button: "Let them in",
  },
};

// Random café events appear here, on every page
export default function EventCard() {
  const dispatch = useDispatch();
  const event = useSelector(selectEvent);
  const cats = useSelector(selectCats);
  if (!event) return null;

  const info = EVENTS[event.kind];
  const isKitten = event.kind === "kitten";
  const hasRoom = cats.length < MAX_CATS;

  return (
    <div className="event-card" role="dialog" aria-labelledby="event-title">
      {isKitten ? (
        <div className="event-kitten">
          <Cat cat={{ ...event.kitten, accessory: null }} mood="okay" />
        </div>
      ) : (
        <span className="event-emoji" aria-hidden="true">{info.emoji}</span>
      )}
      <div className="event-body">
        <h2 id="event-title">{info.title}</h2>
        <p>{info.text(event)}</p>
        <div className="event-actions">
          {(!isKitten || hasRoom) && (
            <button type="button" className="btn btn-pink" onClick={() => dispatch(resolveEvent(isKitten ? "adopt" : "ok"))}>
              {info.button}
            </button>
          )}
          {isKitten && (
            <button type="button" className="btn btn-ghost" onClick={() => dispatch(resolveEvent("snack"))}>
              {hasRoom ? "Give a snack and wave goodbye" : "The café is full — give a snack"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
