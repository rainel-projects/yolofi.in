import React, { useState, useEffect } from 'react';
import './components/Splash.css'; // Ensure splash styles are available
import logo from './assets/logo.jpg';

function App() {
  const [phase, setPhase] = useState('splash'); // 'splash' | 'moving' | 'done'

  useEffect(() => {
    // 1. Initial hold (Splash state) - 5 seconds
    const timer1 = setTimeout(() => {
      setPhase('moving');

      // 2. Animation duration (matches CSS)
      const timer2 = setTimeout(() => {
        setPhase('done');
      }, 1200); // 1.2s transition
    }, 5000);

    return () => {
      clearTimeout(timer1);
    };
  }, []);

  return (
    <div className={`app-container phase-${phase}`}>

      {/* 
        The Shared Logo Element 
        This single element transforms from "Hero Splash" to "Header Logo"
      */}
      <div className="shared-logo-wrapper">
        <img src={logo} alt="Yolofi Logo" className="shared-logo" />
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="app-header">
          {/* Header space is reserved, logo moves into it */}
          <nav style={{ marginLeft: 'auto', display: 'flex', gap: '2rem', padding: '1.5rem' }}>
            {/* Placeholder nav items */}
            <span style={{ opacity: 0.6 }}>Home</span>
            <span style={{ opacity: 0.6 }}>Features</span>
            <span style={{ opacity: 0.6 }}>Contact</span>
          </nav>
        </header>

        <main className="landing-hero">
          <h1>yolofi.in</h1>
          <p>Device troubleshooting, simplified.</p>
          <button style={{
            marginTop: '2rem',
            padding: '1rem 2rem',
            borderRadius: '50px',
            border: 'none',
            background: '#1a1a1a',
            color: 'white',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>
            Get Started
          </button>
        </main>
      </div>

      {/* Dynamic Background (Splash Layer) */}
      <div className="splash-background"></div>

    </div>
  );
}

export default App;
