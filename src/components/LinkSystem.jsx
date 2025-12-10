import React, { useState } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BoltIcon, NetworkIcon } from "./Icons";

// Helper: Generate Random 6-Digit Code
const generateSessionId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const LinkSystem = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("MENU"); // MENU, HOST, JOIN
    const [sessionId, setSessionId] = useState("");
    const [inputCode, setInputCode] = useState("");
    const [status, setStatus] = useState("IDLE"); // IDLE, CREATING, CONNECTING, ERROR
    const [errorMsg, setErrorMsg] = useState("");

    // --- HOST LOGIC ---
    const startHosting = async () => {
        setStatus("CREATING");
        const newId = generateSessionId();

        try {
            // Create Session Doc
            await setDoc(doc(db, "sessions", newId), {
                created: Date.now(),
                status: "WAITING",
                hostData: null // Will be populated by Diagnose.jsx
            });

            setSessionId(newId);
            setMode("HOST");
            setStatus("IDLE");

            // Save to LocalStorage so Diagnose.jsx knows to push data
            localStorage.setItem("yolofi_session_id", newId);
            localStorage.setItem("yolofi_session_role", "HOST");

        } catch (e) {
            console.error("Error creating session:", e);
            setStatus("ERROR");
            setErrorMsg("Connection failed. Check internet.");
        }
    };

    // --- JOIN LOGIC ---
    const joinSession = async () => {
        if (inputCode.length !== 6) {
            setErrorMsg("Enter a valid 6-digit code.");
            return;
        }

        setStatus("CONNECTING");
        try {
            const sessionRef = doc(db, "sessions", inputCode);
            const sessionSnap = await getDoc(sessionRef);

            if (sessionSnap.exists()) {
                // Update Refresh Timestamp to signal activity
                await updateDoc(sessionRef, {
                    status: "CONNECTED",
                    guestJoined: Date.now()
                });

                // Save role
                localStorage.setItem("yolofi_session_id", inputCode);
                localStorage.setItem("yolofi_session_role", "GUEST");

                // Navigate to Remote View
                navigate(`/remote/${inputCode}`);
            } else {
                setStatus("ERROR");
                setErrorMsg("Session not found. Check the code.");
            }
        } catch (e) {
            console.error("Join error:", e);
            setStatus("ERROR");
            setErrorMsg("Could not connect to session.");
        }
    };

    return (
        <div style={{
            maxWidth: "600px", margin: "2rem auto", padding: "2rem",
            background: "white", borderRadius: "16px",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            textAlign: "center"
        }}>
            <h2 style={{ color: "#111827", marginBottom: "0.5rem" }}>Results Sync</h2>
            <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
                Connect devices to view diagnostics remotely.
            </p>

            {mode === "MENU" && (
                <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
                    <button
                        onClick={startHosting}
                        style={{
                            padding: "2rem", border: "2px solid #e5e7eb", borderRadius: "12px",
                            background: "white", cursor: "pointer", transition: "all 0.2s"
                        }}
                    >
                        <div style={{ margin: "0 auto 1rem", width: "48px", height: "48px", background: "#eef2ff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <NetworkIcon size={24} color="#4f46e5" />
                        </div>
                        <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>Share My Results</h3>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>Generate Code</p>
                    </button>

                    <button
                        onClick={() => setMode("JOIN")}
                        style={{
                            padding: "2rem", border: "2px solid #e5e7eb", borderRadius: "12px",
                            background: "white", cursor: "pointer", transition: "all 0.2s"
                        }}
                    >
                        <div style={{ margin: "0 auto 1rem", width: "48px", height: "48px", background: "#ecfdf5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <BoltIcon size={24} color="#10b981" />
                        </div>
                        <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>View Remote PC</h3>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>Enter Code</p>
                    </button>
                </div>
            )}

            {mode === "HOST" && (
                <div style={{ padding: "2rem", background: "#f9fafb", borderRadius: "12px" }}>
                    <div style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "1rem" }}>
                        SHARE THIS CODE
                    </div>
                    <div style={{
                        fontSize: "3rem", fontWeight: "700", letterSpacing: "4px", color: "#111827",
                        fontFamily: "monospace", marginBottom: "1.5rem"
                    }}>
                        {sessionId}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#6b7280", marginBottom: "2rem" }}>
                        Share this code with the support technician.
                    </div>

                    <button
                        onClick={() => navigate('/diagnose')}
                        style={{
                            background: "#4f46e5", color: "white", padding: "14px 40px",
                            border: "none", borderRadius: "8px", fontWeight: "600",
                            cursor: "pointer", fontSize: "1.1rem", width: "100%",
                            boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)"
                        }}
                    >
                        Start Diagnostics Now
                    </button>

                    <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#6b7280" }}>
                        Keep this tab open until you start.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: "1rem", background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}
                    >
                        Cancel
                    </button>
                </div>
            )}

            {mode === "JOIN" && (
                <div>
                    <input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value.replace(/[^0-9]/g, ''))}
                        style={{
                            fontSize: "2rem", textAlign: "center", padding: "1rem", width: "200px",
                            borderRadius: "12px", border: "2px solid #e5e7eb", marginBottom: "1.5rem",
                            outline: "none", letterSpacing: "4px"
                        }}
                    />
                    <div>
                        <button
                            onClick={joinSession}
                            disabled={status === "CONNECTING"}
                            style={{
                                background: "#4f46e5", color: "white", padding: "12px 32px",
                                border: "none", borderRadius: "8px", fontWeight: "600",
                                cursor: "pointer", fontSize: "1rem"
                            }}
                        >
                            {status === "CONNECTING" ? "Connecting..." : "View Remote System"}
                        </button>
                    </div>
                    {errorMsg && (
                        <p style={{ color: "#ef4444", marginTop: "1rem" }}>{errorMsg}</p>
                    )}
                    <button
                        onClick={() => { setMode("MENU"); setErrorMsg(""); }}
                        style={{ marginTop: "1.5rem", background: "none", border: "none", color: "#6b7280", cursor: "pointer" }}
                    >
                        Back
                    </button>
                </div>
            )}
        </div>
    );
};

export default LinkSystem;
