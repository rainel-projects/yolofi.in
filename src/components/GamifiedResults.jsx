import React, { useEffect, useState } from "react";
import "./GamifiedResults.css";
import { CheckCircleIcon, ScanIcon, NetworkIcon, TrashIcon, CpuIcon, ShieldIcon } from "./Icons";

const GamifiedResults = ({ onRescan, results }) => {
    const [score, setScore] = useState(0);

    // Parse results for display
    const actions = results?.actions || {};
    const networkStatus = actions.network?.status || "Standard";
    const latency = actions.network?.latency ? `${Math.round(actions.network.latency)}ms` : "--";

    // Format storage message
    let storageCleaned = "0 KB";
    if (actions.storage?.cleaned) {
        if (actions.storage.cleaned > 1024 * 1024) {
            storageCleaned = (actions.storage.cleaned / 1024 / 1024).toFixed(1) + " MB";
        } else {
            storageCleaned = (actions.storage.cleaned / 1024).toFixed(1) + " KB";
        }
    }

    const workerMsg = actions.workers?.removed > 0
        ? `${actions.workers.removed} Stopped`
        : "Optimized";

    const memoryStatus = actions.memory?.status || "Normal";

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
        return () => clearInterval(interval);
    }, [finalScore]);

    return (
        <div className="gamified-results-container">

            <div className="results-header">
                <div className="score-badge" style={{ background: "white", border: "4px solid #10b981", color: "#10b981", boxShadow: "none" }}>
                    <span className="score-value">{score}</span>
                    <span className="score-label" style={{ color: "#374151" }}>Integrity</span>
                </div>
                <h2>System Optimized</h2>
                <p className="subtitle">Performance tuning completed successfully.</p>
            </div>

            <div className="stats-comparison">
                <div className="stat-card improved">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <NetworkIcon size={20} color="#10b981" />
                        <span className="stat-label">Network Latency</span>
                    </div>
                    <div className="stat-change plain-text">
                        <span className="new-val">{latency}</span>
                        <span className="sub-text">({networkStatus})</span>
                    </div>
                </div>

                <div className="stat-card improved">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <TrashIcon size={20} color="#10b981" />
                        <span className="stat-label">Storage Reclaimed</span>
                    </div>
                    <div className="stat-change plain-text">
                        <span className="new-val">{storageCleaned}</span>
                        <span className="sub-text">Junk Removed</span>
                    </div>
                </div>

                <div className="stat-card improved">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <CpuIcon size={20} color="#10b981" />
                        <span className="stat-label">Background Tasks</span>
                    </div>
                    <div className="stat-change plain-text">
                        <span className="new-val">{workerMsg}</span>
                        <span className="sub-text">Memory: {memoryStatus}</span>
                    </div>
                </div>
            </div>

            <div className="weekly-suggestion" style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                <div className="suggestion-icon">🛡️</div>
                <div className="suggestion-text">
                    <h4 style={{ color: "#1f2937" }}>System Maintenance</h4>
                    <p style={{ color: "#4b5563" }}>Next recommended scan: 7 Days</p>
                </div>
            </div>

            <button className="rescan-btn" onClick={onRescan}>
                <CheckCircleIcon size={20} color="white" />
                Return to Dashboard
            </button>
        </div>
    );
};

export default GamifiedResults;
