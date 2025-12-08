import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section id="home" className="hero-section">
            {/* Decorative elements inspired by reference */}
            <div className="hero-decorations">
                <div className="deco-arrows deco-top-left">
                    <svg width="80" height="40" viewBox="0 0 80 40">
                        <path d="M0 20 L15 10 L15 30 Z M20 20 L35 10 L35 30 Z M40 20 L55 10 L55 30 Z M60 20 L75 10 L75 30 Z"
                            fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    </svg>
                </div>
                <div className="deco-wave deco-center">
                    <svg width="120" height="20" viewBox="0 0 120 20">
                        <path d="M0 10 Q30 0, 60 10 T120 10" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    </svg>
                </div>
                <div className="deco-arrows deco-top-right">
                    <svg width="80" height="40" viewBox="0 0 80 40">
                        <path d="M5 10 L20 20 L5 30 M25 10 L40 20 L25 30 M45 10 L60 20 L45 30 M65 10 L80 20 L65 30"
                            fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    </svg>
                </div>
            </div>

            <div className="hero-content">
                <h1 className="hero-title">Device Troubleshooting,<br />Simplified.</h1>
                <p className="hero-subtitle">
                    Smart AI-powered diagnostics that fix your tech problems in seconds.
                </p>
                <div className="hero-cta">
                    <a href="#diagnose" className="btn-primary">
                        Start Diagnosis
                    </a>
                    <a href="#how-it-works" className="btn-secondary">
                        How It Works
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Hero;
