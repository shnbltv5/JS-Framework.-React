import { createSelector } from "@reduxjs/toolkit";
import { ACHIEVEMENTS, MAX_CATS, adoptPrice, totalIncome } from "./gameData.js";

export const selectCafe = (state) => state.cafe;
export const selectCoins = (state) => state.cafe.coins;
export const selectCats = (state) => state.cafe.cats;
export const selectCatById = (state, id) => state.cafe.cats.find((cat) => cat.id === Number(id)) ?? null;
export const selectEvent = (state) => state.cafe.event;
export const selectBoost = (state) => state.cafe.boost;
export const selectNotifications = (state) => state.cafe.notifications;
export const selectMuted = (state) => state.cafe.muted;

// Coins per second (memoized: calculated again only when cats, upgrades or the boost change)
export const selectIncome = createSelector(
  [selectCats, (state) => state.cafe.upgrades, selectBoost],
  (cats, upgrades, boost) => totalIncome({ cats, upgrades, boost }, Date.now()),
);

// Average happiness of all cats, 0–100 (memoized)
export const selectAverageHappiness = createSelector([selectCats], (cats) =>
  cats.length ? Math.round(cats.reduce((sum, cat) => sum + cat.happiness, 0) / cats.length) : 0,
);

export const selectAdoption = createSelector([selectCats, selectCoins], (cats, coins) => {
  const price = adoptPrice(cats.length);
  return { price, isFull: cats.length >= MAX_CATS, canAfford: coins >= price };
});

// Achievements with an "unlocked" flag (memoized)
export const selectAchievementList = createSelector([(state) => state.cafe.achievements], (unlocked) =>
  ACHIEVEMENTS.map((a) => ({ ...a, unlocked: unlocked.includes(a.id) })),
);
