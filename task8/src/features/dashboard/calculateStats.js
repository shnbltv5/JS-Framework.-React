// Pure functions: quests in -> statistics out (moved here from pages/Dashboard.jsx)
import { REGIONS, STATUS_LABELS } from "../../constants.js";

function average(numbers) {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function countBy(quests, getKey, keys) {
  return keys.map((key) => ({
    key,
    count: quests.filter((q) => getKey(q) === key).length,
  }));
}

export function calculateStats(quests) {
  const completed = quests.filter((q) => q.status === "completed").length;

  return {
    total: quests.length,
    open: quests.filter((q) => q.status === "open").length,
    completionRate: quests.length ? Math.round((completed / quests.length) * 100) : 0,
    totalReward: quests.reduce((sum, q) => sum + q.reward, 0),
    avgReward: Math.round(average(quests.map((q) => q.reward))),
    avgDifficulty: average(quests.map((q) => q.difficulty)).toFixed(1),
    byStatus: countBy(quests, (q) => q.status, Object.keys(STATUS_LABELS)),
    byDifficulty: countBy(quests, (q) => q.difficulty, [1, 2, 3, 4, 5]),
    byRegion: countBy(quests, (q) => q.region, REGIONS).sort((a, b) => b.count - a.count),
    topRewards: [...quests].sort((a, b) => b.reward - a.reward).slice(0, 5),
  };
}
