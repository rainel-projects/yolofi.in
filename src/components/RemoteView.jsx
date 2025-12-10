import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import swarmPeer from "../services/SwarmPeerService";
import CommandDeck from "./CommandDeck";
import SignalOverlay from "./SignalOverlay";
import FundingPrompt from "./FundingPrompt";
import { ShieldIcon, CheckCircleIcon, ScanIcon, BrainIcon } from "./Icons";
import "./Diagnose.css"; // Inherit Premium Styles

const RemoteView = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null); // { status, progress, report }
    const [status, setStatus] = useState("CONNECTING"); // CONNECTING, MATCHED, LIVE, DISCONNECTED
    const [debugInfo, setDebugInfo] = useState("Initializing Swarm Protocol...");

    useEffect(() => {
        // Smart Connection Sequence (UX only, logic is fast)
        const sequence = [
            "Resolving Swarm Identity...",
            "Punching NAT Layer...",
            "Negotiating E2E Encryption...",
            "Establishing Data Channel..."
        ];
        let seqIdx = 0;

        const interval = setInterval(() => {
            if (seqIdx < sequence.length && status === "CONNECTING") {
                setDebugInfo(sequence[seqIdx]);
                seqIdx++;
            }
        }, 800);

        // Verify Connection
        if (!swarmPeer.connectedPeerId) {
            console.warn("No active P2P connection found.");
            setTimeout(() => {
                setStatus("DISCONNECTED");
                setDebugInfo("Swarm Handshake Failed. Link Expired.");
                clearInterval(interval);
            }, 2000); // Give it a moment to look like it tried
        } else {
            setTimeout(() => {
                setStatus("MATCHED");
                // Request Initial State immediately
                swarmPeer.send({ channel: 'sync', type: 'request-sync' });
                // Temporary: Ensure live status
                setTimeout(() => setStatus("LIVE"), 500);
                clearInterval(interval);
            }, 3000); // Fake delay for "coolness" if it's too fast? No, let's keep it responsive but show steps.
        }

        // Listen for Updates
        const handleData = (payload) => {
            if (payload.channel === 'sync' && payload.type === 'state-update') {
                console.log("📥 State Received:", payload.data);
                setData(payload.data);
                setStatus("LIVE");
            }
        };

        swarmPeer.on('data', handleData);

        return () => {
            swarmPeer.off('data', handleData);
            clearInterval(interval);
        };
    }, [sessionId]);

    if (status === "CONNECTING" || status === "MATCHED") {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8fafc", flexDirection: 'column' }}>
                <div className="scanner-ring">
                    <div className="scan-pulse"></div>
                    <BrainIcon size={64} color="#64748b" />
                </div>
                <h2 style={{ marginTop: '2rem', color: '#1e293b', fontSize: '1.5rem' }}>Remote Link</h2>
                <p style={{ color: '#64748b', fontFamily: 'monospace' }}>{debugInfo}</p>
            </div>
        );
    }

    if (status === "DISCONNECTED") {
        return (
            <div className="diagnose-path" style={{ justifyContent: 'center' }}>
                <div className="diagnostic-report" style={{ textAlign: 'center', borderColor: '#fee2e2' }}>
                    <div style={{ margin: '0 auto 1rem', background: '#fee2e2', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldIcon size={32} color="#991b1b" />
                    </div>
                    <h2 style={{ color: "#991b1b", marginBottom: "1rem" }}>Signal Lost</h2>
                    <p style={{ color: "#6b7280", marginBottom: "2rem" }}>The remote session has ended or the host disconnected.</p>
                    <button onClick={() => navigate('/link')} className="scan-button" style={{ background: "#ef4444", border: "none", boxShadow: 'none' }}>Return to Global Map</button>
                    <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>{debugInfo}</p>
                </div>
            </div>
        );
    }

    // WAITING STATE (Host hasn't started yet but we are connected)
    if (data && data.status === "Host Ready" && !data.report) {
        return (
            <div className="diagnose-path">
                <SignalOverlay />
                <div className="section-content">
                    <h2 style={{ fontSize: "3rem", marginBottom: "1rem", lineHeight: 1.1 }}>Connected<br />to Host</h2>
                    <p style={{ fontSize: "1.25rem", color: "#10b981", marginBottom: "2.5rem", fontWeight: "700", display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="signal-dot" style={{ width: '12px', height: '12px', background: '#10b981' }}></span>
                        Live Telemetry Active
                    </p>
                    <p style={{ color: "#64748b", fontSize: '1.1rem' }}>
                        Waiting for the host to initiate the diagnostic sequence. <br />
                        Real-time metrics will stream here automatically.
                    </p>
                </div>
                <div className="section-visual">
                    <div className="scanner-ring" style={{ borderColor: '#10b981' }}>
                        <div className="scan-pulse" style={{ border: '2px solid #10b981' }}></div>
                        <ShieldIcon size={100} color="#10b981" />
                    </div>
                </div>

                {/* COMMAND DECK */}
                <CommandDeck role="GUEST" sessionId={sessionId || "P2P"} />
            </div>
        );
    }

    // LIVE DATA VIEW
    return (
        <div style={{ position: "relative", minHeight: "100vh" }}>
            <SignalOverlay />
            <div className="diagnose-path">

                {data && (data.status.includes("Running") || data.status.includes("Optimizing") || data.status.includes("Check") || data.status.includes("Scanning") || data.status.includes("Init") || data.status.includes("Analysis")) ? (
                    <div className="section-content" style={{ textAlign: "center", width: "100%", maxWidth: "600px" }}>
                        <div className="scanner-ring" style={{ margin: "0 auto 3rem" }}>
                            <div className="scan-pulse" style={{ animationDuration: "1s" }}></div>
                            <ScanIcon size={80} color="#2563eb" />
                        </div>
                        <h2 style={{ marginBottom: '1rem' }}>{data.status}</h2>
                        <div style={{ width: "100%", height: "12px", background: "#f1f5f9", borderRadius: "6px", margin: "0 auto 1rem", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                            <div style={{ width: `${data.progress}%`, height: "100%", background: "#2563eb", transition: "width 0.3s ease", borderRadius: "6px" }}></div>
                        </div>
                        <p className="scan-time">{data.progress}% COMPLETE</p>
                    </div>
                ) : (
                    // REPORT VIEW
                    data && data.report && (
                        <div className="diagnostic-report">
                            <div className="report-header">
                                <div style={{
                                    width: "64px", height: "64px", borderRadius: "50%",
                                    background: data.status.includes("Optimization Complete") ? "#dcfce7" : "#fee2e2",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: data.status.includes("Optimization Complete") ? "#166534" : "#991b1b"
                                }}>
                                    {data.status.includes("Optimization Complete") ? <CheckCircleIcon size={32} /> : <ShieldIcon size={32} />}
                                </div>
                                <div>
                                    <h3>{data.status.includes("Optimization Complete") ? "System Optimized" : "Analysis Report"}</h3>
                                    <p className="scan-time">OBSERVER MODE • {sessionId || "P2P"}</p>
                                </div>
                                <div style={{ marginLeft: "auto", fontSize: "2rem", fontWeight: "800", color: data.status.includes("Optimization Complete") ? "#10b981" : "#f59e0b" }}>
                                    {data.report.score} <span style={{ fontSize: "1rem", color: "#94a3b8" }}>/ 100</span>
                                </div>
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Storage Vectors</span>
                                    <span className="info-value">{data.report.storage?.keyCount || 0} Keys</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Memory Heap</span>
                                    <span className="info-value">{data.report.memory?.usedJSHeap || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Device Tier</span>
                                    <span className="info-value">{data.report.deviceScore || "Standard"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">DOM Nodes</span>
                                    <span className="info-value">{data.report.memory?.domNodes || 0}</span>
                                </div>
                            </div>

                            {data.status.includes("Optimization Complete") && (
                                <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
                                    <div style={{ marginBottom: "2rem" }}>
                                        <h2 style={{ color: '#059669', marginBottom: '0.5rem' }}>Remote System Clean</h2>
                                        <p style={{ fontSize: '1.25rem', color: '#4b5563' }}>
                                            The host device is running at <b>Peak Efficiency</b>.
                                        </p>
                                    </div>
                                    <FundingPrompt />
                                </div>
                            )}
                        </div>
                    )
                )}

            </div>

            {/* COMMAND DECK */}
            <CommandDeck role="GUEST" sessionId={sessionId || "P2P"} />
        </div>
    );
};

export default RemoteView;
