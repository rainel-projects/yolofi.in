import React, { useEffect, useState } from "react";
import "./GamifiedResults.css";
import { CheckCircleIcon, ScanIcon } from "./Icons";
import Confetti from "react-confetti";

const GamifiedResults = ({ onRescan }) => {
    const [showConfetti, setShowConfetti] = useState(true);
    const [score, setScore] = useState(0);

    useEffect(() => {
        // Animate score from 0 to 98
        const interval = setInterval(() => {
            setScore((prev) => {
                if (prev >= 98) {
                    clearInterval(interval);
                    return 98;
                }
                return prev + 2;
            });
        }, 20);

        // Stop confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, []);

    return (
        <div className="gamified-results-container">
            {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />}

            <div className="results-header">
                <div className="score-badge">
                    <span className="score-value">{score}</span>
                    <span className="score-label">Health Score</span>
                </div>
                <h2>Optimization Complete!</h2>
                <p className="subtitle">Your system is now running at peak performance.</p>
            </div>

            <div className="stats-comparison">
                <div className="stat-card improved">
                    <span className="stat-label">System Speed</span>
                    <div className="stat-change">
                        <span className="old-val">Average</span>
                        <span className="arrow">→</span>
                        <span className="new-val">Lightning Fast</span>
                    </div>
                </div>
                <div className="stat-card improved">
                    <span className="stat-label">Digital Waste</span>
                    <div className="stat-change">
                        <span className="old-val">Cluttered</span>
                        <span className="arrow">→</span>
                        <span className="new-val">Cleaned</span>
                    </div>
                </div>
                <div className="stat-card improved">
                    <span className="stat-label">Privacy</span>
                    <div className="stat-change">
                        <span className="old-val">Exposed</span>
                        <span className="arrow">→</span>
                        <span className="new-val">Secured</span>
                    </div>
                </div>
            </div>

            <div className="weekly-suggestion">
                <div className="suggestion-icon">📅</div>
                <div className="suggestion-text">
                    <h4>Weekly Optimization</h4>
                    <p>Schedule your next scan in 7 days to maintain this score.</p>
                </div>
            </div>

            <button className="rescan-btn" onClick={onRescan}>
                <ScanIcon size={20} color="white" />
                Done
            </button>
        </div>
    );
};

export default GamifiedResults;
