import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, onSnapshot } from "firebase/firestore";
import { ShieldIcon, CpuIcon, NetworkIcon } from "./Icons";

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

    // --- RENDER: CONNECTED BUT WAITING FOR SCAN ---
    if (!data) {
        return (
            <div style={{ textAlign: "center", padding: "4rem" }}>
                <h2 style={{ color: "#10b981" }}>Connected to Remote PC</h2>
                <div style={{ margin: "2rem auto", width: "64px", height: "64px", border: "4px solid #e5e7eb", borderTopColor: "#10b981", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ color: "#6b7280" }}>Waiting for host to run diagnostics...</p>
            </div>
        );
    }

    // --- RENDER: SCANNING IN PROGRESS ---
    if (data.progress !== undefined && data.progress < 100) {
        return (
            <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "2rem", textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                    <div style={{ width: "10px", height: "10px", background: "#ef4444", borderRadius: "50%", animation: "pulse 1s infinite" }}></div>
                    <span style={{ fontWeight: "700", color: "#111827" }}>LIVE DIAGNOSTIC</span>
                </div>

                <h2 style={{ fontSize: "1.5rem", marginBottom: "2rem", color: "#1f2937" }}>{data.status}</h2>

                <div style={{ height: "12px", background: "#e5e7eb", borderRadius: "6px", overflow: "hidden", marginBottom: "1rem" }}>
                    <div style={{ width: `${data.progress}%`, height: "100%", background: "#4f46e5", transition: "width 0.5s ease" }}></div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: "0.9rem" }}>
                    <span>Initializing</span>
                    <span>{data.progress}%</span>
                </div>
            </div>
        );
    }

    // --- RENDER: COMPLETED OR RESULTS ---
    // Handle both "Report Only" (pre-optimization) and "Optimization Result" (post-optimization)
    const displayData = data.report || data;

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
            {/* HERADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "10px", height: "10px", background: "#10b981", borderRadius: "50%" }}></div>
                        <span style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: "600", letterSpacing: "1px" }}>SESSION ACTIVE</span>
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
                        <span style={{ fontWeight: "600" }}>System Spec</span>
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#111827" }}>
                        {displayData.systemInfo?.memory || "Unknown"}
                    </div>
                </div>

                {/* NETWORK */}
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem", color: "#10b981" }}>
                        <NetworkIcon size={20} />
                        <span style={{ fontWeight: "600" }}>Network</span>
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#111827" }}>
                        {displayData.networkInfo?.speed || "--"}
                    </div>
                </div>

                {/* STATUS */}
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem", color: "#f59e0b" }}>
                        <ShieldIcon size={20} />
                        <span style={{ fontWeight: "600" }}>Health</span>
                    </div>
                    <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#111827" }}>
                        {displayData.issues?.issues?.length > 0 ? `${displayData.issues.issues.length} Issues` : "Healthy"}
                    </div>
                </div>
            </div>

            {/* DETAILED LOG */}
            <div style={{ background: "#1f2937", borderRadius: "12px", padding: "1.5rem", color: "#e5e7eb" }}>
                <h3 style={{ margin: "0 0 1rem", borderBottom: "1px solid #374151", paddingBottom: "0.5rem" }}>Live Event Log</h3>
                <div style={{ fontFamily: "monospace", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ color: "#10b981" }}>
                        > Connection Established: Stable
                    </div>
                    <div style={{ color: "#9ca3af" }}>
                        > System: {displayData.systemInfo?.os || "Unknown OS"} {displayData.systemInfo?.browser || ""}
                    </div>
                    {displayData.issues?.issues?.map((issue, idx) => (
                        <div key={idx} style={{ color: "#ef4444" }}>
                            > Warning: {issue.title}
                        </div>
                    ))}
                    {data.scoreImprovement && (
                        <div style={{ color: "#60a5fa", marginTop: "1rem" }}>
                             > OPTIMIZATION COMPLETED. PERFORMANCE IMPROVED BY {data.scoreImprovement}%.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RemoteView;
