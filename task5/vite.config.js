import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages: the app lives in /JS-Framework.-React/task5/
// Vercel (sets VERCEL=1 while building): the app lives at the site root "/"
export default defineConfig({
  plugins: [react()],
base: process.env.VERCEL ? "/" : "/JS-Framework.-React/task5/",
});
