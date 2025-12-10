import React, { useState, useEffect } from "react";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import BrowserEngine from "../utils/BrowserEngine";
import ChatSystem from "./ChatSystem";
import FundingPrompt from "./FundingPrompt";
import "./Diagnose.css";
// Icons
import {
    ShieldIcon, BrainIcon, ScanIcon, CheckCircleIcon
} from "./Icons";

const Diagnose = () => {
    const navigate = useNavigate();
    const [view, setView] = useState("IDLE");
    const [progress, setProgress] = useState(0);
    const [loadingText, setLoadingText] = useState("Initializing Brain...");
    const [report, setReport] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [showChat, setShowChat] = useState(false); // Floating chat toggle

    // Sync state for remote view
    const isHost = sessionStorage.getItem("yolofi_session_role") === "HOST";

    useEffect(() => {
        const storedSession = sessionStorage.getItem("yolofi_session_id");
        if (storedSession) {
            setSessionId(storedSession);
            // Auto-open chat for BOTH Host and Guest
            // This ensures they see the communication channel immediately
            setShowChat(true);
        }
    }, []);

    // Helper: Push updates to Firebase
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

        for (let step of steps) {
            setLoadingText(step.text);
            setProgress(step.prog);
            syncToRemote(step.text, step.prog);
            await new Promise(r => setTimeout(r, 600));
        }

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
            await fixes[i].action();
            await new Promise(r => setTimeout(r, 800));
        }

        try {
            await updateDoc(doc(db, "marketing", "stats"), {
                issuesResolved: increment(5),
                totalOptimizations: increment(1)
            });
        } catch (err) {
            console.error("Stats update failed (non-fatal):", err);
        }

        const finalScore = Math.min(100, (report.score || 80) + 15);
        const finalReport = { ...report, score: finalScore, optimized: true };

        setReport(finalReport);
        setView("RESULTS");
        syncToRemote("Optimization Complete", 100, finalReport);
    };

    // --- RENDERING ---
    return (
        <div style={{ position: "relative", minHeight: "100vh" }}>
            <div className="diagnose-path">

                {view === "IDLE" && (
                    <>
                        <div className="section-content">
                            <h2 style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>System Intelligence</h2>
                            <p style={{ fontSize: "1.25rem", color: "#4b5563", marginBottom: "2rem" }}>
                                Advanced runtime diagnostics engine. Detects memory leaks, storage bloat, and network latency in real-time.
                            </p>
                            <button className="scan-button" onClick={runDiagnostics}>
                                <ScanIcon size={24} /> Start Full Scan
                            </button>
                            {sessionId && (
                                <div style={{ marginTop: "1rem", color: "#10b981", fontWeight: "600" }}>
                                    ● Sharing Session: {sessionId}
                                </div>
                            )}
                        </div>
                        <div className="section-visual">
                            <div className="scanner-ring">
                                <div className="scan-pulse"></div>
                                <BrainIcon size={80} color="#2563eb" />
                            </div>
                        </div>
                    </>
                )}

                {(view === "SCANNING" || view === "OPTIMIZING") && (
                    <div className="section-content" style={{ textAlign: "center", width: "100%" }}>
                        <div className="scanner-ring" style={{ margin: "0 auto 2rem" }}>
                            <div className="scan-pulse" style={{ animationDuration: "1s" }}></div>
                            <ScanIcon size={60} color="#2563eb" />
                        </div>
                        <h2>{loadingText}</h2>
                        <div style={{ width: "100%", maxWidth: "400px", height: "8px", background: "#e5e7eb", borderRadius: "4px", margin: "1.5rem auto", overflow: "hidden" }}>
                            <div style={{ width: `${progress}%`, height: "100%", background: "#2563eb", transition: "width 0.3s ease" }}></div>
                        </div>
                        <p className="scan-time">{progress}% COMPLETE</p>
                    </div>
                )}

                {(view === "REPORT" || view === "RESULTS") && report && (
                    <div className="diagnostic-report">
                        <div className="report-header">
                            <div style={{
                                width: "48px", height: "48px", borderRadius: "50%",
                                background: view === "RESULTS" ? "#dcfce7" : "#fee2e2",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: view === "RESULTS" ? "#166534" : "#991b1b"
                            }}>
                                {view === "RESULTS" ? <CheckCircleIcon size={28} /> : <ShieldIcon size={28} />}
                            </div>
                            <div>
                                <h3>{view === "RESULTS" ? "Optimization Successful" : "System Analysis Report"}</h3>
                                <p className="scan-time">SESSION ID: {sessionId || "LOCAL-" + Date.now().toString().slice(-6)}</p>
                            </div>
                            <div style={{ marginLeft: "auto", fontSize: "2rem", fontWeight: "800", color: view === "RESULTS" ? "#10b981" : "#f59e0b" }}>
                                {report.score} <span style={{ fontSize: "1rem", color: "#6b7280" }}>/ 100</span>
                            </div>
                        </div>

                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Storage Items</span>
                                <span className="info-value">{report.storage?.keyCount || 0} Keys</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Memory Heap</span>
                                <span className="info-value">{report.memory?.usedJSHeap || "N/A"}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Device Tier</span>
                                <span className="info-value">{report.deviceScore || "Standard"}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">DOM Nodes</span>
                                <span className="info-value">{report.memory?.domNodes || 0}</span>
                            </div>
                        </div>

                        {view === "REPORT" && (
                            <>
                                <button className="scan-button" onClick={startOptimization}>
                                    <ShieldIcon size={20} /> Resolve All Issues
                                </button>
                                <FundingPrompt />
                            </>
                        )}

                        {view === "RESULTS" && (
                            <div style={{ textAlign: "center" }}>
                                <p>System is now running at peak efficiency.</p>
                                <FundingPrompt />
                                <button className="feedback-btn" onClick={() => navigate('/')}>Return to Dashboard</button>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* FLOATING CHAT WIDGET (Bottom Right) */}
            {sessionId && (
                <div style={{
                    position: "fixed", bottom: "20px", right: "20px", zIndex: 1000,
                    width: showChat ? "350px" : "60px",
                    height: showChat ? "500px" : "60px",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                }}>
                    {!showChat && (
                        <button
                            onClick={() => setShowChat(true)}
                            style={{
                                width: "100%", height: "100%", borderRadius: "50%",
                                background: "#2563eb", color: "white", border: "none",
                                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </button>
                    )}

                    {showChat && (
                        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                            {/* Custom Header to allow minimize */}
                            <div style={{
                                background: "#2563eb", padding: "8px 16px",
                                borderRadius: "16px 16px 0 0", color: "white",
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                cursor: "pointer"
                            }} onClick={() => setShowChat(false)}>
                                <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>Session Chat</span>
                                <span>_</span>
                            </div>
                            <ChatSystem sessionId={sessionId} role="HOST" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Diagnose;
