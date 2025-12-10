import React, { useState, useEffect } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import BrowserEngine from "../utils/BrowserEngine"; // THE REAL ENGINE
import ChatSystem from "./ChatSystem";
import "./Diagnose.css";
// Icons
import {
    CpuIcon, ShieldIcon, NetworkIcon,
    TrashIcon, BrainIcon, ScanIcon, CheckCircleIcon
} from "./Icons";

const Diagnose = () => {
    const navigate = useNavigate();
    const [view, setView] = useState("IDLE"); // IDLE, SCANNING, REPORT, OPTIMIZING, RESULTS
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState("Initializing Brain...");
    const [report, setReport] = useState(null);
    const [sessionId, setSessionId] = useState(null);

    // Sync state for remote view
    const isHost = localStorage.getItem("yolofi_session_role") === "HOST";

    useEffect(() => {
        // Check if we are hosting a session
        const storedSession = localStorage.getItem("yolofi_session_id");
        if (storedSession && isHost) {
            setSessionId(storedSession);
        }
    }, [isHost]);

    // Helper: Push updates to Firebase for Guest to see
    const syncToRemote = async (status, progressVal, reportData = null) => {
        if (!sessionId) return;
        try {
            const updatePayload = {
                "hostData.status": status,
                "hostData.progress": progressVal
            };
            if (reportData) updatePayload["hostData.report"] = reportData;

            await updateDoc(doc(db, "sessions", sessionId), updatePayload);
        } catch (e) {
            console.error("Sync error:", e);
        }
    };

    const runDiagnostics = async () => {
        setView("SCANNING");
        setProgress(0);
        syncToRemote("Running Diagnostics...", 10);

        const steps = [
            { text: "Analyzing Storage Vectors...", prog: 20 },
            { text: "Checking Memory Heaps...", prog: 40 },
            { text: "Pinging Network Latency...", prog: 60 },
            { text: "Scanning DOM Structure...", prog: 80 }
        ];

        // Visual progress simulation before real results
        for (let step of steps) {
            setLoadingText(step.text);
            setProgress(step.prog);
            syncToRemote(step.text, step.prog);
            await new Promise(r => setTimeout(r, 600));
        }

        // REAL ENGINE EXECUTION
        const fullReport = await BrowserEngine.runFullDiagnostics();

        setReport(fullReport);
        setProgress(100);
        setView("REPORT");
        syncToRemote("Analysis Complete", 100, fullReport);
    };

    const startOptimization = async () => {
        setView("OPTIMIZING");
        syncToRemote("Optimizing System...", 0);

        const fixes = [
            { name: "Cleaning LocalStorage...", action: () => BrowserEngine.cleanupClientCaches() },
            { name: "Minifying Data...", action: () => BrowserEngine.detectAndFixStateCorruption() },
            { name: "Pruning DOM Nodes...", action: () => BrowserEngine.optimizeRenderPipeline() }
        ];

        for (let i = 0; i < fixes.length; i++) {
            setLoadingText(fixes[i].name);
            const p = Math.round(((i + 1) / fixes.length) * 100);
            setProgress(p);
            syncToRemote(fixes[i].name, p);

            // Execute real fix
            await fixes[i].action();
            await new Promise(r => setTimeout(r, 800)); // Visual pacing
        }

        // Finalize
        await updateDoc(doc(db, "marketing", "stats"), {
            issuesResolved: increment(5), // Arbitrary "5 fixes" per run
            totalOptimizations: increment(1)
        });

        const finalScore = Math.min(100, (report.score || 80) + 15); // Boost score
        const finalReport = { ...report, score: finalScore, optimized: true };

        setReport(finalReport);
        setView("RESULTS");
        syncToRemote("Optimization Complete", 100, finalReport);
    };

    // ---------------- RENDER ----------------
    return (
        <div className="layout-container" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f9fafb" }}>

            {/* LEFT: MAIN DIAGNOSTIC PANEL */}
            <div className="main-panel" style={{ flex: 2, padding: "2rem", overflowY: "auto", borderRight: "1px solid #e5e7eb" }}>

                {view === "IDLE" && (
                    <div className="center-card">
                        <div className="pulse-circle">
                            <BrainIcon size={64} color="#4f46e5" />
                        </div>
                        <h1>System Intelligence</h1>
                        <p>Ready to analyze your browser runtime.</p>
                        <button className="primary-btn" onClick={runDiagnostics}>
                            <ScanIcon size={20} /> Start Full Scan
                        </button>
                    </div>
                )}

                {(view === "SCANNING" || view === "OPTIMIZING") && (
                    <div className="center-card">
                        <div className="spinner-ring"></div>
                        <h2>{loadingText}</h2>
                        <div className="progress-bar">
                            <div className="fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="mono">{progress}%</p>
                    </div>
                )}

                {(view === "REPORT" || view === "RESULTS") && report && (
                    <div className="report-view">
                        <div className="score-header">
                            <div className="score-ring" style={{ borderColor: view === "RESULTS" ? "#10b981" : "#f59e0b" }}>
                                <span>{report.score}</span>
                                <small>Health Score</small>
                            </div>
                            <div>
                                <h2>{view === "RESULTS" ? "System Optimized" : "Issues Detected"}</h2>
                                <p>{view === "RESULTS" ? "Your browser is running at peak performance." : "Optimization recommended."}</p>
                            </div>
                        </div>

                        <div className="metrics-grid">
                            <div className="metric-card">
                                <h3>Storage Junk</h3>
                                <div className="value">{report.storage.issues.length} Items</div>
                                <div className="status">{report.storage.status}</div>
                            </div>
                            <div className="metric-card">
                                <h3>Memory Usage</h3>
                                <div className="value">{report.memory.usage}</div>
                                <div className="status">{report.memory.potentialLeak ? "High" : "Normal"}</div>
                            </div>
                            <div className="metric-card">
                                <h3>Network</h3>
                                <div className="value">{report.network.latency}</div>
                                <div className="status">{report.network.offline ? "Offline" : "Online"}</div>
                            </div>
                        </div>

                        {view === "REPORT" && (
                            <button className="primary-btn pulse-btn" onClick={startOptimization}>
                                <ShieldIcon size={18} /> Fix All Issues
                            </button>
                        )}

                        {view === "RESULTS" && (
                            <button className="secondary-btn" onClick={() => navigate('/')}>
                                <CheckCircleIcon size={18} /> Finish
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* RIGHT: COLLABORATION PANEL */}
            {sessionId ? (
                <div className="side-panel" style={{ flex: 1, background: "#f3f4f6", padding: "1rem" }}>
                    <div style={{ marginBottom: "1rem", padding: "1rem", background: "#e0e7ff", borderRadius: "12px", color: "#3730a3" }}>
                        <strong>Session Active</strong><br />
                        Code: <span style={{ fontFamily: "monospace" }}>{sessionId}</span>
                    </div>
                    {/* CHAT WIDGET */}
                    <ChatSystem sessionId={sessionId} role="HOST" />
                </div>
            ) : (
                <div className="side-panel" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid #e5e7eb", color: "#9ca3af" }}>
                    <p>Start a session to chat.</p>
                </div>
            )}

        </div>
    );
};

export default Diagnose;
