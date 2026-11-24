import { createSelector } from "@reduxjs/toolkit";
import { selectQuestEntities } from "../quests/questsSelectors.js";
import { calculateStats } from "./calculateStats.js";

export const selectDashboard = (state) => state.dashboard;

// ids -> quest objects (memoized)
export const selectDashboardQuests = createSelector(
  [selectQuestEntities, (state) => state.dashboard.ids],
  (entities, ids) => ids.map((id) => entities[id]).filter(Boolean),
);

// Statistics for one region ("all" = every region).
// Memoized: calculateStats (many filter / reduce / sort calls) runs again
// only when the quests or the region change, not on every render.
export const selectDashboardStats = createSelector(
  [selectDashboardQuests, (state, region) => region],
  (quests, region) => calculateStats(region === "all" ? quests : quests.filter((q) => q.region === region)),
);
