// Everything the game is made of: cat personalities, shop items, achievements and the economy rules.
// Plain data and pure functions — no React, no Redux here.

export const MAX_CATS = 8;
export const FEED_COST = 5;
export const REROLL_COST = 10;
export const AWAY_LIMIT_MS = 60 * 60 * 1000; // offline earnings for at most 1 hour
export const AWAY_RATE = 0.2; // the night staff earns only a fifth

// ---------- how a cat looks ----------

export const FURS = [
  { id: "cream", label: "Cream", base: "#FFF3DC", shade: "#F3DDB5" },
  { id: "ginger", label: "Ginger", base: "#FFB677", shade: "#F0924A" },
  { id: "ash", label: "Ash", base: "#CFC8DC", shade: "#A9A0BD" },
  { id: "midnight", label: "Midnight", base: "#6B6180", shade: "#4F4663" },
  { id: "snow", label: "Snow", base: "#FFFFFF", shade: "#E6E1EE" },
  { id: "peach", label: "Peach", base: "#FFCFBF", shade: "#F5A994" },
  { id: "lilac", label: "Lilac", base: "#DCC8FF", shade: "#B9A0F0" },
];

export const PATTERNS = ["solid", "tabby", "socks", "tuxedo", "patches"];

export const EYES = ["#F2B33D", "#7BC86C", "#6EB6FF", "#B48CFF"];

// ---------- personalities: each one changes the rules a little ----------

export const PERSONALITIES = {
  sleepy: {
    label: "Sleepy",
    emoji: "😴",
    quirk: "Earns a bit less, but gets hungry twice as slowly.",
    line: "zzz… five more minutes…",
    income: 0.8,
    hungerRate: 0.5,
    moodRate: 1,
    petCoins: 1,
    petJoy: 10,
    feedJoy: 5,
  },
  diva: {
    label: "Diva",
    emoji: "💅",
    quirk: "Pets are worth double coins, but she gets bored fast.",
    line: "You may pet me. Briefly.",
    income: 1.1,
    hungerRate: 1,
    moodRate: 2,
    petCoins: 2,
    petJoy: 10,
    feedJoy: 5,
  },
  gremlin: {
    label: "Gremlin",
    emoji: "😈",
    quirk: "Earns 50% more. Sometimes pushes cups off the counter.",
    line: "What if… I knock this over?",
    income: 1.5,
    hungerRate: 1,
    moodRate: 1,
    petCoins: 1,
    petJoy: 8,
    feedJoy: 5,
  },
  philosopher: {
    label: "Philosopher",
    emoji: "🧐",
    quirk: "Earns 20% more and shares deep thoughts.",
    line: "Is the red dot real, or only a dream?",
    income: 1.2,
    hungerRate: 1,
    moodRate: 0.8,
    petCoins: 1,
    petJoy: 10,
    feedJoy: 5,
  },
  foodie: {
    label: "Foodie",
    emoji: "🍣",
    quirk: "Always hungry, but every snack makes them very happy.",
    line: "Is that… tuna I smell?",
    income: 1,
    hungerRate: 1.5,
    moodRate: 1,
    petCoins: 1,
    petJoy: 10,
    feedJoy: 18,
  },
  cuddler: {
    label: "Cuddle bug",
    emoji: "🥰",
    quirk: "Pets make them much happier than other cats.",
    line: "Hold me forever please",
    income: 1,
    hungerRate: 1,
    moodRate: 1,
    petCoins: 1,
    petJoy: 18,
    feedJoy: 5,
  },
};

export const CAT_NAMES = [
  "Mochi", "Biscuit", "Noodle", "Pudding", "Mango", "Tofu", "Pickles", "Sushi", "Waffle",
  "Bean", "Marshmallow", "Pancake", "Dumpling", "Sesame", "Latte", "Nugget", "Boba", "Clover",
  "Muffin", "Ramen", "Toast", "Peaches", "Miso", "Cocoa", "Gizmo", "Ziggy", "Sir Fluff",
];

// ---------- shop ----------

export const UPGRADES = [
  {
    id: "cushions",
    name: "Fluffy cushions",
    emoji: "🛋️",
    text: "Comfy cats work better: +25% income per level.",
    maxLevel: 5,
    price: (level) => 80 * (level + 1) ** 2,
  },
  {
    id: "laser",
    name: "Laser pointer",
    emoji: "🔴",
    text: "+1 coin for every pet, per level.",
    maxLevel: 5,
    price: (level) => 60 * (level + 1) ** 2,
  },
  {
    id: "menu",
    name: "Fancy menu",
    emoji: "🧁",
    text: "Cakes on the menu: +1 coin per second per level.",
    maxLevel: 5,
    price: (level) => 120 * (level + 1) ** 2,
  },
  {
    id: "feeder",
    name: "Auto-feeder",
    emoji: "🐟",
    text: "Feeds a cat by itself when they get hungry (5 coins each time).",
    maxLevel: 1,
    price: () => 400,
  },
];

