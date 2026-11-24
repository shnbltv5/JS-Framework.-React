// Async operations for quests. Each thunk calls the API service (services/service.js)
// and Redux automatically dispatches three actions: pending -> fulfilled or rejected.
// The slices react to these actions in extraReducers.
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../../services/service.js";
import { isFresh, toErrorPayload } from "../shared.js";

// One list = one combination of search, filters, sort and page.
// The same parameters give the same key, so the result can be reused.
export function listKey(params) {
  return JSON.stringify(params);
}

// 1. LIST: one page of quests for the given search / filters / sort / page
export const fetchQuests = createAsyncThunk(
  "quests/fetchList",
  async ({ params }, { signal, rejectWithValue }) => {
    try {
      return await api.getQuests(params, { signal });
    } catch (error) {
      return rejectWithValue(toErrorPayload(error));
    }
  },
  {
    // condition runs before the request. false = no request at all (no actions either):
    // this exact list was loaded less than a minute ago and nothing has changed since.
    condition: ({ params, force }, { getState }) => {
      if (force) return true;
      const list = getState().quests.lists[listKey(params)];
      return !(list?.status === "succeeded" && isFresh(list.fetchedAt));
    },
  },
);

// 2. DETAILS: one quest by id (the id comes from the URL, so it is a string)
export const fetchQuestById = createAsyncThunk(
  "quests/fetchById",
  async ({ id }, { signal, rejectWithValue }) => {
    try {
      return await api.getQuest(id, { signal });
    } catch (error) {
      return rejectWithValue(toErrorPayload(error));
    }
  },
  {
    // The quest is already in the store (from the list or the dashboard) and is fresh:
    // the details page opens at once, without a request.
    condition: ({ id, force }, { getState }) => {
      if (force) return true;
      const { entities, loadedAt } = getState().quests;
      return !(entities[id] && isFresh(loadedAt[id]));
    },
  },
);

// 3. MUTATION: post a new quest
export const createQuest = createAsyncThunk("quests/create", async (data, { rejectWithValue }) => {
  try {
    return await api.createQuest(data);
  } catch (error) {
    return rejectWithValue(toErrorPayload(error));
  }
});

// 4. BUSINESS OPERATION: change the status (accept, complete, abandon, reopen)
export const updateQuestStatus = createAsyncThunk(
  "quests/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await api.updateQuestStatus(id, status);
    } catch (error) {
      return rejectWithValue(toErrorPayload(error));
    }
  },
);
