import { createSelector } from "@reduxjs/toolkit";

const IDLE = { data: null, status: "idle", error: null, fromCache: false, cachedAt: null, loadedAt: null };

export const selectMonsterList = (state) => state.bestiary.list;

export const selectMonster = (state, index) => state.bestiary.details[index] ?? IDLE;

// Search by name over all 334 monsters (memoized: filters again only when the list or the text changes)
export const selectFilteredMonsters = createSelector(
  [(state) => state.bestiary.list.items, (state, search) => search.trim().toLowerCase()],
  (monsters, query) => (query ? monsters.filter((m) => m.name.toLowerCase().includes(query)) : monsters),
);
