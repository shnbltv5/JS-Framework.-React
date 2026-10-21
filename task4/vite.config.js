import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// This project lives in the task4/ folder of the JS-Framework.-React repo and
// is deployed to the task4/ subfolder of the gh-pages branch, so the app is
// served from https://<username>.github.io/JS-Framework.-React/task4/
// (`base` must match that path, otherwise the JS/CSS files are not found).
export default defineConfig({
  plugins: [react()],
  base: "/JS-Framework.-React/task4/",
});
