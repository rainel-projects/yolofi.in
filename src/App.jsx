import React, { useState, useEffect } from 'react';
import logo from './assets/logo.jpg';
import './components/Splash.css';
import './App.css';

function App() {
  const [phase, setPhase] = useState('splash'); // 'splash' | 'home' | 'diagnose'

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('home');
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    setPhase('diagnose');
  };

  return (
    <div className={`app-container phase-${phase}`}>
      {/* Splash Screen */}
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

      {/* Header - Shows after splash */}
      {(phase === 'home' || phase === 'diagnose') && (
        <header className="app-header">
          <img src={logo} alt="Yolofi" className="header-logo" onClick={() => setPhase('home')} />
          <nav className="header-nav">
            <a href="#home" onClick={() => setPhase('home')}>Home</a>
            <a href="#diagnose" onClick={() => setPhase('diagnose')}>Diagnose</a>
            <a href="#about">About</a>
          </nav>
        </header>
      )}

      {/* Curved Background Designs */}
      {(phase === 'home' || phase === 'diagnose') && (
        <>
          <div className="curve-design curve-top"></div>
          <div className="curve-design curve-bottom"></div>
        </>
      )}

      {/* Home Page */}
      {phase === 'home' && (
        <div className="home-page">
          <section className="welcome-section" id="home">
            <h1>Welcome to Yolofi</h1>
            <p>Your AI-powered troubleshooting companion</p>
            <button className="cta-button" onClick={handleGetStarted}>Get Started →</button>
          </section>

          {/* How It Works Section */}
          <section className="how-it-works-section" id="how-it-works">
            <h2>How It Works</h2>
            <div className="steps-container">
              <div className="step-card">
                <div className="step-number">01</div>
                <h3>Detect</h3>
                <p>We analyze your system and identify issues automatically</p>
              </div>
              <div className="step-card">
                <div className="step-number">02</div>
                <h3>Diagnose</h3>
                <p>AI determines the root cause and best solution</p>
              </div>
              <div className="step-card">
                <div className="step-number">03</div>
                <h3>Fix</h3>
                <p>Download and apply automated fixes instantly</p>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className="about-section" id="about">
            <h2>About Yolofi</h2>
            <p>
              Yolofi combines AI reasoning with automated fix generation to solve your tech problems.
              No complex technical knowledge required.
            </p>
            <p className="copyright">© 2024 Yolofi. All rights reserved.</p>
          </section>
        </div>
      )}

      {/* Diagnose Page - Phase 1 */}
      {phase === 'diagnose' && (
        <div className="diagnose-page">
          <section className="diagnose-section">
            <h1>System Diagnosis</h1>
            <p className="diagnose-subtitle">Let's identify what's wrong with your device</p>

            <div className="diagnose-container">
              {/* System Detection */}
              <div className="detection-card">
                <h3>🔍 Detecting Your System...</h3>
                <div className="system-info">
                  <div className="info-row">
                    <span className="label">Operating System:</span>
                    <span className="value">{navigator.platform}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Browser:</span>
                    <span className="value">{navigator.userAgent.split(' ').pop().split('/')[0]}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Language:</span>
                    <span className="value">{navigator.language}</span>
                  </div>
                </div>
              </div>

              {/* Issue Selection */}
              <div className="issue-selection">
                <h3>What's the problem?</h3>
                <div className="issue-grid">
                  <button className="issue-card">
                    <span className="issue-icon">🐌</span>
                    <span className="issue-name">Slow Performance</span>
                  </button>
                  <button className="issue-card">
                    <span className="issue-icon">💥</span>
                    <span className="issue-name">Crashes/Freezes</span>
                  </button>
                  <button className="issue-card">
                    <span className="issue-icon">🌐</span>
                    <span className="issue-name">Network Issues</span>
                  </button>
                  <button className="issue-card">
                    <span className="issue-icon">🔋</span>
                    <span className="issue-name">Battery Drain</span>
                  </button>
                  <button className="issue-card">
                    <span className="issue-icon">💾</span>
                    <span className="issue-name">Storage Full</span>
                  </button>
                  <button className="issue-card">
                    <span className="issue-icon">❓</span>
                    <span className="issue-name">Other</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
