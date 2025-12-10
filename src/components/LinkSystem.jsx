import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, updateDoc, collection, onSnapshot, query, where, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BoltIcon, ShieldIcon } from "./Icons";
import "./LinkSystem.css";

// Generate simpler IDs for better UX
const generateHostName = () => "Helper-" + Math.floor(100 + Math.random() * 900);
const generateSessionId = () => Math.floor(100000 + Math.random() * 900000).toString();

const LinkSystem = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("MENU");
    const [status, setStatus] = useState("IDLE"); // IDLE, WAITING, CONNECTING
    const [guestId, setGuestId] = useState(null);
    const [helpers, setHelpers] = useState([]);

    // --- GUEST LOGIC (Heartbeat) ---
    useEffect(() => {
        let heartbeatInterval;
        if (mode === "GUEST_QUEUE" && guestId && status === "WAITING") {
            // Heartbeat: Ping Firestore every 5s to say "I'm Alive"
            heartbeatInterval = setInterval(async () => {
                try {
                    await updateDoc(doc(db, "waiting_room", guestId), {
                        lastActive: Date.now()
                    });
                } catch (e) {
                    // Ignore transient network errors
                }
            }, 5000);
        }
        return () => clearInterval(heartbeatInterval);
    }, [mode, guestId, status]);

    const goOnline = async () => {
        setStatus("WAITING");
        const myId = generateHostName();
        setGuestId(myId);

        try {
            // 1. Create Waiting Room Entry
            const waitingRef = doc(db, "waiting_room", myId);
            await setDoc(waitingRef, {
                name: myId,
                status: "WAITING",
                joinedAt: Date.now(),
                lastActive: Date.now() // Initial Heartbeat
            });

            // 2. Listen for Invite
            const unsub = onSnapshot(waitingRef, (snap) => {
                const data = snap.data();
                if (data && data.sessionId && data.status === "INVITED") {
                    // Host picked us!
                    sessionStorage.setItem("yolofi_session_id", data.sessionId);
                    sessionStorage.setItem("yolofi_session_role", "GUEST");
                    navigate(`/remote/${data.sessionId}`);
                }
            });

            // Cleanup on unmount handled by useEffect usually, 
            // but for simple prototype we rely on navigating away.
        } catch (e) {
            console.error("Queue error:", e);
            setStatus("ERROR");
        }
    };

    // --- HOST LOGIC (Discovery with Stale Filter) ---
    const startDiscovery = () => {
        setMode("HOST_DISCOVERY");
        // Listen to Waiting Room
        const q = query(collection(db, "waiting_room"), where("status", "==", "WAITING"));

        const unsub = onSnapshot(q, (snapshot) => {
            const now = Date.now();
            const validHelpers = [];

            snapshot.docs.forEach(d => {
                const data = d.data();
                // 15 Second Stale Threshold -> Removes Ghost Users
                if (now - data.lastActive < 15000) {
                    validHelpers.push({ id: d.id, ...data });
                } else {
                    // (Optional) Cleanup dead docs lazily if needed, 
                    // but visual filtering is safer for now.
                }
            });
            setHelpers(validHelpers);
        });
    };

    const inviteHelper = async (helperId) => {
        // Create Session
        const newSessionId = generateSessionId();

        await setDoc(doc(db, "sessions", newSessionId), {
            created: Date.now(),
            status: "WAITING",
            hostData: null,
            activeUsers: 0
        });

        // Notify Helper
        await updateDoc(doc(db, "waiting_room", helperId), {
            status: "INVITED",
            sessionId: newSessionId
        });

        // Redirect Self
        sessionStorage.setItem("yolofi_session_id", newSessionId);
        sessionStorage.setItem("yolofi_session_role", "HOST");
        navigate('/diagnose');
    };

    return (
        <div className="link-system-container">
            <div className="glass-card">
                {mode === "MENU" && (
                    <>
                        <div className="intro-text">
                            <h2>Connect & Fix</h2>
                            <p>Get instant help or provide expertise.</p>
                        </div>
                        <div className="role-grid">
                            <button className="role-card host" onClick={startDiscovery}>
                                <div className="role-icon"><ShieldIcon size={32} /></div>
                                <div className="role-title">I Need Help</div>
                                <div className="role-desc">Find an available expert to fix my browser using a visual list.</div>
                            </button>

                            <button className="role-card guest" onClick={() => setMode("GUEST_QUEUE")}>
                                <div className="role-icon"><BoltIcon size={32} /></div>
                                <div className="role-title">I Want to Help</div>
                                <div className="role-desc">Go online and wait for someone who needs help.</div>
                            </button>
                        </div>
                    </>
                )}

                {/* HOST VIEW: helper list */}
                {mode === "HOST_DISCOVERY" && (
                    <div className="discovery-view">
                        <h3>Available Helpers</h3>
                        <p style={{ marginBottom: "2rem", color: "#666" }}>Click a user to invite them.</p>

                        {helpers.length === 0 ? (
                            <div className="empty-state">
                                <div className="spinner-ring" style={{ margin: "2rem auto" }}></div>
                                <p>Searching for active devices...</p>
                            </div>
                        ) : (
                            <div className="helpers-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {helpers.map(h => (
                                    <button
                                        key={h.id}
                                        onClick={() => inviteHelper(h.id)}
                                        style={{
                                            padding: "1.5rem", borderRadius: "12px", border: "1px solid #e5e7eb",
                                            background: "white", cursor: "pointer", display: "flex", alignItems: "center",
                                            justifyContent: "space-between", fontSize: "1.1rem", fontWeight: "600"
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                                            {h.name}
                                        </div>
                                        <span style={{ color: "#2563eb", fontWeight: "bold" }}>Invite &rarr;</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <button onClick={() => setMode("MENU")} style={{ marginTop: "2rem", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>Cancel</button>
                    </div>
                )}

                {/* GUEST VIEW: waiting */}
                {mode === "GUEST_QUEUE" && (
                    <div className="queue-view">
                        {status === "IDLE" && (
                            <>
                                <h3>Ready to Help?</h3>
                                <p>You will be broadcasted to local hosts.</p>
                                <button className="connect-btn" onClick={goOnline}>Go Online</button>
                            </>
                        )}
                        {status === "WAITING" && (
                            <div style={{ padding: "2rem" }}>
                                <div className="spinner-ring" style={{ width: 60, height: 60, margin: "0 auto 2rem" }}></div>
                                <h3>You are Online</h3>
                                <p style={{ color: "#10b981", fontWeight: "bold" }}>● {guestId}</p>
                                <p style={{ marginTop: "1rem", color: "#6b7280" }}>Broadcasting signal to nearby hosts...</p>
                                <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "2rem" }}>Keep this tab open.</p>
                            </div>
                        )}
                        <button onClick={() => setMode("MENU")} style={{ marginTop: "2rem", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}>Cancel</button>
                    </div>
                )}

                {/* CREDIT FOOTER */}
                <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", fontStyle: "italic" }}>
                    Inspired by WhatsApp Networking Technology
                </div>
            </div>
        </div>
    );
};

export default LinkSystem;
