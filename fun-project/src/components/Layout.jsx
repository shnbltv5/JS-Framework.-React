import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import Header from "./Header.jsx";
import Toasts from "./Toasts.jsx";
import EventCard from "./EventCard.jsx";
import AwayModal from "./AwayModal.jsx";
import { useGameLoop, useRandomEvents } from "../hooks/useGameLoop.js";

export default function Layout() {
  const { pathname } = useLocation();
  // The game runs on every page: coins keep coming while you are in the shop
  useGameLoop();
  useRandomEvents();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <Header />
      <main className="main">
        <Suspense fallback={<p className="loading">Opening the door…</p>}>
          <Outlet />
        </Suspense>
      </main>
      <EventCard />
      <Toasts />
      <AwayModal />
    </div>
  );
}
