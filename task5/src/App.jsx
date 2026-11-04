import { lazy } from "react";
import { Routes, Route } from "react-router";
import RootLayout from "./layouts/RootLayout.jsx";
import Home from "./pages/Home.jsx";

// Lazy-loaded pages: their code is downloaded only when the route is opened.
// The <Suspense> fallback is in RootLayout, around <Outlet />.
const About = lazy(() => import("./pages/About.jsx"));
const Quests = lazy(() => import("./pages/Quests.jsx"));
const QuestDetails = lazy(() => import("./pages/QuestDetails.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="quests">
          <Route index element={<Quests />} />
          <Route path=":id" element={<QuestDetails />} />
        </Route>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
