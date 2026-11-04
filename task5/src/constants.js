export const PAGE_SIZE = 9;

export const REGIONS = [
  "Crystal Highlands",
  "Shadow Marsh",
  "Ember Desert",
  "Frost Peaks",
  "Sunken Coast",
  "Iron Citadel",
];

export const STATUS_LABELS = {
  open: "Open",
  active: "In progress",
  completed: "Completed",
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "rewardDesc", label: "Reward: high to low" },
  { value: "rewardAsc", label: "Reward: low to high" },
  { value: "difficultyDesc", label: "Difficulty: hardest first" },
  { value: "difficultyAsc", label: "Difficulty: easiest first" },
  { value: "title", label: "Title A–Z" },
];

// Which status changes are allowed from each status
export const TRANSITIONS = {
  open: [{ to: "active", label: "Accept quest" }],
  active: [
    { to: "completed", label: "Complete quest" },
    { to: "open", label: "Abandon quest" },
  ],
  completed: [{ to: "open", label: "Reopen quest" }],
};

export const INITIAL_FILTERS = {
  search: "",
  region: "all",
  difficulty: "all",
  status: "all",
  sort: "newest",
};

const AVATARS = ["🗡️", "🛡️", "🏹", "🔥", "❄️", "🌊", "📜", "🐉"];

// Stable icon for a quest, derived from its id
export function avatarFor(id) {
  return AVATARS[id % AVATARS.length];
}

// 1-2 easy, 3 medium, 4-5 hard (used for card colour)
export function difficultyTier(level) {
  if (level <= 2) return "easy";
  if (level === 3) return "medium";
  return "hard";
}
