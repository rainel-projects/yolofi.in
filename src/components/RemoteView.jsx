import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { ShieldIcon, CpuIcon, NetworkIcon, BoltIcon, CheckCircleIcon } from "./Icons";

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
                <button
                    onClick={() => navigate('/')}
                    style={{ background: "#1f2937", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" }}
                >
                    Return Home
                </button>
            </div>
        );
    }

    // Default empty state if connected but no data yet
    if (!data) {
        return (
            <div style={{ textAlign: "center", padding: "4rem" }}>
                <h2 style={{ color: "#10b981" }}>Connected to Remote PC</h2>
                <div style={{ margin: "2rem auto", width: "64px", height: "64px", border: "4px solid #e5e7eb", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ color: "#6b7280" }}>Waiting for host to run diagnostics...</p>
            </div>
        );
    }

    // --- RENDER REMOTE DATA ---
    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
            {/* HERADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "10px", height: "10px", background: "#ef4444", borderRadius: "50%", animation: "pulse 2s infinite" }}></div>
                        <span style={{ fontSize: "0.85rem", color: "#ef4444", fontWeight: "600", letterSpacing: "1px" }}>LIVE VIEW</span>
                    </div>
                    <h1 style={{ margin: "4px 0 0", fontSize: "1.5rem", color: "#111827" }}>Remote System Diagnostic</h1>
                    <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>Session ID: {sessionId}</div>
                </div>
            </div>

            {/* KEY METRICS GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {/* CPU / MEMORY */}
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem", color: "#4f46e5" }}>
                        <CpuIcon size={20} />
                        <span style={{ fontWeight: "600" }}>System Load</span>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>
                        {data.memory?.status || "Analyzing..."}
                    </div>
                </div>

                {/* NETWORK */}
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem", color: "#10b981" }}>
                        <NetworkIcon size={20} />
                        <span style={{ fontWeight: "600" }}>Latency</span>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>
                        {data.network?.latency ? Math.round(data.network.latency) + " ms" : "--"}
                    </div>
                </div>

                {/* STORAGE */}
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem", color: "#f59e0b" }}>
                        <ShieldIcon size={20} />
                        <span style={{ fontWeight: "600" }}>Security</span>
                    </div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>
                        {data.score >= 80 ? "Protected" : "At Risk"}
                    </div>
                </div>
            </div>

            {/* DETAILED LOG */}
            <div style={{ background: "#1f2937", borderRadius: "12px", padding: "1.5rem", color: "#e5e7eb" }}>
                <h3 style={{ margin: "0 0 1rem", borderBottom: "1px solid #374151", paddingBottom: "0.5rem" }}>Diagnostic Log</h3>
                <div style={{ fontFamily: "monospace", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {data.actions?.storage?.counts ? (
                        <div style={{ color: "#10b981" }}>
                            > Storage Analyzed: Found {data.actions.storage.counts.trash} junk items
                        </div>
                    ) : null}

                    {data.actions?.workers?.removed ? (
                        <div style={{ color: "#60a5fa" }}>
                            > Background Tasks: Terminated {data.actions.workers.removed} processes
                        </div>
                    ) : null}

                    <div style={{ color: "#9ca3af" }}>
                        > System Status: {data.status || "Idle"}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RemoteView;
