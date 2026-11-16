import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.js";
import { logIn, logInWithGoogle, logOut, signUp } from "../services/authService.js";

const AuthContext = createContext(null);

// Global auth state for the whole app: who is logged in and whether Firebase is still checking.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // true until Firebase tells us the first time if there is a saved session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase calls this on page load (restored session or null),
    // after login, signup, Google sign-in and logout.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    // Cleanup: stop listening when the provider unmounts
    return unsubscribe;
  }, []);

  const value = { user, loading, signUp, logIn, logInWithGoogle, logOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
