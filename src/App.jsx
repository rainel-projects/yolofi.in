import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Splash from "./components/Splash";
import IntroPage from "./components/IntroPage";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Diagnose from "./components/Diagnose";
import LiveActivity from "./components/LiveActivity";
import MultiplexHost from "./components/MultiplexHost";
import LinkSystem from "./components/LinkSystem";
import RemoteView from "./components/RemoteView";
import MobileRestriction from "./components/MobileRestriction";
import "./App.css";

// Wrapper for Splash to handle navigation context
const SplashWrapper = () => {
  const navigate = useNavigate();
  return <Splash onFinish={() => navigate('/start')} />;
};

// Wrapper for Intro to handle navigation
const IntroWrapper = () => {
  const navigate = useNavigate();
  return <IntroPage onContinue={() => navigate('/diagnose')} />;
}

// Legacy Home Page
const HomePage = () => (
  <div className="home-page">
    <Navigation />
    <Hero />
    <HowItWorks />
    <LiveActivity />
    <Diagnose />
  </div>
);

import CoffeePopup from "./components/CoffeePopup";
import Showcase from "./components/Showcase";
import AutonomyConsole from "./components/AutonomyConsole";
import FocusShieldPage from "./components/FocusShieldPage";
import SearchRedirect from "./components/SearchRedirect";

export default function App() {
  return (
    <BrowserRouter>
      <MobileRestriction>
        <CoffeePopup />
        <Routes>
          {/* Flow: Splash -> Start(Intro) -> Diagnose */}
          <Route path="/" element={<SplashWrapper />} />
          <Route path="/start" element={<IntroWrapper />} />

          {/* Marketing / Portfolio */}
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/autonomy" element={<AutonomyConsole />} />



          <Route path="/diagnose" element={
            <div className="diagnose-page">
              <Diagnose />
            </div>
          } />

          {/* New "Yolofi Link" Features */}
          <Route path="/link" element={<LinkSystem />} />
          <Route path="/host-live" element={<MultiplexHost />} />
          <Route path="/remote/:sessionId" element={<RemoteView />} />
          <Route path="/focus-shield" element={<FocusShieldPage />} />

          {/* Search Redirect */}
          <Route path="/search/:query" element={<SearchRedirect />} />

          {/* Legacy/Dev Routes */}
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </MobileRestriction>
    </BrowserRouter>
  );
}
