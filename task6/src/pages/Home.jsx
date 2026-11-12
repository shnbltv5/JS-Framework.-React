import { Link } from "react-router";
import boardImage from "../assets/quest-board.svg";

const SECTIONS = [
  { to: "/quests", title: "Quests", text: "Search, filter and sort 120 guild contracts, or post your own." },
  { to: "/dashboard", title: "Dashboard", text: "See rewards, difficulty and progress across all regions." },
  { to: "/about", title: "About", text: "How the project is built and which routes it has." },
];

export default function Home() {
  return (
    <section>
      <div className="hero">
        <div className="hero-text">
          <h2>Welcome to the guild hall, adventurer</h2>
          <p className="muted">
            Quest Board collects contracts from every corner of the realm. Pick a quest that
            fits your rank, accept it and claim the reward. Every search and filter is saved in
            the link, so you can share it, refresh the page or go back without losing anything.
          </p>
          <div className="form-actions">
            <Link to="/quests" className="btn">
              Browse quests
            </Link>
            <Link to="/dashboard" className="btn btn-ghost">
              Open dashboard
            </Link>
          </div>
        </div>
        <img src={boardImage} alt="A wooden quest board with pinned scrolls" className="hero-image" />
      </div>

      <div className="feature-grid">
        {SECTIONS.map((section) => (
          <Link key={section.to} to={section.to} className="feature">
            <h3>{section.title} →</h3>
            <p>{section.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
