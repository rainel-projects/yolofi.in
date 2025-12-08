import "./GetStarted.css";

export default function IntroPage({ onContinue }) {
    return (
        <div className="intro-page">
            <div className="intro-content">
                <div className="intro-badge">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 2L12.5 7.5L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7.5L10 2Z"
                            fill="#1f6bff" stroke="#1f6bff" strokeWidth="1.5" />
                    </svg>
                    <span>AI-Powered</span>
                </div>

                <h1 className="intro-title">
                    PC Acting Up?<br />
                    <span className="gradient-text">We Fix It. Fast.</span>
                </h1>

                <p className="intro-subtitle">
                    Automated diagnostics that actually work. No tech skills needed.
                    Just click, wait 60 seconds, and get back to what matters.
                </p>

                <div className="intro-features">
                    <div className="feature-pill">⚡ Instant Analysis</div>
                    <div className="feature-pill">🎯 Auto-Fix</div>
                    <div className="feature-pill">💯 Zero Hassle</div>
                </div>

                <button className="intro-button" onClick={onContinue}>
                    Start Free Diagnosis →
                </button>

                <p className="intro-note">No credit card • No installation • Works instantly</p>
            </div>

            <div className="intro-visual">
                <div className="visual-card">
                    <div className="scan-indicator"></div>
                    <div className="scan-text">Scanning system...</div>
                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
