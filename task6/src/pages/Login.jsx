import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { getAuthErrorMessage } from "../services/authService.js";

export default function Login() {
  const { logIn, logInWithGoogle } = useAuth();
  const location = useLocation();
  const cameFromProtectedPage = Boolean(location.state?.from);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // On success Firebase updates the user in AuthContext and GuestRoute redirects,
  // so here we only handle the waiting state and errors.
  async function runAuth(action) {
    setSubmitting(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setSubmitting(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Enter your email and password.");
      return;
    }
    runAuth(() => logIn(form.email.trim(), form.password));
  }

  return (
    <section className="login-page">
      <form className="form login-card" onSubmit={handleSubmit} noValidate>
        <span className="board-emblem" aria-hidden="true">🛡️</span>
        <h2>Enter the guild</h2>
        <p className="muted">
          {cameFromProtectedPage ? "Please log in to open that page." : "Log in to see your adventurer profile."}
        </p>

        <label className="field">
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" />
        </label>

        <label className="field">
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </label>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>

        <p className="auth-divider">or</p>

        <button
          type="button"
          className="btn btn-ghost"
          disabled={submitting}
          onClick={() => runAuth(logInWithGoogle)}
        >
          Continue with Google
        </button>

        <p className="auth-switch">
          New here? <Link to="/signup" state={location.state}>Create an account</Link>
        </p>
      </form>
    </section>
  );
}
