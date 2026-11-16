// Quest data for the UI: the API from service.js + the cache from queryCache.js.
// Pages and components import from here, never from service.js directly.
import * as api from "./service.js";
import { cachedQuery, invalidateQueries } from "./queryCache.js";

export { NotFoundError } from "./service.js";

// Query keys: the first part names the resource, the rest are the parameters.
// Different parameters = different cache entries.
export const questKeys = {
  all: ["quests"],
  list: (params) => ["quests", "list", params],
  detail: (id) => ["quests", "detail", String(id)],
  everything: ["quests", "everything"],
};

// ---- reads (cached) ----

// One page of the list for given search / filters / sort / page
export function fetchQuests(params, { signal } = {}) {
  return cachedQuery(questKeys.list(params), () => api.getQuests(params), { signal });
}

// One quest by id (Quest details page)
export function fetchQuest(id, { signal } = {}) {
  return cachedQuery(questKeys.detail(id), () => api.getQuest(id), { signal });
}

// All quests (Dashboard statistics)
export function fetchAllQuests({ signal } = {}) {
  return cachedQuery(questKeys.everything, () => api.getAllQuests(), { signal });
}

// ---- writes (invalidate the cache) ----

// A new quest changes lists, totals and statistics -> clear every "quests" entry
export async function createQuest(data) {
  const quest = await api.createQuest(data);
  invalidateQueries(questKeys.all);
  return quest;
}

// A new status changes this quest, status filters and statistics -> clear every "quests" entry
export async function updateQuestStatus(id, status) {
  const quest = await api.updateQuestStatus(id, status);
  invalidateQueries(questKeys.all);
  return quest;
}
