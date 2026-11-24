import { createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../../services/service.js";
import { isFresh, toErrorPayload } from "../shared.js";

// 5. ALL QUESTS for the dashboard statistics.
// The quest objects are saved by the quests slice, the dashboard keeps only their ids.
export const fetchAllQuests = createAsyncThunk(
  "dashboard/fetchAllQuests",
  async (_arg, { signal, rejectWithValue }) => {
    try {
      return await api.getAllQuests({ signal });
    } catch (error) {
      return rejectWithValue(toErrorPayload(error));
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      const { status, fetchedAt } = getState().dashboard;
      return !(status === "succeeded" && isFresh(fetchedAt));
    },
  },
);
