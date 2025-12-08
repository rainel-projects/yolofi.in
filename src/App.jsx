import React, { useState, useEffect } from 'react';
import logo from './assets/logo.jpg';
import './components/Splash.css';
import './App.css';

function App() {
  const [phase, setPhase] = useState('splash'); // 'splash' | 'home'

  useEffect(() => {
    // After 6 seconds, transition to home
    const timer = setTimeout(() => {
      setPhase('home');
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`app-container phase-${phase}`}>
      {/* Splash Screen - Full screen initially */}
      {phase === 'splash' && (
        <div className="splash-screen">
          <div className="orbit orbit-1"></div>
          <div className="orbit orbit-2"></div>
          <div className="orbit orbit-3"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>

          <div className="splash-logo-container">
            <img src={logo} alt="Yolofi" className="splash-logo" />
          </div>
        </div>
      )}

      {/* Header with Logo - Shows after splash */}
      {phase === 'home' && (
        <>
          <header className="app-header">
            <img src={logo} alt="Yolofi" className="header-logo" />
            <span className="brand-name">yolofi</span>
          </header>

          {/* Home Page Content */}
          <div className="home-page">
            <section className="welcome-section">
              <h1>Welcome to Yolofi</h1>
              <p>Your AI-powered troubleshooting companion</p>
              <button className="cta-button">Get Started →</button>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
