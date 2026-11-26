import { lazy } from "react";
import { Route, Routes } from "react-router";
import Layout from "./components/Layout.jsx";
import Cafe from "./pages/Cafe.jsx";

const Shop = lazy(() => import("./pages/Shop.jsx"));
const Cats = lazy(() => import("./pages/Cats.jsx"));
const CatProfile = lazy(() => import("./pages/CatProfile.jsx"));
const Trophies = lazy(() => import("./pages/Trophies.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Cafe />} />
        <Route path="shop" element={<Shop />} />
        <Route path="cats">
          <Route index element={<Cats />} />
          <Route path=":id" element={<CatProfile />} />
        </Route>
        <Route path="trophies" element={<Trophies />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
