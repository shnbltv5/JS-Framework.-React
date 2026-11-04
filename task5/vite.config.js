import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// This project lives in the task5/ folder of the JS-Framework.-React repo and
// is deployed to the task5/ subfolder of the gh-pages branch:
// https://shnbltv5.github.io/JS-Framework.-React/task5/
// `base` must be absolute so JS/CSS load from /task5/assets/ even on /task5/quests/12.
export default defineConfig({
  plugins: [react()],
  base: "/JS-Framework.-React/task5/",
});
