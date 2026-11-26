// The whole game state and all its rules. Every button in the game dispatches one of these actions.
import { createSlice } from "@reduxjs/toolkit";
import {
  ACCESSORIES,
  ACHIEVEMENTS,
  DECOR,
  DECOR_CALM,
  FEED_COST,
  MAX_CATS,
  PERSONALITIES,
  REROLL_COST,
  UPGRADES,
  adoptPrice,
  levelFromPets,
  petValue,
  totalIncome,
} from "./gameData.js";
import { STARTER_CAT, randomCandidate, randomCandidates } from "./catFactory.js";

function newCat(candidate, id, now) {
  return {
    id,
    name: candidate.name,
    personality: candidate.personality,
    fur: candidate.fur,
    pattern: candidate.pattern,
    eyes: candidate.eyes,
    accessory: null,
    fullness: 80, // 0 = starving, 100 = full
    happiness: 80, // 0 = grumpy, 100 = purring
    pets: 0,
    level: 1,
    adoptedAt: now,
  };
}

export function createInitialState(now = Date.now()) {
  return {
    coins: 30,
    cats: [newCat(STARTER_CAT, 1, now)],
    nextCatId: 2,
    candidates: randomCandidates(),
    upgrades: { cushions: 0, laser: 0, menu: 0, feeder: 0 },
    decor: [],
    accessories: [],
    boost: null, // { kind: "critic" | "rain", until }
    event: null, // the event card shown over the café
    stats: { earned: 0, pets: 0, feeds: 0, adopted: 1, events: 0, startedAt: now },
    achievements: [],
    notifications: [], // small messages in the corner: { id, text, emoji }
    nextNotificationId: 1,
    muted: false,
    lastSeen: now,
  };
}

const clamp = (value) => Math.max(0, Math.min(100, value));

function notify(state, emoji, text) {
  state.notifications.push({ id: state.nextNotificationId, emoji, text });
  state.nextNotificationId += 1;
  if (state.notifications.length > 3) state.notifications.shift();
}

function earn(state, amount) {
  state.coins += amount;
  state.stats.earned += amount;
}

// After every action: is there a new achievement?
function checkAchievements(state) {
  for (const achievement of ACHIEVEMENTS) {
    if (!state.achievements.includes(achievement.id) && achievement.check(state)) {
      state.achievements.push(achievement.id);
      notify(state, achievement.emoji, `Achievement: ${achievement.name}`);
    }
  }
}

function feedCatNow(state, cat) {
  const personality = PERSONALITIES[cat.personality];
  state.coins -= FEED_COST;
  cat.fullness = clamp(cat.fullness + 45);
  cat.happiness = clamp(cat.happiness + personality.feedJoy);
  state.stats.feeds += 1;
}

function addCat(state, candidate, now) {
  state.cats.push(newCat(candidate, state.nextCatId, now));
  state.nextCatId += 1;
  state.stats.adopted += 1;
}

