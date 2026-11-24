// Quests slice: every quest object, the loaded lists, details requests and mutations.
import { createSlice } from "@reduxjs/toolkit";
import { createQuest, fetchQuestById, fetchQuests, listKey, updateQuestStatus } from "./questsThunks.js";
import { fetchAllQuests } from "../dashboard/dashboardThunks.js";

const MAX_SAVED_LISTS = 20;

const initialState = {
  // The ONLY place where quest objects are stored: id -> quest.
  // Lists and the dashboard keep only ids, so a quest is never duplicated:
  // after a status change it is updated here once and every page shows the new status.
  entities: {},
  loadedAt: {}, // id -> time the quest was last loaded (used by fetchQuestById.condition)

  // Loaded lists by key (search + filters + sort + page):
  // { ids, total, totalPages, page, status, error, fetchedAt, requestId }
  lists: {},
  listsVersion: 0, // +1 when lists become outdated after a mutation -> the list page loads again

  details: {}, // id -> { status, error, requestId } of the details request

  create: { status: "idle", error: null }, // "Post a quest" form
  statusUpdate: { id: null, status: "idle", error: null }, // Accept / Complete / Abandon / Reopen
};

function saveQuests(state, quests) {
  const now = Date.now();
  for (const quest of quests) {
    state.entities[quest.id] = quest;
    state.loadedAt[quest.id] = now;
  }
}

// After a mutation the saved lists may be wrong (new quest, other status filter results)
function markListsOutdated(state) {
  state.lists = {};
  state.listsVersion += 1;
}

// Keep only the newest lists, so the store does not grow forever
function removeOldLists(state) {
  const keys = Object.keys(state.lists);
  if (keys.length <= MAX_SAVED_LISTS) return;
  keys
    .sort((a, b) => (state.lists[a].fetchedAt ?? 0) - (state.lists[b].fetchedAt ?? 0))
    .slice(0, keys.length - MAX_SAVED_LISTS)
    .forEach((key) => delete state.lists[key]);
}

const questsSlice = createSlice({
  name: "quests",
  initialState,
  // Normal (synchronous) actions
  reducers: {
    resetCreateStatus(state) {
      state.create = { status: "idle", error: null };
    },
    resetStatusUpdate(state) {
      state.statusUpdate = { id: null, status: "idle", error: null };
    },
  },
  // Actions created by thunks (and by thunks of other slices)
  extraReducers: (builder) => {
    builder
      // ----- 1. list -----
      .addCase(fetchQuests.pending, (state, action) => {
        const key = listKey(action.meta.arg.params);
        const old = state.lists[key];
        state.lists[key] = {
          ids: old?.ids ?? [],
          total: old?.total ?? 0,
          totalPages: old?.totalPages ?? 1,
          page: old?.page ?? 1,
          fetchedAt: old?.fetchedAt ?? null,
          status: "loading",
          error: null,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchQuests.fulfilled, (state, action) => {
        const list = state.lists[listKey(action.meta.arg.params)];
        // Stale request: a newer request for this list was started -> ignore this answer
        if (!list || list.requestId !== action.meta.requestId) return;
        const { items, total, totalPages, page } = action.payload;
        saveQuests(state, items);
        Object.assign(list, {
          ids: items.map((quest) => quest.id),
          total,
          totalPages,
          page,
          status: "succeeded",
          fetchedAt: Date.now(),
        });
        removeOldLists(state);
      })
      .addCase(fetchQuests.rejected, (state, action) => {
        const key = listKey(action.meta.arg.params);
        const list = state.lists[key];
        if (!list || list.requestId !== action.meta.requestId) return;
        // Cancelled (the user changed filters or left the page) is not an error
        if (action.meta.aborted) {
          delete state.lists[key];
          return;
        }
        list.status = "failed";
        list.error = action.payload ?? { message: action.error.message, kind: "error" };
      })

      // ----- 2. details -----
      .addCase(fetchQuestById.pending, (state, action) => {
        state.details[action.meta.arg.id] = { status: "loading", error: null, requestId: action.meta.requestId };
      })
      .addCase(fetchQuestById.fulfilled, (state, action) => {
        const details = state.details[action.meta.arg.id];
        if (details?.requestId !== action.meta.requestId) return;
        saveQuests(state, [action.payload]);
        details.status = "succeeded";
      })
      .addCase(fetchQuestById.rejected, (state, action) => {
        const details = state.details[action.meta.arg.id];
        if (details?.requestId !== action.meta.requestId) return;
        if (action.meta.aborted) {
          delete state.details[action.meta.arg.id];
          return;
        }
        details.status = "failed";
        details.error = action.payload ?? { message: action.error.message, kind: "error" };
      })

      // ----- all quests for the dashboard (thunk of the dashboard slice) -----
      .addCase(fetchAllQuests.fulfilled, (state, action) => {
        saveQuests(state, action.payload);
      })

      // ----- 3. create -----
      .addCase(createQuest.pending, (state) => {
        state.create = { status: "loading", error: null };
      })
      .addCase(createQuest.fulfilled, (state, action) => {
        state.create = { status: "succeeded", error: null };
        saveQuests(state, [action.payload]);
        markListsOutdated(state);
      })
      .addCase(createQuest.rejected, (state, action) => {
        state.create = { status: "failed", error: action.payload ?? { message: action.error.message } };
      })

      // ----- 4. status change -----
      .addCase(updateQuestStatus.pending, (state, action) => {
        state.statusUpdate = { id: action.meta.arg.id, status: "loading", error: null };
      })
      .addCase(updateQuestStatus.fulfilled, (state, action) => {
        state.statusUpdate = { id: action.meta.arg.id, status: "succeeded", error: null };
        saveQuests(state, [action.payload]);
        markListsOutdated(state);
      })
      .addCase(updateQuestStatus.rejected, (state, action) => {
        state.statusUpdate = {
          id: action.meta.arg.id,
          status: "failed",
          error: action.payload ?? { message: action.error.message },
        };
      });
  },
});

export const { resetCreateStatus, resetStatusUpdate } = questsSlice.actions;
export default questsSlice.reducer;
