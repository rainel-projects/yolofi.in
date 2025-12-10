import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import ChatSystem from "./ChatSystem";
import { ShieldIcon, CpuIcon, NetworkIcon, CheckCircleIcon } from "./Icons";
import "./Diagnose.css"; // Reuse styles

const RemoteView = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [status, setStatus] = useState("CONNECTING"); // CONNECTING, LIVE, DISCONNECTED

    useEffect(() => {
        if (!sessionId) return;

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
            <div style={{ textAlign: "center", padding: "4rem" }}>
                <div style={{ fontSize: "1.5rem", color: "#6b7280" }}>Establishing Secure Link...</div>
            </div>
        );
    }

    if (status === "DISCONNECTED") {
        return (
            <div style={{ textAlign: "center", padding: "4rem" }}>
                <h2 style={{ color: "#ef4444" }}>Signal Lost</h2>
                <p>The remote session has ended or is invalid.</p>
                <button onClick={() => navigate('/')} className="secondary-btn">Return Home</button>
            </div>
        );
    }

    // WAITING STATE
    if (!data) {
        return (
            <div className="layout-container" style={{ display: "flex", height: "100vh", background: "#f9fafb" }}>
                <div className="main-panel" style={{ flex: 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div className="pulse-circle"><ShieldIcon size={48} color="#10b981" /></div>
                    <h2>Connected to Host</h2>
                    <p>Waiting for host to start diagnostics...</p>
                </div>
                <div className="side-panel" style={{ flex: 1, borderLeft: "1px solid #e5e7eb" }}>
                    <ChatSystem sessionId={sessionId} role="GUEST" />
                </div>
            </div>
        );
    }



    return (
        <div className="layout-container" style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f9fafb" }}>

            {/* LEFT: OBSERVATION PANEL */}
            <div className="main-panel" style={{ flex: 2, padding: "2rem", overflowY: "auto" }}>
                <div className="center-card">
                    <div className="header-status" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                        <h1 style={{ margin: 0 }}>Remote Diagnostic</h1>
                        <div className="badge">{data.status}</div>
                    </div>

                    {/* Progress Bar */}
                    {data.progress < 100 && (
                        <div style={{ marginBottom: "2rem" }}>
                            <div className="progress-bar">
                                <div className="fill" style={{ width: `${data.progress}%` }}></div>
                            </div>
                            <p className="mono">{data.progress}% Complete</p>
                        </div>
                    )}

                    {/* Results / Report */}
                    {data.report && (
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <h3>Storage Health</h3>
                                <div className="value">{data.report.storage?.issues?.length || 0} Issues</div>
                            </div>
                            <div className="metric-card">
                                <h3>Memory</h3>
                                <div className="value">{data.report.memory?.usage || "N/A"}</div>
                            </div>
                            <div className="metric-card">
                                <h3>Network</h3>
                                <div className="value">{data.report.network?.latency || "N/A"}</div>
                            </div>
                        </div>
                    )}

                    {data.status.includes("Optimization Complete") && (
                        <div style={{ marginTop: "2rem", textAlign: "center", color: "#10b981" }}>
                            <CheckCircleIcon size={48} />
                            <h2>System Optimized</h2>
                            <p>Host browser performance improved via BrowserEngine.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: CHAT PANEL */}
            <div className="side-panel" style={{ flex: 1, borderLeft: "1px solid #e5e7eb", background: "#f3f4f6", padding: "1rem" }}>
                <div style={{ marginBottom: "1rem", color: "#6b7280", fontSize: "0.9rem" }}>
                    Using ID: <strong>{sessionStorage.getItem("yolofi_chat_id")}</strong>
                </div>
                <ChatSystem sessionId={sessionId} role="GUEST" />
            </div>

        </div>
    );
};

export default RemoteView;
