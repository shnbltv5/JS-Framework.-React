# Whisker Café 🐾

A cozy idle game about running a café full of cats with big personalities.
Bonus Task "AI only project": the whole application was generated with AI (Claude).

- **Play:** https://js-framework-react-ujz8.vercel.app
- **Stack:** React 18, Redux Toolkit, React Router, Vite, plain CSS. All cats are drawn with SVG, all sounds are made with the Web Audio API (no image or sound files).

## Project idea

You own a tiny café where the staff are cats. Every cat is a sticker-style drawing with its own name, fur,
pattern and personality, and the personality changes the rules: a Diva gives double coins for pets but gets
bored fast, a Gremlin earns more but knocks cups off the counter, a Sleepy cat naps half the day.
You pet and feed the cats to keep them happy, because happy, well-fed cats earn more coins. With the coins you
adopt more cats, buy upgrades, decorate the room and dress the cats up. Random café events (a food critic,
zoomies, a rainy rush, a kitten at the door) keep every visit different, and the café keeps earning a little
while you are away.

## My exact prompt

The app was made in a conversation with Claude. My first message (in Russian; only typos and punctuation were fixed):

> Нам преподаватель сказала: «Create something fun in React». Например, одному парню она предложила сделать
> что-то в стиле киберпанк в цветах Пикачу, а остальным — тоже придумать что-то необычное и весёлое.
> Логику сайта тоже нужно придумать самим: любую, главное — весёлую. И ещё нужно сделать деплой.
> Давай сделаем! У меня особо нет идей, но я хочу выполнить это задание. Может, что-то про кошек — я люблю
> кошек. Или что-то другое, но по-настоящему весёлое и визуально красивое. Давай сделаем!

Claude then asked three questions and I chose:

- Concept: **Кошачье кафе-игра** (cat café game)
- Visual style: **Пастельный kawaii** (pastel kawaii)
- Folder name: **fun-project**

English translation of the first message:

> Our teacher told us: "Create something fun in React." For example, she suggested that one student make
> something in a cyberpunk style with Pikachu colors, and asked the others to come up with something unusual
> and fun too. We also have to invent the logic of the site ourselves: anything, as long as it is fun.
> And it has to be deployed. Let's do it! I don't really have any ideas, but I want to complete this task.
> Maybe something about cats — I love cats. Or something else, but really fun and visually beautiful. Let's do it!

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