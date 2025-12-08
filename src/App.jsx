import { useState } from "react";
import Splash from "./components/Splash";
import IntroPage from "./components/IntroPage";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Diagnose from "./components/Diagnose";
import LiveActivity from "./components/LiveActivity";
import "./App.css";

// Navigation flow: Splash → GetStarted → Home
export default function App() {
  const [currentPage, setCurrentPage] = useState("splash");

  // Auto-advance from splash after it finishes
  const handleSplashFinish = () => {
    setCurrentPage("getstarted");
  };

  // Navigate from GetStarted directly to Diagnose
  const handleGetStartedContinue = () => {
    setCurrentPage("diagnose");
  };

  return (
    <>
      {/* Splash Screen */}
      {currentPage === "splash" && <Splash onFinish={handleSplashFinish} />}

      {/* Intro/Get Started Page */}
      {currentPage === "getstarted" && (
        <IntroPage onContinue={handleGetStartedContinue} />
      )}

      {/* Diagnose Page - Clean, focused diagnostic interface */}
      {currentPage === "diagnose" && (
        <div className="diagnose-page">
          <Diagnose />
        </div>
      )}

      {/* Home Page with all sections - Not used in main flow anymore */}
      {currentPage === "home" && (
        <HomePage />
      )}
    </>
  );
}

// Home Page Component with Navigation and all sections
function HomePage() {
  return (
    <div className="home-page">
      <Navigation />
      <Hero />
      <HowItWorks />
      <LiveActivity />
      <Diagnose />
    </div>
  );
}
