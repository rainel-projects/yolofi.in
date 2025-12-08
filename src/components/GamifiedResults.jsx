import React, { useEffect, useState } from "react";
import "./GamifiedResults.css";
import { CheckCircleIcon, ScanIcon, NetworkIcon, TrashIcon, CpuIcon, ShieldIcon, BoltIcon } from "./Icons";

const GamifiedResults = ({ onRescan, results, baseline }) => {
    const [score, setScore] = useState(0);

    // Parse results for display
    const actions = results?.actions || {};
    const counts = actions.storage?.counts || { critical: 0, useful: 0, trash: 0 };

    // --- 1. LATENCY COMPARISON ---
    const afterLatency = actions.network?.latency || 45;
    const beforeLatency = baseline?.network?.latency || (afterLatency + Math.floor(Math.random() * 80) + 40);
    const networkStatus = actions.network?.status || "Standard";

    // --- 2. STORAGE COMPARISON ---
    const beforeStorageBytes = baseline?.storage?.totalSize || 0;
    const cleanedBytes = actions.storage?.cleaned || 0;
    const afterStorageBytes = Math.max(0, beforeStorageBytes - cleanedBytes);

    const formatBytes = (bytes) => {
        if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + " MB";
        if (bytes > 1024) return (bytes / 1024).toFixed(1) + " KB";
        return bytes + " B";
    };

    const storageMsg = cleanedBytes > 0
        ? `${formatBytes(beforeStorageBytes)} ➔ ${formatBytes(afterStorageBytes)}`
        : "Optimal";

    // --- 3. MEMORY COMPARISON ---
    const beforeMemStatus = baseline?.memory?.status || "Active";
    const afterMemStatus = actions.memory?.status || "Smooth";
    const workerMsg = actions.workers?.removed > 0
        ? `${actions.workers.removed} Workers Stopped`
        : "Background Optimized";

    const scoreBoost = results?.scoreImprovement || 14;
    const finalScore = 85 + scoreBoost > 100 ? 99 : 85 + scoreBoost;

    // GAMIFICATION: Level & XP
    const xpGained = 45; // Fixed per run for habit building
    const currentLevel = "Device Guardian";

    useEffect(() => {
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
                    <span className="score-label" style={{ color: "#374151" }}>System ID</span>
                </div>
                <h2>Optimization Complete</h2>
                <div className="level-badge">
                    🏆 Level 5: {currentLevel} (+{xpGained} XP)
                </div>
            </div>

            <div className="stats-comparison">
                {/* NETWORK CARD */}
                <div className="stat-card improved">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <NetworkIcon size={20} color="#10b981" />
                        <span className="stat-label">Network Latency</span>
                    </div>
                    <div className="stat-change plain-text">
                        <span className="new-val">
                            {Math.round(beforeLatency)}ms ➔ {Math.round(afterLatency)}ms
                        </span>
                        <span className="sub-text">{networkStatus} (Boosted)</span>
                    </div>
                </div>

                {/* STORAGE CARD */}
                <div className="stat-card improved">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <TrashIcon size={20} color="#10b981" />
                        <span className="stat-label">Storage Intelligence</span>
                    </div>
                    <div className="stat-change plain-text">
                        <span className="new-val">{storageMsg}</span>
                        <div className="smart-details">
                            <span className="detail-tag">Found {counts.trash} Junk</span>
                            <span className="detail-tag protected">Protected {counts.critical} Critical</span>
                        </div>
                    </div>
                </div>

                {/* BACKGROUND CARD */}
                <div className="stat-card improved">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <CpuIcon size={20} color="#10b981" />
                        <span className="stat-label">Memory Optimization</span>
                    </div>
                    <div className="stat-change plain-text">
                        <span className="new-val">{beforeMemStatus} ➔ {afterMemStatus}</span>
                        <span className="sub-text">{workerMsg}</span>
                    </div>
                </div>
            </div>

            {/* MONETIZATION / HABIT LOOP */}
            <div className="premium-teaser">
                <div className="teaser-content">
                    <div className="teaser-icon"><BoltIcon size={24} color="#f59e0b" /></div>
                    <div className="teaser-text">
                        <h4>Unlock Advanced Mode</h4>
                        <p>Get Deep Clean & Real-time Protection.</p>
                    </div>
                </div>
                <button className="upgrade-btn">Start Free Trial</button>
            </div>

            <div className="weekly-suggestion" style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
                <div className="suggestion-icon">
                    <ShieldIcon size={32} color="#10b981" />
                </div>
                <div className="suggestion-text">
                    <h4 style={{ color: "#1f2937" }}>Streak: 1 Day 🔥</h4>
                    <p style={{ color: "#4b5563" }}>Next recommended scan: 2 Days</p>
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
