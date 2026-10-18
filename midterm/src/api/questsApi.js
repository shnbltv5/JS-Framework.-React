import seed from "../data/quests.json";
import { STATUS_LABELS, REGIONS } from "../constants.js";

// Simulated API: Promises + random delay + JSON seed data + localStorage.
const STORAGE_KEY = "guild-quest-board:quests:v1";

function delay(signal) {
  const ms = 300 + Math.random() * 600; // random latency makes race conditions real
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Request aborted", "AbortError"));
      return;
    }
    function onAbort() {
      clearTimeout(timer);
      reject(new DOMException("Request aborted", "AbortError"));
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function readAll() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return [...seed];
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Saved quest data is corrupted. Clear this site's storage and reload.");
  }
}

function writeAll(quests) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quests));
}

const SORTERS = {
  newest: (a, b) => b.id - a.id,
  rewardDesc: (a, b) => b.reward - a.reward || a.id - b.id,
  rewardAsc: (a, b) => a.reward - b.reward || a.id - b.id,
  difficultyDesc: (a, b) => b.difficulty - a.difficulty || a.id - b.id,
  difficultyAsc: (a, b) => a.difficulty - b.difficulty || a.id - b.id,
  title: (a, b) => a.title.localeCompare(b.title) || a.id - b.id,
};

// Search + filter + sort + pagination happen "on the server"
export async function getQuests(
  { search, region, difficulty, status, sort, page, pageSize },
  { signal } = {}
) {
  await delay(signal);
  const query = search.trim().toLowerCase();

  const filtered = readAll()
    .filter((q) => !query || q.title.toLowerCase().includes(query) || q.description.toLowerCase().includes(query))
    .filter((q) => region === "all" || q.region === region)
    .filter((q) => difficulty === "all" || q.difficulty === Number(difficulty))
    .filter((q) => status === "all" || q.status === status)
    .sort(SORTERS[sort] ?? SORTERS.newest);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    totalPages,
    page: currentPage,
  };
}

export async function getQuest(id, { signal } = {}) {
  await delay(signal);
  const quest = readAll().find((q) => q.id === id);
  if (!quest) throw new Error(`Quest #${id} was not found.`);
  return quest;
}

export async function createQuest(data, { signal } = {}) {
  await delay(signal);
  const quests = readAll();
  const title = data.title.trim();

  if (quests.some((q) => q.title.toLowerCase() === title.toLowerCase())) {
    throw new Error("A quest with this title already exists.");
  }
  if (!REGIONS.includes(data.region)) {
    throw new Error("Unknown region.");
  }

  const quest = {
    id: Math.max(0, ...quests.map((q) => q.id)) + 1,
    title,
    region: data.region,
    difficulty: Number(data.difficulty),
    reward: Number(data.reward),
    status: "open",
    durationDays: Number(data.durationDays),
    giver: data.giver.trim(),
    description: data.description.trim(),
    createdAt: new Date().toISOString(),
  };
  writeAll([...quests, quest]);
  return quest;
}

export async function updateQuestStatus(id, status, { signal } = {}) {
  await delay(signal);
  if (!STATUS_LABELS[status]) throw new Error("Unknown status.");
  const quests = readAll();
  const index = quests.findIndex((q) => q.id === id);
  if (index === -1) throw new Error(`Quest #${id} was not found.`);
  const updated = { ...quests[index], status };
  writeAll(quests.map((q) => (q.id === id ? updated : q)));
  return updated;
}
