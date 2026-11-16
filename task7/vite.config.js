import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import serviceWorker from "./sw/vite-plugin.js";

export default defineConfig({
  plugins: [react(), serviceWorker()],
});
