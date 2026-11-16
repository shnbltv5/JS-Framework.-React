import { Link } from "react-router";

const ROUTES = [
  { path: "/", page: "Home" },
  { path: "/about", page: "About" },
  { path: "/quests", page: "Quests list" },
  { path: "/quests/:id", page: "Quest details" },
  { path: "/dashboard", page: "Dashboard" },
  { path: "/bestiary", page: "Bestiary (public API)" },
  { path: "/bestiary/:index", page: "Monster details" },
  { path: "/login", page: "Login (guests only)" },
  { path: "/signup", page: "Sign up (guests only)" },
  { path: "/profile", page: "Profile (logged-in users only)" },
  { path: "/offline", page: "Offline page (static, precached)" },
  { path: "*", page: "Not Found (404)" },
];

const FEATURES = [
  "Search, 3 filters, 6 sort options and pagination, all saved in the URL",
  "Quest details by id with status actions: accept, complete, abandon, reopen",
  "Form for posting a new quest with validation",
  "Dashboard with statistics, breakdowns and a region filter",
  "Loading, error, empty and not-found states; outdated requests are cancelled",
  "Lazy-loaded pages and a custom 404 page",
  "Firebase Authentication: email/password, Google, persistent sessions",
  "Protected profile page and a NavBar that changes after login",
  "Cached quest data with a 60-second TTL, cleared after every change",
  "Installable PWA: manifest, icons and a service worker",
  "Works offline: app shell precache, saved pages and API data, offline page",
  "Online/offline indicator and a button to update to a new version",
  "Responsive layout from 320px with a mobile menu",
];

export default function About() {
  return (
    <section className="about">
      <div className="box about-intro">
        <h2>About the project</h2>
        <p>
          Quest Board is a single page application for browsing and posting fantasy guild
          quests. It started as my midterm project for the React course and was extended with
          React Router (pages, nested routes, URL parameters, lazy loading), then with Firebase
          Authentication and a cache for server data. Now it is a Progressive Web App: it can be
          installed and keeps working without internet.
        </p>
        <p className="about-author">Made by Aidana Shynbulatova · React course, Fall 2026</p>
        <p>
          More about me:{" "}
          <a href="https://shnbltv5.github.io/JS-Framework.-React/" target="_blank" rel="noreferrer">
            my About Me page
          </a>
        </p>
      </div>

      <div className="about-grid">
        <div className="box">
          <h3>Features</h3>
          <ul className="check-list">
            {FEATURES.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>

        <div className="box">
          <h3>Routes</h3>
          <table className="routes-table">
            <thead>
              <tr>
                <th>Path</th>
                <th>Page</th>
              </tr>
            </thead>
            <tbody>
              {ROUTES.map((route) => (
                <tr key={route.path}>
                  <td>
                    <code>{route.path}</code>
                  </td>
                  <td>{route.page}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="box">
        <h3>Built with</h3>
        <p>
          React 18, React Router, Firebase Authentication, Vite and plain CSS. The data comes from a
          simulated async API (<code>services/service.js</code>) with random delays and{" "}
          <code>localStorage</code>, cached in memory by <code>services/queryCache.js</code>. The
          Bestiary uses the public <a href="https://www.dnd5eapi.co" target="_blank" rel="noreferrer">D&amp;D 5e API</a>.
          The service worker (<code>sw/service-worker.js</code>) caches the app shell, pages, API data and fonts.
        </p>
      </div>

      <Link to="/quests" className="btn">
        Go to the quests
      </Link>
    </section>
  );
}
