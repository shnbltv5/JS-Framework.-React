import { lazy } from "react";
import { Routes, Route } from "react-router";
import RootLayout from "./layouts/RootLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import GuestRoute from "./components/GuestRoute.jsx";
import Home from "./pages/Home.jsx";

// Lazy-loaded pages: their code is downloaded only when the route is opened.
// The <Suspense> fallback is in RootLayout, around <Outlet />.
const About = lazy(() => import("./pages/About.jsx"));
const Quests = lazy(() => import("./pages/Quests.jsx"));
const QuestDetails = lazy(() => import("./pages/QuestDetails.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Bestiary = lazy(() => import("./pages/Bestiary.jsx"));
const MonsterDetails = lazy(() => import("./pages/MonsterDetails.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
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
        <Route path="bestiary">
          <Route index element={<Bestiary />} />
          <Route path=":index" element={<MonsterDetails />} />
        </Route>

        {/* Only for guests: a logged-in user is redirected away */}
        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        {/* Only for logged-in users: a guest is redirected to /login */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
