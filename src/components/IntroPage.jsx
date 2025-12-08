import "./GetStarted.css";

export default function IntroPage({ onContinue }) {
    return (
        <div className="intro-page">
            <div className="intro-content">
                <div className="intro-tag">AI-Powered Diagnostics</div>

                <h1 className="intro-title">
                    Troubleshoot Your PC<br />
                    In Under 60 Seconds
                </h1>

                <p className="intro-description">
                    Enterprise-grade diagnostics that identify and fix system issues automatically.
                    No technical knowledge required.
                </p>

                <div className="intro-stats">
                    <div className="stat-item">
                        <div className="stat-value">2.4M+</div>
                        <div className="stat-label">Issues Resolved</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-value">98%</div>
                        <div className="stat-label">Success Rate</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-value">&lt;60s</div>
                        <div className="stat-label">Avg. Fix Time</div>
                    </div>
                </div>

                <button className="intro-cta" onClick={onContinue}>
                    Start Free Diagnosis
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <div className="trust-indicators">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 14L3 11V6L8 3L13 6V11L8 14Z" stroke="#10b981" strokeWidth="1.5" fill="none" />
                        <path d="M6 8L7.5 9.5L10.5 6.5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>No installation required</span>
                    <span className="separator">•</span>
                    <span>100% secure</span>
                    <span className="separator">•</span>
                    <span>Free forever</span>
                </div>
            </div>

            <div className="intro-visual">
                <div className="visual-grid">
                    <div className="grid-item active">
                        <div className="item-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="item-label">Scanning</div>
                    </div>
                    <div className="grid-item">
                        <div className="item-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="item-label">Analyzing</div>
                    </div>
                    <div className="grid-item">
                        <div className="item-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M13 10V3L4 14H11V21L20 10H13Z"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="item-label">Fixing</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
