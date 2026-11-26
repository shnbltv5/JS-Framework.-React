// Random cats and random café events. Randomness lives here (and in action "prepare" callbacks),
// never inside reducers: reducers must always give the same result for the same action.
import { CAT_NAMES, EYES, FURS, PATTERNS, PERSONALITIES } from "./gameData.js";

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// A cat that can be adopted: name, character and looks
export function randomCandidate() {
  return {
    name: pick(CAT_NAMES),
    personality: pick(Object.keys(PERSONALITIES)),
    fur: pick(FURS).id,
    pattern: pick(PATTERNS),
    eyes: pick(EYES),
    key: Math.random().toString(36).slice(2, 9), // React key for the shop card
  };
}

export function randomCandidates(count = 3) {
  return Array.from({ length: count }, randomCandidate);
}

// The very first cat is always the same, so the game starts the same way for everyone
export const STARTER_CAT = {
  name: "Mochi",
  personality: "cuddler",
  fur: "ginger",
  pattern: "tabby",
  eyes: "#7BC86C",
  key: "starter",
};

// ---------- events ----------

// Picks an event that makes sense right now (a cup accident needs a gremlin, a kitten needs free space)
export function randomEvent(cats, canAdopt) {
  const gremlin = cats.find((cat) => cat.personality === "gremlin");
  const options = ["critic", "zoomies", "rain", ...(canAdopt ? ["kitten"] : []), ...(gremlin ? ["cup", "cup"] : [])];
  const kind = pick(options);

  if (kind === "cup") return { kind, catName: gremlin.name };
  if (kind === "kitten") return { kind, kitten: randomCandidate() };
  return { kind };
}
