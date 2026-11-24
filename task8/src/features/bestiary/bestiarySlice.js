// Bestiary slice: the monster list and every opened monster, with "fromCache" info for the UI.
import { createSlice } from "@reduxjs/toolkit";
import { fetchMonster, fetchMonsters } from "./bestiaryThunks.js";

const initialState = {
  // fromCache / cachedAt: the answer came from the service worker cache (offline copy)
  // loadedAt: when Redux received it
  list: { items: [], status: "idle", error: null, fromCache: false, cachedAt: null, loadedAt: null, requestId: null },
  details: {}, // index -> { data, status, error, fromCache, cachedAt, loadedAt, requestId }
};

const bestiarySlice = createSlice({
  name: "bestiary",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonsters.pending, (state, action) => {
        // Old items stay: an offline copy is still shown while we try the network again
        state.list.status = state.list.items.length ? "succeeded" : "loading";
        state.list.error = null;
        state.list.requestId = action.meta.requestId;
      })
      .addCase(fetchMonsters.fulfilled, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return; // stale answer
        Object.assign(state.list, action.payload, { status: "succeeded", loadedAt: Date.now() });
      })
      .addCase(fetchMonsters.rejected, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;
        if (action.meta.aborted) {
          state.list.status = state.list.items.length ? "succeeded" : "idle";
          return;
        }
        // Still offline but we have a saved copy: keep showing it
        if (state.list.items.length) {
          state.list.status = "succeeded";
          return;
        }
        state.list.status = "failed";
        state.list.error = action.payload ?? { message: action.error.message, kind: "error" };
      })

      .addCase(fetchMonster.pending, (state, action) => {
        const { index } = action.meta.arg;
        const saved = state.details[index];
        state.details[index] = {
          data: saved?.data ?? null,
          fromCache: saved?.fromCache ?? false,
          cachedAt: saved?.cachedAt ?? null,
          loadedAt: saved?.loadedAt ?? null,
          status: saved?.data ? "succeeded" : "loading",
          error: null,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchMonster.fulfilled, (state, action) => {
        const monster = state.details[action.meta.arg.index];
        if (monster?.requestId !== action.meta.requestId) return;
        Object.assign(monster, action.payload, { status: "succeeded", loadedAt: Date.now() });
      })
      .addCase(fetchMonster.rejected, (state, action) => {
        const monster = state.details[action.meta.arg.index];
        if (monster?.requestId !== action.meta.requestId) return;
        if (monster.data) {
          monster.status = "succeeded"; // keep the saved copy
          return;
        }
        if (action.meta.aborted) {
          delete state.details[action.meta.arg.index];
          return;
        }
        monster.status = "failed";
        monster.error = action.payload ?? { message: action.error.message, kind: "error" };
      });
  },
});

export default bestiarySlice.reducer;
