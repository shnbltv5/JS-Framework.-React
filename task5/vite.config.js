import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Absolute paths: assets must load from "/assets/..." even on "/quests/12"
  base: "/",
});
