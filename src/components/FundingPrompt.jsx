import React from 'react';
import './FundingPrompt.css';

const FundingPrompt = () => {
    return (
        <div className="funding-container">
            <div className="funding-inner">
                <div className="funding-icon">☕</div>

                <h3 className="funding-title">Enjoying the Speed?</h3>

                <p className="funding-text">
                    Yolofi is free, privacy-first, and serverless.
                    If we helped you fix a glitch or save some RAM today,
                    consider fueling our late-night coding sessions.
                </p>

                <a
                    href="https://buymeacoffee.com/yolofi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="coffee-btn"
                >
                    <span>Fuel the Magic</span>
                </a>

                <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    (Every coffee adds a new feature)
                </div>
            </div>
        </div>
    );
};

export default FundingPrompt;
