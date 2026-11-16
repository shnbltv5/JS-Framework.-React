import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getAuthErrorMessage } from "../services/authService.js";

const PROVIDER_NAMES = {
  password: "Email and password",
  "google.com": "Google",
};

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

// Protected page: ProtectedRoute lets us in only when `user` exists.
export default function Profile() {
  const { user, logOut } = useAuth();
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");
    try {
      // After signOut, user becomes null and ProtectedRoute sends us to /login
      await logOut();
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setLoggingOut(false);
    }
  }

  const providerId = user.providerData[0]?.providerId;

  return (
    <section className="profile-page">
      <article className="panel detail profile-card">
        <div className="card-head">
          <span className="quest-avatar" aria-hidden="true">🧙</span>
          <h2>{user.displayName || "Adventurer profile"}</h2>
        </div>

        <dl className="facts">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>UID</dt>
            <dd className="uid">{user.uid}</dd>
          </div>
          <div>
            <dt>Signed in with</dt>
            <dd>{PROVIDER_NAMES[providerId] ?? providerId ?? "—"}</dd>
          </div>
          <div>
            <dt>Email verified</dt>
            <dd>{user.emailVerified ? "Yes" : "No"}</dd>
          </div>
          <div>
            <dt>Account created</dt>
            <dd>{formatDate(user.metadata.creationTime)}</dd>
          </div>
          <div>
            <dt>Last sign-in</dt>
            <dd>{formatDate(user.metadata.lastSignInTime)}</dd>
          </div>
        </dl>

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}

        <div className="form-actions">
          <button type="button" className="btn" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </article>
    </section>
  );
}