const cafeSlice = createSlice({
  name: "cafe",
  initialState: createInitialState,
  reducers: {
    // Every second: cats get hungry, moods change, the café earns coins
    tick: {
      reducer(state, action) {
        const { seconds, now } = action.payload;
        const calm = 1 - DECOR_CALM * state.decor.length;

        for (const cat of state.cats) {
          const personality = PERSONALITIES[cat.personality];
          cat.fullness = clamp(cat.fullness - 0.22 * personality.hungerRate * seconds);
          // A hungry cat gets grumpy faster
          const hungerSadness = cat.fullness < 30 ? 2 : 1;
          cat.happiness = clamp(cat.happiness - 0.18 * personality.moodRate * calm * hungerSadness * seconds);

          if (state.upgrades.feeder && cat.fullness < 30 && state.coins >= FEED_COST) {
            feedCatNow(state, cat);
          }
        }

        if (state.boost && now > state.boost.until) state.boost = null;

        earn(state, totalIncome(state, now) * seconds);
        state.lastSeen = now;
        checkAchievements(state);
      },
      prepare(seconds = 1) {
        return { payload: { seconds, now: Date.now() } };
      },
    },

    petCat(state, action) {
      const cat = state.cats.find((c) => c.id === action.payload);
      if (!cat) return;
      const personality = PERSONALITIES[cat.personality];
      earn(state, petValue(cat, state.upgrades));
      cat.happiness = clamp(cat.happiness + personality.petJoy);
      cat.pets += 1;
      state.stats.pets += 1;

      const level = levelFromPets(cat.pets);
      if (level > cat.level) {
        cat.level = level;
        notify(state, "⭐", `${cat.name} reached level ${level}!`);
      }
      checkAchievements(state);
    },

    feedCat(state, action) {
      const cat = state.cats.find((c) => c.id === action.payload);
      if (!cat) return;
      if (cat.fullness >= 90) {
        notify(state, "🙅", `${cat.name} is full and ignores the fish.`);
        return;
      }
      if (state.coins < FEED_COST) {
        notify(state, "🪙", `A fish costs ${FEED_COST} coins.`);
        return;
      }
      feedCatNow(state, cat);
      checkAchievements(state);
    },

    adoptCat: {
      reducer(state, action) {
        const { index, replacement, now } = action.payload;
        const price = adoptPrice(state.cats.length);
        const candidate = state.candidates[index];
        if (!candidate || state.cats.length >= MAX_CATS || state.coins < price) return;
        state.coins -= price;
        addCat(state, candidate, now);
        state.candidates[index] = replacement;
        notify(state, "🏡", `${candidate.name} moved into the café!`);
        checkAchievements(state);
      },
      // prepare runs before the reducer: the random new candidate is made here
      prepare(index) {
        return { payload: { index, replacement: randomCandidate(), now: Date.now() } };
      },
    },

    rerollCandidates: {
      reducer(state, action) {
        if (state.coins < REROLL_COST) return;
        state.coins -= REROLL_COST;
        state.candidates = action.payload;
      },
      prepare() {
        return { payload: randomCandidates() };
      },
    },

    buyUpgrade(state, action) {
      const upgrade = UPGRADES.find((u) => u.id === action.payload);
      const level = state.upgrades[upgrade.id];
      const price = upgrade.price(level);
      if (level >= upgrade.maxLevel || state.coins < price) return;
      state.coins -= price;
      state.upgrades[upgrade.id] = level + 1;
      notify(state, upgrade.emoji, `${upgrade.name} — level ${level + 1}`);
    },

    buyDecor(state, action) {
      const item = DECOR.find((d) => d.id === action.payload);
      if (!item || state.decor.includes(item.id) || state.coins < item.price) return;
      state.coins -= item.price;
      state.decor.push(item.id);
      notify(state, item.emoji, `${item.name} is in the café now`);
      checkAchievements(state);
    },

    buyAccessory(state, action) {
      const item = ACCESSORIES.find((a) => a.id === action.payload);
      if (!item || state.accessories.includes(item.id) || state.coins < item.price) return;
      state.coins -= item.price;
      state.accessories.push(item.id);
      notify(state, item.emoji, `${item.name} bought. Put it on a cat in their profile!`);
    },

    wearAccessory(state, action) {
      const { catId, accessoryId } = action.payload;
      const cat = state.cats.find((c) => c.id === catId);
      if (!cat) return;
      if (accessoryId && !state.accessories.includes(accessoryId)) return;
      // One accessory can be worn by one cat at a time
      for (const other of state.cats) {
        if (other.accessory === accessoryId) other.accessory = null;
      }
      cat.accessory = accessoryId;
      checkAchievements(state);
    },

    renameCat(state, action) {
      const cat = state.cats.find((c) => c.id === action.payload.id);
      if (cat) cat.name = action.payload.name;
    },

    // ----- café events -----

    startEvent(state, action) {
      if (state.event) return;
      state.event = action.payload;
    },

    resolveEvent: {
      reducer(state, action) {
        const { choice, now } = action.payload;
        const event = state.event;
        if (!event) return;

        if (event.kind === "critic") state.boost = { kind: "critic", until: now + 30_000 };
        if (event.kind === "rain") state.boost = { kind: "rain", until: now + 40_000 };
        if (event.kind === "zoomies") {
          for (const cat of state.cats) cat.happiness = clamp(cat.happiness + 20);
        }
        if (event.kind === "cup") state.coins -= Math.min(state.coins, 15);
        if (event.kind === "kitten") {
          if (choice === "adopt" && state.cats.length < MAX_CATS) {
            addCat(state, event.kitten, now);
            notify(state, "🐣", `${event.kitten.name} is part of the family!`);
          } else {
            for (const cat of state.cats) cat.happiness = clamp(cat.happiness + 5);
          }
        }

        state.event = null;
        state.stats.events += 1;
        checkAchievements(state);
      },
      prepare(choice = "ok") {
        return { payload: { choice, now: Date.now() } };
      },
    },

    // ----- other -----

    collectAwayCoins(state, action) {
      earn(state, action.payload);
    },

    dismissNotification(state, action) {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },

    toggleMute(state) {
      state.muted = !state.muted;
    },

    resetGame: {
      reducer(state, action) {
        return { ...createInitialState(action.payload.now), candidates: action.payload.candidates };
      },
      prepare() {
        return { payload: { now: Date.now(), candidates: randomCandidates() } };
      },
    },
  },
});

export const {
  tick,
  petCat,
  feedCat,
  adoptCat,
  rerollCandidates,
  buyUpgrade,
  buyDecor,
  buyAccessory,
  wearAccessory,
  renameCat,
  startEvent,
  resolveEvent,
  collectAwayCoins,
  dismissNotification,
  toggleMute,
  resetGame,
} = cafeSlice.actions;

export default cafeSlice.reducer;
