import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: replace "about-me" below with your exact GitHub repo name
// (e.g. if your repo is github.com/your-username/react-about-me,
// base must be "/react-about-me/"). This is what makes GitHub Pages
// find your CSS/JS files correctly.
export default defineConfig({
  plugins: [react()],
  base: "/JS-Framework.-React/",
});
