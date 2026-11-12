import { Link, NavLink } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/quests", label: "Quests" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
];

// NavLink passes isActive, so the current page is highlighted
function linkClass({ isActive }) {
  return isActive ? "nav-link is-active" : "nav-link";
}

export default function NavBar() {
  const { user, loading, logOut } = useAuth();

  async function handleLogout() {
    try {
      await logOut();
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <header className="board-header">
      <Link to="/" className="board-title">
        <span className="board-emblem" aria-hidden="true">⚔</span>
        <div>
          <h1>Quest Board</h1>
          <p className="board-tagline">Browse contracts. Search the archive. Claim rewards.</p>
        </div>
      </Link>

      <nav className="nav" aria-label="Main">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
            {link.label}
          </NavLink>
        ))}

        {/* While Firebase restores the session we show nothing, so the links don't flicker */}
        {!loading && user && (
          <>
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
            <button type="button" className="nav-link nav-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}

        {!loading && !user && (
          <>
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
            <NavLink to="/signup" className={linkClass}>
              Sign up
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
}
