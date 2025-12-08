import React, { useEffect, useState } from "react";
import "./GamifiedResults.css";
import { CheckCircleIcon, ScanIcon } from "./Icons";
import Confetti from "react-confetti";

const GamifiedResults = ({ onRescan, results }) => {
    const [showConfetti, setShowConfetti] = useState(true);
    const [score, setScore] = useState(0);

    // Parse results for display
    const actions = results?.actions || {};
    const networkStatus = actions.network?.status || "Boosted";

    // Format storage message
    let storageCleaned = "Optimized";
    if (actions.storage?.cleaned) {
        if (actions.storage.cleaned > 1024 * 1024) {
            storageCleaned = (actions.storage.cleaned / 1024 / 1024).toFixed(1) + " MB";
        } else {
            storageCleaned = (actions.storage.cleaned / 1024).toFixed(1) + " KB";
        }
    }

    const workerMsg = actions.workers?.removed > 0
        ? `${actions.workers.removed} Workers Removed`
        : "Background Optimized";

    const scoreBoost = results?.scoreImprovement || 14;
    const finalScore = 85 + scoreBoost > 100 ? 99 : 85 + scoreBoost;

    useEffect(() => {
        // Animate score from 0 to finalScore
        const interval = setInterval(() => {
            setScore((prev) => {
                if (prev >= finalScore) {
                    clearInterval(interval);
                    return finalScore;
                }
                return prev + 2;
            });
        }, 30);

        // Stop confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => {
            clearInterval(interval);
            clearTimeout(timer);
        };
    }, [finalScore]);

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
                        <span className="old-val">Standard</span>
                        <span className="arrow">→</span>
                        <span className="new-val">{networkStatus}</span>
                    </div>
                </div>
                <div className="stat-card improved">
                    <span className="stat-label">Digital Waste</span>
                    <div className="stat-change">
                        <span className="old-val">Cluttered</span>
                        <span className="arrow">→</span>
                        <span className="new-val">Cleaned {storageCleaned}</span>
                    </div>
                </div>
                <div className="stat-card improved">
                    <span className="stat-label">Background</span>
                    <div className="stat-change">
                        <span className="old-val">Active</span>
                        <span className="arrow">→</span>
                        <span className="new-val">{workerMsg}</span>
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
