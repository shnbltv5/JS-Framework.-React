import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Provider } from "react-redux";
import { store } from "./store/index.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import App from "./App.jsx";
import { registerServiceWorker } from "./pwa/registerServiceWorker.js";
import "./styles/index.css";
import "./styles/pages.css";
import "./styles/pwa.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Every component can read the store with useSelector and change it with useDispatch */}
    <Provider store={store}>
      <BrowserRouter>
        {/* Every page and the NavBar can read the logged-in user with useAuth() */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);

// PWA: offline support and updates (only in the production build)
registerServiceWorker();
