import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Values come from .env.local (see .env.example). Vite puts only VITE_* variables
// into the browser build. This is a public client config, not a secret:
// security comes from Firebase rules and the "Authorized domains" list.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// On the web, getAuth keeps the session in the browser (local persistence),
// so the user stays logged in after a refresh or after closing the tab.
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
