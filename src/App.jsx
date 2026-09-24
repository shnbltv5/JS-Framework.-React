import Header from "./components/Header.jsx";
import Profile from "./components/Profile.jsx";
import AboutMe from "./components/AboutMe.jsx";
import Contact from "./components/Contact.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <div className="page">
      <Header />
      <main>
        <Profile />
        <AboutMe />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
