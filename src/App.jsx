import { useState } from "react";
import Splash from "./components/Splash";
import GetStarted from "./components/GetStarted";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Diagnose from "./components/Diagnose";
import "./App.css";

export default function App() {
  const [currentPage, setCurrentPage] = useState("splash");

  // Auto-advance from splash after it finishes
  const handleSplashFinish = () => {
    setCurrentPage("getstarted");
  };

  // Navigate from GetStarted to Home
  const handleGetStartedContinue = () => {
    setCurrentPage("home");
  };

  return (
    <>
      {/* Splash Screen */}
      {currentPage === "splash" && <Splash onFinish={handleSplashFinish} />}

      {/* Get Started Page */}
      {currentPage === "getstarted" && (
        <GetStarted onContinue={handleGetStartedContinue} />
      )}

      {/* Home Page with all sections */}
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
      <Diagnose />
    </div>
  );
}
