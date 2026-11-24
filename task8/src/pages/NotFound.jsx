import { Link, useLocation } from "react-router";

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <section className="not-found">
      <span className="not-found-code">404</span>
      <h2>This path leads nowhere</h2>
      <p className="muted">
        No map in the guild shows <code>{pathname}</code>.
      </p>
      <div className="form-actions">
        <Link to="/" className="btn">
          Back to Home
        </Link>
        <Link to="/quests" className="btn btn-ghost">
          Browse quests
        </Link>
      </div>
    </section>
  );
}
