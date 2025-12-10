import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import manualPeer from "../services/ManualPeerService";
import CommandDeck from "./CommandDeck";
import SignalOverlay from "./SignalOverlay";
import FundingPrompt from "./FundingPrompt";
import { ShieldIcon, CheckCircleIcon, ScanIcon } from "./Icons";
import "./Diagnose.css";

const RemoteView = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null); // { status, progress, report }
    const [status, setStatus] = useState("CONNECTING"); // CONNECTING, MATCHED, LIVE, DISCONNECTED
    const [debugInfo, setDebugInfo] = useState("");

    useEffect(() => {
        // Verify Connection
        if (!manualPeer.peerConnection || (manualPeer.peerConnection.connectionState !== 'connected' && manualPeer.peerConnection.connectionState !== 'connecting')) {
            console.warn("No active P2P connection found.");
            setStatus("DISCONNECTED");
            setDebugInfo("Manual Connection not found. Please re-connect via Link.");
        } else {
            setStatus("MATCHED");
            // Request Initial State immediately
            manualPeer.send({ channel: 'sync', type: 'request-sync' });
        }

        // Listen for Updates
        const handleData = (payload) => {
            if (payload.channel === 'sync' && payload.type === 'state-update') {
                console.log("📥 State Received:", payload.data);
                setData(payload.data);
                setStatus("LIVE");
            }
        };

        const handleConnectionState = (state) => {
            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                setStatus("DISCONNECTED");
            }
        };

        manualPeer.on('data', handleData);
        manualPeer.on('connectionStateChange', handleConnectionState);

        return () => {
            manualPeer.off('data', handleData);
            manualPeer.off('connectionStateChange', handleConnectionState);
        };
    }, [sessionId]);

    if (status === "CONNECTING" || status === "MATCHED") {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f9fafb" }}>
                <div style={{ textAlign: "center" }}>
                    <div className="spinner-ring" style={{ margin: "0 auto 1rem" }}></div>
                    <div style={{ fontSize: "1.5rem", color: "#6b7280" }}>
                        {status === "MATCHED" ? "Synchronizing State..." : "Establishing Secure Link..."}
                    </div>
                </div>
            </div>
        );
    }

    if (status === "DISCONNECTED") {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f9fafb" }}>
                <div style={{ textAlign: "center", padding: "2rem", background: "white", borderRadius: "16px", border: "1px solid #fee2e2", maxWidth: "400px" }}>
                    <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>Signal Lost</h2>
                    <p style={{ color: "#6b7280", marginBottom: "1rem" }}>The remote session has ended or is invalid.</p>
                    {debugInfo && <p style={{ fontSize: '0.8rem', color: '#999' }}>{debugInfo}</p>}
                    <button onClick={() => navigate('/link')} className="scan-button" style={{ background: "#ef4444", border: "none" }}>Return to Hub</button>
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
                    <h2 style={{ fontSize: "2.5rem", marginBottom: "1.5rem" }}>Connected to Host</h2>
                    <p style={{ fontSize: "1.25rem", color: "#10b981", marginBottom: "2rem", fontWeight: "600" }}>
                        ● Live Sync Active
                    </p>
                    <p style={{ color: "#4b5563" }}>
                        Waiting for the host to start the diagnostic scan. Results will appear here automatically.
                    </p>
                </div>
                <div className="section-visual">
                    <div className="scanner-ring">
                        <div className="scan-pulse"></div>
                        <ShieldIcon size={80} color="#10b981" />
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
                    <div className="section-content" style={{ textAlign: "center", width: "100%" }}>
                        <div className="scanner-ring" style={{ margin: "0 auto 2rem" }}>
                            <div className="scan-pulse" style={{ animationDuration: "1s" }}></div>
                            <ScanIcon size={60} color="#2563eb" />
                        </div>
                        <h2>{data.status}</h2>
                        <div style={{ width: "100%", maxWidth: "400px", height: "8px", background: "#e5e7eb", borderRadius: "4px", margin: "1.5rem auto", overflow: "hidden" }}>
                            <div style={{ width: `${data.progress}%`, height: "100%", background: "#2563eb", transition: "width 0.3s ease" }}></div>
                        </div>
                        <p className="scan-time">{data.progress}% COMPLETE</p>
                    </div>
                ) : (
                    // REPORT VIEW
                    data && data.report && (
                        <div className="diagnostic-report">
                            <div className="report-header">
                                <div style={{
                                    width: "48px", height: "48px", borderRadius: "50%",
                                    background: data.status.includes("Optimization Complete") ? "#dcfce7" : "#fee2e2",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: data.status.includes("Optimization Complete") ? "#166534" : "#991b1b"
                                }}>
                                    {data.status.includes("Optimization Complete") ? <CheckCircleIcon size={28} /> : <ShieldIcon size={28} />}
                                </div>
                                <div>
                                    <h3>{data.status.includes("Optimization Complete") ? "System Optimized" : "Issue Detection Report"}</h3>
                                    <p className="scan-time">OBSERVER MODE • {sessionId || "P2P"}</p>
                                </div>
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Storage Junk</span>
                                    <span className="info-value">{data.report.storage?.issues?.length || data.report.storage?.keyCount || 0} Files</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Memory Heap</span>
                                    <span className="info-value">{data.report.memory?.usage || data.report.memory?.usedJSHeap || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">DOM Nodes</span>
                                    <span className="info-value">{data.report.dom?.totalNodes || data.report.memory?.domNodes || "N/A"}</span>
                                </div>
                            </div>

                            {data.status.includes("Optimization Complete") && (
                                <div style={{ textAlign: "center", marginTop: "2rem", color: "#10b981" }}>
                                    <p>Host system has been optimized.</p>
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
