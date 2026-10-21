// Key under which the fake "database" is stored in localStorage.
export const DATA_KEY = "task4-quest-board-data";

// Network simulation: every request waits a random time between
// minDelay and maxDelay (ms), and fails with probability errorChance.
export const API_CONFIG = {
  minDelay: 500,
  maxDelay: 3000,
  errorChance: 0.05,
};
