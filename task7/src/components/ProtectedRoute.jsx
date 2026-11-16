import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import StatusMessage from "./StatusMessage.jsx";

// Pages inside this route are only for logged-in users.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Firebase is still restoring the session: don't redirect yet,
  // otherwise a logged-in user would be thrown to /login on every refresh.
  if (loading) {
    return <StatusMessage variant="loading" title="Checking your session..." />;
  }

  if (!user) {
    // Remember where the user wanted to go, so we can return there after login
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
