import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "./context/AuthContext.jsx";
import App from "./App.jsx";
import { registerServiceWorker } from "./pwa/registerServiceWorker.js";
import "./styles/index.css";
import "./styles/pages.css";
import "./styles/pwa.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      {/* Every page and the NavBar can read the logged-in user with useAuth() */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

// PWA: offline support and updates (only in the production build)
registerServiceWorker();
