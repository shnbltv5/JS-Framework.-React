import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Deployed on Vercel at the site root. vercel.json sends every path to index.html,
// so direct links and refresh work on /quests/12, /profile, ...
export default defineConfig({
  plugins: [react()],
});
