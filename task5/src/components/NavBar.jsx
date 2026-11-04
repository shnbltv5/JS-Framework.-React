import { Link, NavLink } from "react-router";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/quests", label: "Quests" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/about", label: "About" },
  { to: "/login", label: "Login" },
];

// NavLink passes isActive, so the current page is highlighted
function linkClass({ isActive }) {
  return isActive ? "nav-link is-active" : "nav-link";
}

export default function NavBar() {
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
      </nav>
    </header>
  );
}
