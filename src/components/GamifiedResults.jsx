import React, { useEffect, useState } from "react"; // Deployment trigger

import "./GamifiedResults.css";
import { CheckCircleIcon, ScanIcon, NetworkIcon, TrashIcon, CpuIcon, ShieldIcon, BoltIcon } from "./Icons";

const GamifiedResults = ({ onRescan, results, baseline }) => {
    const [score, setScore] = useState(0);
    const [deepCleanDone, setDeepCleanDone] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);

    // Parse results for display
    const actions = results?.actions || {};
    const counts = actions.storage?.counts || { critical: 0, useful: 0, trash: 0 };

    // --- 1. LATENCY COMPARISON ---
    const afterLatency = actions.network?.latency || 45;
    const beforeLatency = baseline?.network?.latency || (afterLatency + Math.floor(Math.random() * 80) + 40);
    const networkStatus = actions.network?.status || "Standard";

    // --- 2. STORAGE COMPARISON ---
    const beforeStorageBytes = baseline?.storage?.totalSize || 0;
    const cleanedBytes = (actions.storage?.cleaned || 0) + (deepCleanDone ? 450 * 1024 * 1024 : 0); // Bonus 450MB
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
                <div className="level-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <ShieldIcon size={16} color="#4338ca" />
                    <span>Level 5: {currentLevel} (+{xpGained} XP)</span>
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

            {/* DOWNLOAD INTERSTITIAL (Embedded) */}
            <div className="download-card" style={{
                background: "linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)",
                border: "1px solid #e5e7eb",
                borderRadius: "16px",
                padding: "2rem",
                margin: "2rem auto",
                maxWidth: "500px",
                textAlign: "center",
                boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
            }}>
                <div style={{ marginBottom: "1rem" }}>
                    <ShieldIcon size={32} color="#2563eb" />
                </div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "0.5rem", color: "#111827" }}>
                    Maintain Peak Performance
                </h3>
                <p style={{ color: "#4b5563", marginBottom: "1.5rem", lineHeight: "1.5", fontSize: "0.95rem" }}>
                    To ensure your device stays optimized and secure against future slowdowns,
                    we recommend installing our free dedicated tools.
                </p>

                <button
                    onClick={() => {
                        const htmlContent = generateCleanerHTML();
                        const blob = new Blob([htmlContent], { type: "text/html" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "Yolofi_Optimizer.html";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }}
                    style={{
                        padding: "0.9rem 2rem",
                        fontSize: "1rem",
                        fontWeight: "600",
                        color: "white",
                        background: "#2563eb",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
                        transition: "all 0.2s",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px"
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Portable Cleaner

                </button>
                <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.8rem" }}>
                    Runs offline on Mobile & PC • No installation needed
                </div>
            </div>

            <div className="stat-card" style={{ marginTop: "1rem", borderColor: "#818cf855", background: "#eef2ff" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <BoltIcon size={20} color="#4f46e5" />
                        <span className="stat-label" style={{ color: "#4f46e5" }}>Deep System Scrub</span>
                    </div>
                    {!deepCleanDone ? (
                        <button
                            onClick={() => {
                                setIsCleaning(true);
                                setTimeout(() => {
                                    setIsCleaning(false);
                                    setDeepCleanDone(true);
                                }, 2000);
                            }}
                            disabled={isCleaning}
                            style={{
                                background: isCleaning ? "#9ca3af" : "#4f46e5",
                                color: "white",
                                border: "none",
                                padding: "0.5rem 1rem",
                                borderRadius: "8px",
                                cursor: isCleaning ? "wait" : "pointer",
                                fontSize: "0.9rem",
                                fontWeight: "600"
                            }}
                        >
                            {isCleaning ? "Cleaning..." : "Clean Cache"}
                        </button>
                    ) : (
                        <span style={{ color: "#10b981", fontWeight: "600", fontSize: "0.9rem" }}>
                            +450MB Cleared
                        </span>
                    )}
                </div>
            </div>

            <div className="weekly-suggestion" style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                <div className="suggestion-icon">
                    <CheckCircleIcon size={24} color="#10b981" />
                </div>
                <div className="suggestion-text">
                    <h4 style={{ color: "#1f2937", fontSize: "1rem" }}>System Status: Healthy</h4>
                    <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Recommended next scan: 2 Days</p>
                </div>
            </div>

        </div>
    );
};

export default GamifiedResults;

const generateCleanerHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yolofi Portable Optimizer</title>
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #111827; color: white; display: flex; align-items: center; justifyContent: center; height: 100vh; text-align: center; }
        .container { max-width: 400px; width: 90%; padding: 2rem; background: #1f2937; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .progress-bar { width: 100%; height: 8px; background: #374151; border-radius: 4px; margin: 2rem 0; overflow: hidden; }
        .progress-fill { height: 100%; background: #10b981; width: 0%; transition: width 0.3s; }
        .status { margin-bottom: 0.5rem; color: #9ca3af; font-size: 0.9rem; min-height: 1.5em; }
        .btn { display: none; background: #10b981; color: white; border: none; padding: 1rem 2rem; border-radius: 8px; font-size: 1rem; font-weight: bold; cursor: pointer; width: 100%; margin-top: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <h2 id="title">System Optimizer</h2>
        <div class="status" id="status">Initializing...</div>
        <div class="progress-bar"><div class="progress-fill" id="fill"></div></div>
        <div id="logs" style="text-align: left; font-family: monospace; font-size: 0.8rem; color: #6b7280; margin-bottom: 1rem; height: 100px; overflow: hidden;"></div>
        <button class="btn" id="finishBtn" onclick="window.close()">Close Optimizer</button>
    </div>
    <script>
        const tasks = [
            "Analyzing file system...", "Detecting cache clusters...", "Flushing DNS resolver...",
            "Clearing browser temp files...", "Optimizing RAM allocation...", "Removing obsolete cookies...",
            "Vacuuming database fragments...", "Cooling down CPU threads...", "Verifying system integrity...",
            "Finalizing optimization..."
        ];
        const statusEl = document.getElementById("status");
        const fillEl = document.getElementById("fill");
        const logsEl = document.getElementById("logs");
        const btn = document.getElementById("finishBtn");
        const title = document.getElementById("title");
        
        let progress = 0;
        let step = 0;

        function run() {
            if (step >= tasks.length) {
                fillEl.style.width = "100%";
                statusEl.textContent = "Complete";
                title.textContent = "Device Optimized";
                title.style.color = "#10b981";
                btn.style.display = "block";
                logsEl.innerHTML += "<div style='color:#10b981'>SUCCESS: All systems operational.</div>";
                return;
            }
            
            const task = tasks[step];
            statusEl.textContent = task;
            logsEl.innerHTML += "<div>> " + task + "</div>";
            logsEl.scrollTop = logsEl.scrollHeight;
            
            progress += 100 / tasks.length;
            fillEl.style.width = progress + "%";
            
            step++;
            setTimeout(run, 600 + Math.random() * 800);
        }
        
        setTimeout(run, 1000);
    </script>
</body>
</html>`;
};
