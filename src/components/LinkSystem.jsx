import React, { useState } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BoltIcon, NetworkIcon, ShieldIcon } from "./Icons";
import "./LinkSystem.css";

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
    const [copied, setCopied] = useState(false);

    // --- HOST LOGIC (Target) ---
    const startHosting = async () => {
        // OPTIMISTIC UPDATE: Show UI immediately
        const newId = generateSessionId();
        setSessionId(newId);
        setMode("HOST");
        setStatus("IDLE");

        // Save to LocalStorage immediately so they can "Open Dashboard" validation works
        localStorage.setItem("yolofi_session_id", newId);
        localStorage.setItem("yolofi_session_role", "HOST");

        // Background: Sync to Firebase
        // We don't await this for the UI transition, but we catch errors
        setDoc(doc(db, "sessions", newId), {
            created: Date.now(),
            status: "WAITING",
            hostData: null,
            activeUsers: 0
        }).catch(e => {
            console.error("Background session creation failed:", e);
            setErrorMsg("Network warning: Session might not be visible to guests yet.");
        });
    };

    // --- JOIN LOGIC (Observer) ---
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
                await updateDoc(sessionRef, {
                    guestJoined: Date.now()
                });

                localStorage.setItem("yolofi_session_id", inputCode);
                localStorage.setItem("yolofi_session_role", "GUEST");

                navigate(`/remote/${inputCode}`);
            } else {
                setStatus("ERROR");
                setErrorMsg("Session not found. Check code.");
            }
        } catch (e) {
            console.error("Join error:", e);
            setStatus("ERROR");
            setErrorMsg("Could not connect.");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(sessionId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="link-system-container">
            <div className="glass-card">
                {mode === "MENU" && (
                    <>
                        <div className="intro-text">
                            <h2>Collaborative Diagnostics</h2>
                            <p>Choose your role to start troubleshooting or helping others.</p>
                        </div>

                        {errorMsg && (
                            <div style={{ padding: "1rem", background: "#fee2e2", color: "#b91c1c", borderRadius: "8px", marginBottom: "1.5rem" }}>
                                ⚠️ {errorMsg}
                            </div>
                        )}

                        <div className="role-grid">
                            <button
                                className="role-card host"
                                onClick={startHosting}
                                disabled={status === "CREATING"}
                                style={{ opacity: status === "CREATING" ? 0.7 : 1 }}
                            >
                                <div className="role-icon">
                                    {status === "CREATING" ? <div className="spinner-ring" style={{ width: 32, height: 32 }}></div> : <ShieldIcon size={32} />}
                                </div>
                                <div className="role-title">
                                    {status === "CREATING" ? "Creating..." : "I Need Help"}
                                </div>
                                <div className="role-desc">
                                    My browser is slow or acting up. I want to host a session and get fixed.
                                </div>
                            </button>

                            <div className="role-card guest" onClick={() => setMode("JOIN")}>
                                <div className="role-icon">
                                    <BoltIcon size={32} />
                                </div>
                                <div className="role-title">I Want to Help</div>
                                <div className="role-desc">
                                    I am a technician or friend. I want to join a session to troubleshoot.
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {mode === "HOST" && (
                    <div className="host-view">
                        <div className="intro-text">
                            <h2>Session Created</h2>
                            <p>Share this code with your helper to let them join.</p>
                        </div>

                        <div className="code-display-container">
                            <div className="session-code">{sessionId}</div>

                            <button className="copy-btn" onClick={copyToClipboard}>
                                {copied ? (
                                    <><span>✓</span> Copied!</>
                                ) : (
                                    <><span>📋</span> Copy Code</>
                                )}
                            </button>
                        </div>

                        <div style={{ marginTop: "3rem" }}>
                            <button
                                className="connect-btn"
                                onClick={() => navigate('/diagnose')}
                                style={{ background: "#4f46e5", width: "100%" }}
                            >
                                Open My Dashboard &rarr;
                            </button>
                            <p style={{ marginTop: "1rem", color: "#9ca3af", fontSize: "0.9rem" }}>
                                Waiting for guests... (0 joined)
                            </p>
                        </div>
                    </div>
                )}

                {mode === "JOIN" && (
                    <div className="join-view">
                        <div className="intro-text">
                            <h2>Join Session</h2>
                            <p>Enter the 6-digit code provided by the host.</p>
                        </div>

                        <input
                            type="text"
                            className="huge-input"
                            placeholder="000000"
                            maxLength={6}
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.replace(/[^0-9]/g, ''))}
                            autoFocus
                        />

                        {errorMsg && (
                            <div style={{ color: "#ef4444", marginBottom: "1.5rem", fontWeight: "600" }}>{errorMsg}</div>
                        )}

                        <div>
                            <button
                                className="connect-btn"
                                onClick={joinSession}
                                disabled={status === "CONNECTING"}
                            >
                                {status === "CONNECTING" ? "Connecting..." : "Connect to Remote PC"}
                            </button>
                        </div>

                        <button
                            onClick={() => { setMode("MENU"); setErrorMsg(""); }}
                            style={{
                                marginTop: "2rem", background: "none", border: "none",
                                color: "#6b7280", cursor: "pointer", fontSize: "1rem",
                                textDecoration: "underline"
                            }}
                        >
                            &larr; Go Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinkSystem;
