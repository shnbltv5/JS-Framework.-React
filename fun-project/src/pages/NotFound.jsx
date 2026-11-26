import { Link, useLocation } from "react-router";

export default function NotFound() {
  const { pathname } = useLocation();
  return (
    <section className="page empty-state">
      <span className="empty-emoji" aria-hidden="true">🧶</span>
      <h1 className="page-title">Nothing here but yarn</h1>
      <p className="page-lead">
        A cat rolled <code>{pathname}</code> under the sofa.
      </p>
      <Link to="/" className="btn btn-pink">Back to the café</Link>
    </section>
  );
}
