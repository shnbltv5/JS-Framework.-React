// The Redux store: one object with the state of the whole app, split into feature slices.
import { configureStore } from "@reduxjs/toolkit";
import questsReducer from "../features/quests/questsSlice.js";
import dashboardReducer from "../features/dashboard/dashboardSlice.js";
import bestiaryReducer from "../features/bestiary/bestiarySlice.js";

// configureStore adds redux-thunk (for createAsyncThunk), Redux DevTools
// and checks for mutations / non-serializable values in development.
export const store = configureStore({
  reducer: {
    quests: questsReducer, // state.quests
    dashboard: dashboardReducer, // state.dashboard
    bestiary: bestiaryReducer, // state.bestiary
  },
});
