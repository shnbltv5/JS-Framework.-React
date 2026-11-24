import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import NavBar from "../components/NavBar.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import UpdatePrompt from "../components/UpdatePrompt.jsx";
import { useOnlineStatus } from "../hooks/useOnlineStatus.js";
import { rememberPage } from "../pwa/registerServiceWorker.js";

export default function RootLayout() {
  const { pathname } = useLocation();
  const isOnline = useOnlineStatus();

  // A new page starts at the top, like on a normal website.
  // The service worker remembers the page, so it also opens offline later.
  useEffect(() => {
    window.scrollTo(0, 0);
    rememberPage(window.location.href);
  }, [pathname]);

  return (
    <div className="app">
      <NavBar />

      {!isOnline && (
        <p className="offline-banner" role="status">
          You are offline. Pages and data you opened before are still available. New data will load when the
          connection is back.
        </p>
      )}

      <main>
        {/* Shown while the code of a lazy page is loading. The NavBar stays visible. */}
        <Suspense fallback={<StatusMessage variant="loading" title="Opening the page..." />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="board-footer">
        <p>Quest Board · React · Redux Toolkit · PWA · Fall 2026</p>
      </footer>

      <UpdatePrompt />
    </div>
  );
}
