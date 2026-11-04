import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import "./styles/index.css";
import "./styles/pages.css";

// The app is served from /JS-Framework.-React/task5/, so the router must know
// that prefix: "/quests" in the code means "/JS-Framework.-React/task5/quests" in the browser.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
