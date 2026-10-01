import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT — read this before deploying:
// This project is meant to live at task3/ inside the SAME GitHub repo as
// your other tasks (JS-Framework.-React), deployed to a SUBFOLDER of the
// gh-pages branch so it does not overwrite task2's already-deployed site.
//
// That's why package.json's deploy script is:
//   "deploy": "gh-pages -d dist --dest task3"
// (--dest task3 publishes this build into a task3/ folder on the gh-pages
// branch, instead of overwriting the branch root where task2 lives).
//
// Because of that, the live URL will be:
//   https://<your-username>.github.io/<your-repo-name>/task3/
// so `base` below must match BOTH segments: repo name AND /task3/.
export default defineConfig({
  plugins: [react()],
  base: "/JS-Framework.-React/task3/",
});
