import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { getAuthErrorMessage } from "../services/authService.js";

const EMPTY_FORM = { email: "", password: "", confirmPassword: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (form.password.length < 6) errors.password = "Password must be at least 6 characters.";
  if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match.";
  return errors;
}

export default function Signup() {
  const { signUp } = useAuth();
  const location = useLocation();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      // Firebase creates the account and logs the user in;
      // GuestRoute then redirects to the profile.
      await signUp(form.email.trim(), form.password);
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <section className="login-page">
      <form className="form login-card" onSubmit={handleSubmit} noValidate>
        <span className="board-emblem" aria-hidden="true">📜</span>
        <h2>Join the guild</h2>
        <p className="muted">Create an account with your email.</p>

        <label className="field">
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>

        <label className="field">
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>

        <label className="field">
          Confirm password
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
        </label>

        {submitError && (
          <p className="auth-error" role="alert">
            {submitError}
          </p>
        )}

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? "Creating account..." : "Sign up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login" state={location.state}>Log in</Link>
        </p>
      </form>
    </section>
  );
}
