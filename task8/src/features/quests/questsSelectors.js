// Selectors: functions that read data from the store.
// Components never read state.quests.* directly, they use these functions.
import { createSelector } from "@reduxjs/toolkit";

const EMPTY_LIST = { ids: [], total: 0, totalPages: 1, page: 1, status: "idle", error: null };
const IDLE = { status: "idle", error: null };

// ---- simple selectors ----

export const selectQuestEntities = (state) => state.quests.entities;

export const selectQuestById = (state, id) => state.quests.entities[id] ?? null;

export const selectListState = (state, key) => state.quests.lists[key] ?? EMPTY_LIST;

export const selectListsVersion = (state) => state.quests.listsVersion;

export const selectDetailsState = (state, id) => state.quests.details[id] ?? IDLE;

export const selectCreateState = (state) => state.quests.create;

export const selectStatusUpdate = (state) => state.quests.statusUpdate;

// ---- memoized selector (createSelector) ----

// The list keeps only ids -> turn them into quest objects.
// Memoized: the same array is returned until the ids or the quests change,
// so QuestList does not re-render for nothing.
export const selectVisibleQuests = createSelector(
  [selectQuestEntities, (state, key) => selectListState(state, key).ids],
  (entities, ids) => ids.map((id) => entities[id]).filter(Boolean),
);
