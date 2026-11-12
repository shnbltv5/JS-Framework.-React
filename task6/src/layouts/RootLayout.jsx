import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import NavBar from "../components/NavBar.jsx";
import StatusMessage from "../components/StatusMessage.jsx";

export default function RootLayout() {
  const { pathname } = useLocation();

  // A new page starts at the top, like on a normal website
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <NavBar />

      <main>
        {/* Shown while the code of a lazy page is loading. The NavBar stays visible. */}
        <Suspense fallback={<StatusMessage variant="loading" title="Opening the page..." />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="board-footer">
        <p>Quest Board · React SPA · Fall 2026</p>
      </footer>
    </div>
  );
}
