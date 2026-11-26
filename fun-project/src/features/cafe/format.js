import { moodOf } from "./gameData.js";

export function formatCoins(value) {
  return Math.floor(value).toLocaleString("en-US");
}

export function formatRate(value) {
  return value < 10 ? value.toFixed(1) : Math.round(value).toLocaleString("en-US");
}

// What the cat's face shows. Cats take naps now and then (sleepy cats more often).
export function faceOf(cat, now) {
  const mood = moodOf(cat);
  if (mood === "starving" || mood === "hungry") return "hungry";
  const napCycle = cat.personality === "sleepy" ? 3 : 7;
  if (Math.floor(now / 15000 + cat.id * 5) % napCycle === 0) return "sleeping";
  return mood === "okay" ? "okay" : mood;
}

export const MOOD_TEXT = {
  happy: "Purring",
  okay: "Content",
  grumpy: "Grumpy",
  hungry: "Hungry",
  starving: "Starving",
};
