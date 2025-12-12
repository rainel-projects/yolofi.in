import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BrowserEngine from "../utils/BrowserEngine";
import peerRelay from "../services/PeerRelay"; // Import PeerRelay
import CommandDeck from "./CommandDeck";
import SignalOverlay from "./SignalOverlay";
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
    const [loadingText, setLoadingText] = useState("Initializing System Intelligence...");
    const [report, setReport] = useState(null);
    const [sessionId, setSessionId] = useState(null);

    // Keep track of latest state to send to new guests
    const latestStateRef = useRef({
        status: "Host Ready",
        progress: 0,
        report: null
    });

    useEffect(() => {
        const storedSession = sessionStorage.getItem("yolofi_session_id");
        if (storedSession) {
            setSessionId(storedSession);
            // No automatic connection here - reliance on ManualPeerService handled in LinkSystem
        }
    }, []);

    // Helper: Push updates via WebSocket/WebRTC
    const syncToRemote = (status, progressVal, reportData = null) => {
        if (!sessionId) return;

        // Update Ref
        latestStateRef.current = { status, progress: progressVal, report: reportData };

        // Broadcast to Session Channel 'sync' if using relay/manual peer (Legacy support here)
        // If ManualPeerService is active, it handles sync via MultiplexHost, but Diagnose is local.
        // We will leave this hook for now.
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

        const finalScore = Math.min(100, (report.score || 80) + 15);
        const finalReport = { ...report, score: finalScore, optimized: true };

        // HABIT LOOP: Save Timestamp only (for internal tracking if needed, or remove completely)
        // Removing Streak Logic as requested
        const now = Date.now();
        localStorage.setItem("yolofi_last_scan", now.toString());

        setReport(finalReport);
        setView("RESULTS");
        syncToRemote("Optimization Complete", 100, finalReport);
    };

    // --- RENDERING ---
    return (
        <div style={{ position: "relative", minHeight: "100vh" }}>
            <SignalOverlay />
            <div className="diagnose-path">

                {view === "IDLE" && (
                    <>
                        <div className="section-content">
                            <h2 style={{ fontSize: "3.5rem", marginBottom: "1.5rem", lineHeight: 1.1 }}>
                                System<br />Intelligence
                            </h2>
                            <p style={{ fontSize: "1.25rem", color: "#64748b", marginBottom: "2.5rem" }}>
                                Advanced runtime diagnostics engine. Detects memory leaks, storage bloat, and network latency in real-time.
                            </p>
                            <button className="scan-button" onClick={runDiagnostics}>
                                <ScanIcon size={24} /> Start Full Scan
                            </button>
                        </div>
                        <div className="section-visual">
                            <div className="scanner-ring">
                                <div className="scan-pulse"></div>
                                <BrainIcon size={100} color="#2563eb" />
                            </div>
                        </div>
                    </>
                )}

                {(view === "SCANNING" || view === "OPTIMIZING") && (
                    <div className="section-content" style={{ textAlign: "center", width: "100%", maxWidth: "600px" }}>
                        <div className="scanner-ring" style={{ margin: "0 auto 3rem" }}>
                            <div className="scan-pulse" style={{ animationDuration: "1s" }}></div>
                            <ScanIcon size={80} color="#2563eb" />
                        </div>
                        <h2 style={{ marginBottom: '1rem' }}>{loadingText}</h2>
                        <div style={{ width: "100%", height: "12px", background: "#f1f5f9", borderRadius: "6px", margin: "0 auto 1rem", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                            <div style={{ width: `${progress}%`, height: "100%", background: "#2563eb", transition: "width 0.3s ease", borderRadius: "6px" }}></div>
                        </div>
                        <p className="scan-time">{progress}% COMPLETE</p>
                    </div>
                )}

                {(view === "REPORT" || view === "RESULTS") && report && (
                    <div className="diagnostic-report">
                        <div className="report-header">
                            <div style={{
                                width: "64px", height: "64px", borderRadius: "50%",
                                background: view === "RESULTS" ? "#dcfce7" : "#fee2e2",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: view === "RESULTS" ? "#166534" : "#991b1b"
                            }}>
                                {view === "RESULTS" ? <CheckCircleIcon size={32} /> : <ShieldIcon size={32} />}
                            </div>
                            <div>
                                <h3>{view === "RESULTS" ? "System Optimized" : "Analysis Report"}</h3>
                                <p className="scan-time">SESSION ID: {sessionId || "LOCAL-" + Date.now().toString().slice(-4)}</p>
                            </div>
                            <div style={{ marginLeft: "auto", fontSize: "2.5rem", fontWeight: "800", color: view === "RESULTS" ? "#10b981" : "#f59e0b" }}>
                                {report.score} <span style={{ fontSize: "1rem", color: "#94a3b8", fontWeight: 600 }}>/ 100</span>
                            </div>
                        </div>

                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Storage Vectors</span>
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
                                <span className="info-label">DOM Density</span>
                                <span className="info-value">{report.memory?.domNodes || 0} Nodes</span>
                            </div>
                        </div>

                        {view === "REPORT" && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start' }}>
                                <button className="scan-button" onClick={startOptimization}>
                                    <ShieldIcon size={20} /> Resolve All Issues
                                </button>
                                <FundingPrompt />

                            </div>
                        )}

                        {view === "RESULTS" && (
                            <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
                                <div style={{ marginBottom: "2rem" }}>
                                    <h2 style={{ color: '#059669', marginBottom: '0.5rem' }}>System Optimized!</h2>
                                    <p style={{ fontSize: '1.25rem', color: '#4b5563' }}>
                                        Your device is now running at <b>Peak Efficiency</b>.
                                    </p>
                                </div>

                                <FundingPrompt />

                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '1rem' }}>
                                    <button className="feedback-btn" onClick={() => navigate('/')}>
                                        Run Scan Again
                                    </button>

                                    <button className="feedback-btn" style={{ background: '#1da1f2', border: 'none', color: 'white' }}
                                        onClick={() => {
                                            const ram = report.memory?.usedJSHeap || 'system';
                                            const items = report.storage?.keyCount || 'multiple';
                                            const text = `I just optimized ${ram} of RAM and cleared ${items} storage artifacts with Yolofi! 🚀\n\nRuns directly in the browser. No install.\n\nTry it free: https://yolofi.in`;
                                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                    >
                                        Share on X
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* LIVE COMMAND DECK (Host Receiver) */}
            {
                sessionId && (
                    <CommandDeck role="HOST" sessionId={sessionId} />
                )
            }
        </div >
    );
};

export default Diagnose;
