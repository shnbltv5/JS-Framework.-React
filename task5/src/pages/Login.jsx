import { useState } from "react";

// Placeholder for future authentication: the form works as a controlled form,
// but nobody is really logged in yet.
export default function Login() {
  const [form, setForm] = useState({ name: "", password: "" });
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.password) {
      setMessage("Enter your adventurer name and password.");
      return;
    }
    setMessage(`Welcome, ${form.name.trim()}! Guild accounts are coming soon.`);
  }

  return (
    <section className="login-page">
      <form className="form login-card" onSubmit={handleSubmit} noValidate>
        <span className="board-emblem" aria-hidden="true">🛡️</span>
        <h2>Enter the guild</h2>
        <p className="muted">Sign in to accept quests under your name. (Coming soon)</p>

        <label className="field">
          Adventurer name
          <input name="name" value={form.name} onChange={handleChange} autoComplete="username" />
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

        <button type="submit" className="btn">
          Sign in
        </button>

        {message && (
          <p className="login-message" role="status">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
