// Seed data + small pure helpers. Nothing here is React state — these are
// plain functions/values that App.jsx uses to build and derive state from.

export function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const STATUSES = ["Active", "Completed", "Abandoned"];

export function nextStatus(current) {
  const i = STATUSES.indexOf(current);
  return STATUSES[(i + 1) % STATUSES.length];
}

// Small pool of flavor icons. New quests posted through the form get one
// at random; seed quests below each have one picked by hand.
const AVATARS = ["🗡️", "🛡️", "🏹", "🔥", "❄️", "🌊", "📜", "🐉"];

export function pickAvatar() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

const DIFFICULTY_RANK = { Easy: 1, Medium: 2, Hard: 3 };

// Returns a NEW array (never mutates `list`) sorted by the chosen strategy.
export function sortQuests(list, sortBy) {
  const copy = [...list];
  switch (sortBy) {
    case "reward-desc":
      return copy.sort((a, b) => b.reward - a.reward);
    case "reward-asc":
      return copy.sort((a, b) => a.reward - b.reward);
    case "difficulty":
      return copy.sort(
        (a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]
      );
    case "title":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return copy; // "default" = keep insertion order
  }
}

export const initialQuests = [
  {
    id: makeId(),
    title: "Clear the Whispering Cellar",
    hero: "Aidana the Swift",
    difficulty: "Easy",
    reward: 50,
    status: "Active",
    avatar: "🗡️",
    flavor:
      "Rats the size of cats have taken the tavern's cellar. The innkeeper is offering ale for life.",
  },
  {
    id: makeId(),
    title: "Escort the Merchant Caravan",
    hero: "Bek the Bold",
    difficulty: "Medium",
    reward: 120,
    status: "Active",
    avatar: "🏹",
    flavor:
      "Bandits have been spotted on the eastern road. The caravan leaves at dawn, with or without an escort.",
  },
  {
    id: makeId(),
    title: "Slay the Frost Wyrm",
    hero: "Dana Ironshield",
    difficulty: "Hard",
    reward: 400,
    status: "Active",
    avatar: "🐉",
    flavor:
      "The wyrm has slept under the glacier for a century. Something woke it up.",
  },
  {
    id: makeId(),
    title: "Recover the Lost Scrolls",
    hero: "Aidana the Swift",
    difficulty: "Medium",
    reward: 90,
    status: "Completed",
    avatar: "📜",
    flavor:
      "Three scrolls, scattered across the old library after the fire. Two have already been found.",
  },
  {
    id: makeId(),
    title: "Negotiate with the River Spirits",
    hero: "Nurlan the Quiet",
    difficulty: "Hard",
    reward: 250,
    status: "Abandoned",
    avatar: "🌊",
    flavor:
      "The spirits flooded the lower fields last spring. They want something in return for peace.",
  },
];
