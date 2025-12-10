import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import ChatSystem from "./ChatSystem";
import FundingPrompt from "./FundingPrompt";
import { ShieldIcon, BrainIcon, CheckCircleIcon, ScanIcon, NetworkIcon } from "./Icons";
import "./Diagnose.css"; // Shared styles

const RemoteView = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [status, setStatus] = useState("CONNECTING"); // CONNECTING, LIVE, DISCONNECTED
    const [showChat, setShowChat] = useState(false); // Floating chat

    useEffect(() => {
        if (!sessionId) return;

        // Auto-open chat for guests too
        setShowChat(true);

        const sessionRef = doc(db, "sessions", sessionId);
        const unsubscribe = onSnapshot(sessionRef, (docSnap) => {
            if (docSnap.exists()) {
                const sessionData = docSnap.data();
                setData(sessionData.hostData);
                setStatus("LIVE");
            } else {
                setStatus("DISCONNECTED");
            }
        }, (error) => {
            console.error("Sync error:", error);
            setStatus("DISCONNECTED");
        });

        return () => unsubscribe();
    }, [sessionId]);

    if (status === "CONNECTING") {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f9fafb" }}>
                <div style={{ textAlign: "center" }}>
                    <div className="spinner-ring" style={{ margin: "0 auto 1rem" }}></div>
                    <div style={{ fontSize: "1.5rem", color: "#6b7280" }}>Establishing Secure Link...</div>
                </div>
            </div>
        );
    }

    if (status === "DISCONNECTED") {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f9fafb" }}>
                <div style={{ textAlign: "center", padding: "2rem", background: "white", borderRadius: "16px", border: "1px solid #fee2e2" }}>
                    <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>Signal Lost</h2>
                    <p style={{ color: "#6b7280", marginBottom: "2rem" }}>The remote session has ended or is invalid.</p>
                    <button onClick={() => navigate('/')} className="scan-button" style={{ background: "#ef4444", border: "none" }}>Return Home</button>
                </div>
            </div>
        );
    }

    // WAITING STATE (Host hasn't started yet)
    if (!data) {
        return (
            <div className="diagnose-path">
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
                {/* FLOATING CHAT */}
                {renderFloatingChat()}
            </div>
        );
    }

    // LIVE DATA VIEW
    // Reuse layout from Diagnose.jsx
    return (
        <div style={{ position: "relative", minHeight: "100vh" }}>
            <div className="diagnose-path">

                {data.status.includes("Running") || data.status.includes("Optimizing") || data.status.includes("Check") || data.status.includes("Scanning") ? (
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
                    data.report && (
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
                                    <p className="scan-time">OBSERVER MODE • {sessionId}</p>
                                </div>
                            </div>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">Storage Junk</span>
                                    <span className="info-value">{data.report.storage?.issues?.length || 0} Files</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Memory Heap</span>
                                    <span className="info-value">{data.report.memory?.usage || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Network Latency</span>
                                    <span className="info-value">{data.report.network?.latency || "N/A"}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">DOM Nodes</span>
                                    <span className="info-value">{data.report.dom?.totalNodes || "N/A"}</span>
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
            {renderFloatingChat()}
        </div>
    );

    function renderFloatingChat() {
        return (
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
                        <div style={{
                            background: "#2563eb", padding: "8px 16px",
                            borderRadius: "16px 16px 0 0", color: "white",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            cursor: "pointer"
                        }} onClick={() => setShowChat(false)}>
                            <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>Session Chat</span>
                            <span>_</span>
                        </div>
                        <ChatSystem sessionId={sessionId} role="GUEST" />
                    </div>
                )}
            </div>
        );
    }
};

export default RemoteView;
