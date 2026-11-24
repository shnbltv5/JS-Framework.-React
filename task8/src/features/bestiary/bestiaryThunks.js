// Monsters from the public D&D 5e API. The service worker caches these requests
// (network-first), the thunks only pass on whether the answer came from that cache.
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../../services/bestiaryApi.js";
import { toErrorPayload } from "../shared.js";

// The monster list and details never change on the server. A second request is needed only
// if we have nothing yet, or we have an offline copy (fromCache) and may be online now.
function needsLoading(saved) {
  return !(saved?.status === "succeeded" && !saved.fromCache);
}

// 6. LIST of all 334 monsters
export const fetchMonsters = createAsyncThunk(
  "bestiary/fetchList",
  async (_arg, { signal, rejectWithValue }) => {
    try {
      const { data, fromCache, cachedAt } = await api.fetchMonsters({ signal });
      return { items: data.results, fromCache, cachedAt };
    } catch (error) {
      return rejectWithValue(toErrorPayload(error));
    }
  },
  {
    condition: (arg, { getState }) => Boolean(arg?.force) || needsLoading(getState().bestiary.list),
  },
);

// 7. DETAILS of one monster by its index ("adult-red-dragon")
export const fetchMonster = createAsyncThunk(
  "bestiary/fetchOne",
  async ({ index }, { signal, rejectWithValue }) => {
    try {
      return await api.fetchMonster(index, { signal }); // { data, fromCache, cachedAt }
    } catch (error) {
      return rejectWithValue(toErrorPayload(error));
    }
  },
  {
    condition: ({ index, force }, { getState }) => Boolean(force) || needsLoading(getState().bestiary.details[index]),
  },
);
