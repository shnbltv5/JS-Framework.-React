// A fake asynchronous backend. Every function returns a Promise that settles
// after a random delay and sometimes rejects with a "server error".
// The data lives in localStorage; ONLY this file touches localStorage —
// React components never do.
import { DATA_KEY, API_CONFIG } from "./settings.js";
import { initialData } from "./initialData.js";

// Wraps an operation in a Promise with a random delay and a random failure.
// The operation itself runs when the delay is over, i.e. at the moment the
// "server" processes the request.
function fakeRequest(operation) {
  const { minDelay, maxDelay, errorChance } = API_CONFIG;
  const delay = minDelay + Math.random() * (maxDelay - minDelay);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < errorChance) {
        reject(new Error("Server error. Please try again."));
        return;
      }
      try {
        resolve(operation());
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}

function readData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // broken JSON in storage -> fall through and re-seed
  }
  writeData(initialData);
  return initialData;
}

function writeData(items) {
  localStorage.setItem(DATA_KEY, JSON.stringify(items));
}

// The list endpoint returns a SHORT version of every item.
// The full item (all fields) is only available through getItem(id).
function toSummary(item) {
  return {
    id: item.id,
    title: item.title,
    hero: item.hero,
    difficulty: item.difficulty,
    status: item.status,
  };
}

// GET /quests
export function getItemsList() {
  return fakeRequest(() => {
    const items = readData();
    return { data: items.map(toSummary), total: items.length };
  });
}

// GET /quests/:id
export function getItem(id) {
  return fakeRequest(() => {
    const item = readData().find((entry) => entry.id === id);
    if (!item) {
      throw new Error("Quest not found.");
    }
    return item;
  });
}

// POST /quests
export function createItem(data) {
  return fakeRequest(() => {
    const items = readData();
    const nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const newItem = {
      id: nextId,
      title: data.title,
      hero: data.hero,
      difficulty: data.difficulty,
      reward: data.reward,
      status: "Active",
      location: data.location,
      deadline: data.deadline,
      description: data.description,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    writeData([...items, newItem]);
    return newItem;
  });
}

// PATCH /quests/:id — merges `changes` into the stored item
export function updateItem(id, changes) {
  return fakeRequest(() => {
    const items = readData();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error("Quest not found.");
    }
    const updated = { ...items[index], ...changes, id: items[index].id };
    const nextItems = [...items];
    nextItems[index] = updated;
    writeData(nextItems);
    return updated;
  });
}

// DELETE /quests/:id
export function deleteItem(id) {
  return fakeRequest(() => {
    const items = readData();
    if (!items.some((item) => item.id === id)) {
      throw new Error("Quest not found.");
    }
    writeData(items.filter((item) => item.id !== id));
    return { success: true, id };
  });
}
