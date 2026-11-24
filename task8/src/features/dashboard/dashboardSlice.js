// Dashboard slice: which quests are counted in the statistics and the loading state.
// The statistics themselves are NOT stored: they are calculated by a memoized selector.
import { createSlice } from "@reduxjs/toolkit";
import { fetchAllQuests } from "./dashboardThunks.js";
import { createQuest, updateQuestStatus } from "../quests/questsThunks.js";

const initialState = {
  ids: [], // ids of all quests; the objects are in state.quests.entities
  loaded: false, // true after the first successful load (old numbers stay visible while reloading)
  status: "idle",
  error: null,
  fetchedAt: null,
  requestId: null,
  version: 0, // +1 after a mutation -> the dashboard loads again
};

function markOutdated(state) {
  state.fetchedAt = null;
  state.version += 1;
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllQuests.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(fetchAllQuests.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return; // stale answer
        state.ids = action.payload.map((quest) => quest.id);
        state.loaded = true;
        state.status = "succeeded";
        state.fetchedAt = Date.now();
      })
      .addCase(fetchAllQuests.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        if (action.meta.aborted) {
          state.status = state.loaded ? "succeeded" : "idle";
          return;
        }
        state.status = "failed";
        state.error = action.payload ?? { message: action.error.message, kind: "error" };
      })
      // A new quest or a new status changes the statistics
      .addCase(createQuest.fulfilled, markOutdated)
      .addCase(updateQuestStatus.fulfilled, markOutdated);
  },
});

export default dashboardSlice.reducer;
