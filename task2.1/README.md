# About Me — React SPA

A small self-promotional single-page app built with React + Vite for the
"Build React App" homework.

## Components

- `App` — composes everything
- `Header` — logo + nav links
- `Profile` — name and photo
- `AboutMe` — bio and skills
- `Contact` — safe contact info (no phone/address)
- `Footer`

## Before you run it — 3 things to edit

1. **Add your photo**: drop an image into `public/photo.jpg` (any image works,
   the file just needs that exact name — or update the `src` in
   `src/components/Profile.jsx` to match your filename).
2. **Update your real contact links** in `src/components/Contact.jsx` —
   replace `your-username` / `your.handle` with your actual GitHub/Instagram.
3. **Set the Vite base path** in `vite.config.js` to match your GitHub repo
   name exactly (see the comment in that file) — this is what makes GitHub
   Pages load the CSS/JS correctly. If your repo is
   `github.com/your-username/about-me`, keep `base: "/about-me/"`.

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Deploy to GitHub Pages

1. Push this project to a new public GitHub repository.
2. Install the deploy dependency (already in `package.json`, just run):
   ```bash
   npm install
   ```
3. Deploy:
   ```bash
   npm run deploy
   ```
   This builds the project and pushes the `dist` folder to a `gh-pages`
   branch automatically.
4. On GitHub: go to your repo → **Settings → Pages** → under "Build and
   deployment", set **Source** to "Deploy from a branch" and **Branch** to
   `gh-pages`. Save.
5. Your live link will be:
   `https://your-username.github.io/about-me/`

## Submission checklist

- [ ] GitHub repository link
- [ ] Deployed GitHub Pages link
- [ ] One screenshot of the app running in the browser
- [ ] Turn In pressed before the deadline
