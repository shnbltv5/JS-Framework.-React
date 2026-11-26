# Whisker Café 🐾

A cozy idle game about running a café full of cats with big personalities.
Made with React for the "create something fun" assignment.

- **Play:** _add the Vercel link here_
- **Stack:** React 18, Redux Toolkit, React Router, Vite, plain CSS. All cats are drawn with SVG, all sounds are made with the Web Audio API (no image or sound files).

## How to play

- **Tap a cat** to pet it: hearts, a "meow" and coins. Every 15 pets a cat gains a level and earns more.
- **Feed** cats (5 coins a fish). Hungry cats get grumpy, grumpy cats earn less, starving cats almost stop working.
- The café earns coins **every second**. Happy, full cats earn ×1.5.
- **Shop:** adopt new cats (each one costs twice as much), buy upgrades, decorations that appear in the room, and accessories to dress cats up.
- **Random events** every minute or so: a food critic (×2 income), zoomies, a rainy rush, a gremlin breaking a cup, a kitten at the door.
- **Trophies:** 12 achievements and café statistics.
- The game is **saved** in the browser. When you come back, the night staff has earned some coins for you (up to 1 hour).
- Day and night: after 20:00 the window shows the moon and stars.

### Cat personalities

| | Personality | Rule |
| - | - | - |
| 😴 | Sleepy | Earns less, gets hungry twice as slowly, naps a lot |
| 💅 | Diva | Pets give double coins, gets bored fast |
| 😈 | Gremlin | Earns 50% more, sometimes pushes cups off the counter |
| 🧐 | Philosopher | Earns 20% more |
| 🍣 | Foodie | Always hungry, snacks make them very happy |
| 🥰 | Cuddle bug | Pets make them much happier |

## How it is built

```
src/
  store/index.js            Redux store + saving to localStorage
  features/cafe/
    cafeSlice.js            the whole game state and every rule (tick, pet, feed, adopt, buy, events…)
    cafeSelectors.js        income per second, average happiness, achievements (memoized)
    gameData.js             personalities, shop items, achievements, economy formulas
    catFactory.js           random cats and random events
    format.js               number formatting, which face a cat shows
  hooks/
    useGameLoop.js          one tick per second + random events
    useCatActions.js        pet / feed with sounds
    useSound.js             "meow" and coin sounds with the Web Audio API
  components/
    Cat.jsx                 the SVG cat: 7 furs, 5 patterns, 6 faces, 5 accessories
    Room.jsx                the café scene: window, decor, wandering cats, hearts
    Header, CatPanel, EventCard, AwayModal, Toasts, NeedBar, CoinIcon
  pages/                    Café, Shop (?tab=), Cats, Cat profile (/cats/:id), Trophies, 404
```

- **Redux** keeps the game: coins, cats, upgrades, events, achievements. Reducers have no randomness:
  random cats and events are created in `prepare` callbacks or hooks and passed in the action.
- **Local state** is used for things that only matter on screen: where cats walk, hearts after a pet,
  which cat is selected, the rename form.
- **URL**: the shop tab (`/shop?tab=decor`) and the cat profile (`/cats/3`).

## Run locally

```bash
npm install
npm run dev
```

## Deploy (Vercel)

Import the repository, set **Root Directory** to `fun-project`, framework **Vite**. No environment variables
are needed. `vercel.json` sends every path to `index.html`, so links like `/cats/2` work after a refresh.