export const DECOR = [
  { id: "plant", name: "Monstera plant", emoji: "🪴", price: 60, spot: "plant" },
  { id: "rug", name: "Round rug", emoji: "🟣", price: 90, spot: "rug" },
  { id: "lights", name: "Fairy lights", emoji: "✨", price: 120, spot: "lights" },
  { id: "tree", name: "Cat tree", emoji: "🌳", price: 180, spot: "tree" },
  { id: "tank", name: "Fish tank", emoji: "🐠", price: 260, spot: "tank" },
];
// Every decoration makes cats lose happiness 6% slower
export const DECOR_CALM = 0.06;

export const ACCESSORIES = [
  { id: "bow", name: "Pink bow", emoji: "🎀", price: 40 },
  { id: "glasses", name: "Cool shades", emoji: "🕶️", price: 70 },
  { id: "party", name: "Party hat", emoji: "🥳", price: 90 },
  { id: "flower", name: "Flower crown", emoji: "🌸", price: 120 },
  { id: "crown", name: "Royal crown", emoji: "👑", price: 300 },
];

export function adoptPrice(catCount) {
  return 50 * 2 ** (catCount - 1);
}

// ---------- economy ----------

// Coins for one pet: personality bonus × laser pointer level
export function petValue(cat, upgrades) {
  return PERSONALITIES[cat.personality].petCoins * (1 + upgrades.laser);
}

export function levelFromPets(pets) {
  return Math.min(10, 1 + Math.floor(pets / 15));
}

// A cat's mood decides how well they work
export function moodOf(cat) {
  if (cat.fullness < 15) return "starving";
  if (cat.fullness < 30) return "hungry";
  if (cat.happiness >= 70) return "happy";
  if (cat.happiness >= 35) return "okay";
  return "grumpy";
}

const MOOD_FACTOR = { starving: 0.2, hungry: 0.8, happy: 1.5, okay: 1, grumpy: 0.5 };

export function catIncome(cat) {
  const personality = PERSONALITIES[cat.personality];
  return 1 * (1 + 0.15 * (cat.level - 1)) * personality.income * MOOD_FACTOR[moodOf(cat)];
}

export const BOOSTS = {
  critic: { label: "Food critic", multiplier: 2 },
  rain: { label: "Rainy rush", multiplier: 1.5 },
};

export function boostMultiplier(boost, now) {
  if (!boost || now > boost.until) return 1;
  return BOOSTS[boost.kind].multiplier;
}

// Coins per second for the whole café
export function totalIncome({ cats, upgrades, boost }, now) {
  const fromCats = cats.reduce((sum, cat) => sum + catIncome(cat), 0);
  const withCushions = fromCats * (1 + 0.25 * upgrades.cushions) + upgrades.menu;
  return withCushions * boostMultiplier(boost, now);
}

// ---------- achievements ----------

export const ACHIEVEMENTS = [
  { id: "first-pet", name: "First head scratch", hint: "Pet a cat", emoji: "🤲", check: (s) => s.stats.pets >= 1 },
  { id: "pets-100", name: "Professional petter", hint: "Pet cats 100 times", emoji: "🖐️", check: (s) => s.stats.pets >= 100 },
  { id: "pets-500", name: "Hand of the purr", hint: "Pet cats 500 times", emoji: "💞", check: (s) => s.stats.pets >= 500 },
  { id: "coins-1000", name: "Coin purr-se", hint: "Earn 1,000 coins", emoji: "👛", check: (s) => s.stats.earned >= 1000 },
  { id: "coins-10000", name: "Cat-pitalist", hint: "Earn 10,000 coins", emoji: "💰", check: (s) => s.stats.earned >= 10000 },
  { id: "cats-3", name: "Small colony", hint: "Have 3 cats", emoji: "🐾", check: (s) => s.cats.length >= 3 },
  { id: "cats-8", name: "Full house", hint: "Have 8 cats", emoji: "🏠", check: (s) => s.cats.length >= MAX_CATS },
  { id: "feeds-50", name: "Sushi chef", hint: "Feed cats 50 times", emoji: "🍱", check: (s) => s.stats.feeds >= 50 },
  { id: "level-5", name: "Best friends", hint: "Get a cat to level 5", emoji: "🌟", check: (s) => s.cats.some((c) => c.level >= 5) },
  { id: "decor-all", name: "Interior de-meow-rator", hint: "Buy every decoration", emoji: "🛋️", check: (s) => s.decor.length === DECOR.length },
  { id: "style", name: "Fashion week", hint: "Dress up a cat", emoji: "🎀", check: (s) => s.cats.some((c) => c.accessory) },
  { id: "events-5", name: "Never a dull day", hint: "Live through 5 café events", emoji: "🎲", check: (s) => s.stats.events >= 5 },
];
