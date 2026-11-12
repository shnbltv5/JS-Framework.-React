import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import StatusMessage from "./StatusMessage.jsx";

// Login and Signup are only for guests. A logged-in user is sent on:
// to the page they wanted before login, or to /profile.
// This also does the redirect right after a successful login/signup.
export default function GuestRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <StatusMessage variant="loading" title="Checking your session..." />;
  }

  if (user) {
    return <Navigate to={location.state?.from ?? "/profile"} replace />;
  }

  return <Outlet />;
}
