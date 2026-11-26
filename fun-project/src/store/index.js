// The Redux store. The game is saved in localStorage, so it continues after a reload.
import { configureStore } from "@reduxjs/toolkit";
import cafeReducer, { createInitialState } from "../features/cafe/cafeSlice.js";

const SAVE_KEY = "whisker-cafe:save:v1";

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved) return undefined;
    // Fields added in a newer version get their default value
    return { cafe: { ...createInitialState(), ...saved, event: null, notifications: [] } };
  } catch {
    return undefined; // broken save -> new game
  }
}

export const store = configureStore({
  reducer: { cafe: cafeReducer },
  preloadedState: loadGame(),
});

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(store.getState().cafe));
  } catch {
    // storage is full or blocked: the game still works, it just isn't saved
  }
}

// Save at most once per second (the game changes every second anyway)
let saveTimer = null;
store.subscribe(() => {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveGame();
  }, 1000);
});

// ...and right away when the tab is closed or reloaded, so the last second is not lost
window.addEventListener("pagehide", saveGame);
