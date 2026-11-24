import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useOnlineStatus } from "../hooks/useOnlineStatus.js";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/quests", label: "Quests" },
  { to: "/bestiary", label: "Bestiary" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
];

// NavLink passes isActive, so the current page is highlighted
function linkClass({ isActive }) {
  return isActive ? "nav-link is-active" : "nav-link";
}

export default function NavBar() {
  const { user, loading, logOut } = useAuth();
  const isOnline = useOnlineStatus();
  const { pathname } = useLocation();

  // On small screens the links are hidden behind the "Menu" button
  const [menuOpen, setMenuOpen] = useState(false);

  // A link was clicked and a new page opened: close the menu
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setMenuOpen(false);
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

      <div className="header-tools">
        <span className={`network-status ${isOnline ? "is-online" : "is-offline"}`} role="status">
          <span className="network-dot" aria-hidden="true" />
          {isOnline ? "Online" : "Offline"}
        </span>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label="Menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">{menuOpen ? "✕" : "☰"}</span>
          <span className="nav-toggle-text">Menu</span>
        </button>
      </div>

      <nav id="main-nav" className={menuOpen ? "nav is-open" : "nav"} aria-label="Main">
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
