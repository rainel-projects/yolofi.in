import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc, updateDoc, collection, onSnapshot, query, where, limit, deleteDoc, enableNetwork, writeBatch } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BoltIcon, ShieldIcon, ScanIcon } from "./Icons";
import "./LinkSystem.css";

// 12-Digit ID
const generateId = () => Math.floor(100000000000 + Math.random() * 900000000000).toString();

const LinkSystem = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("MENU");
    const [status, setStatus] = useState("IDLE");
    const [mySessionId, setMySessionId] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const guestListenerRef = useRef(null);

    // Initial Network Check
    useEffect(() => {
        const init = async () => {
            try { await enableNetwork(db); } catch (e) { console.warn(e); }
        };
        init();
        return () => {
            if (guestListenerRef.current) guestListenerRef.current();
        };
    }, []);

    // --- HOST: OFFLINE-FIRST REGISTER ---
    const startHosting = async () => {
        setMode("HOST_WAITING");
        // Optimistic: We are "Connecting" but effectively "Live" locally immediately
        setStatus("BROADCASTING");
        setErrorMsg(null);

        const newId = generateId();
        setMySessionId(newId);

        try {
            const batch = writeBatch(db);

            // 1. Session Ref
            const sessionRef = doc(db, "sessions", newId);
            batch.set(sessionRef, {
                created: Date.now(),
                status: "WAITING",
                hostJoined: true
            });

            // 2. Public Ref
            const hostRef = doc(db, "public_hosts", newId);
            batch.set(hostRef, {
                id: newId,
                status: "AVAILABLE",
                timestamp: Date.now()
            });

            // 3. FIRE & FORGET (Optimistic)
            // We do NOT await this. We trust Firestore's offline persistence queue.
            batch.commit().catch(e => console.warn("Background Sync Warning:", e));

            // 4. Update UI Instantly
            setStatus("ONLINE_WAITING");

            // 5. Listen for Match
            const unsub = onSnapshot(sessionRef, (snap) => {
                const data = snap.data();
                if (data && data.guestJoined) {
                    setStatus("MATCHED");
                    sessionStorage.setItem("yolofi_session_id", newId);
                    sessionStorage.setItem("yolofi_session_role", "HOST");

                    deleteDoc(hostRef).catch(() => { });
                    navigate('/diagnose');
                }
            });

            // Heartbeat
            const hb = setInterval(() => {
                updateDoc(hostRef, { timestamp: Date.now() }).catch(() => { });
            }, 5000);

            return () => { clearInterval(hb); unsub(); };

        } catch (e) {
            console.error(e);
            setErrorMsg("Error: " + e.message);
            setStatus("ERROR");
        }
    };

    // --- GUEST: REALTIME SCAN & CLAIM ---
    const startGuestSearch = () => {
        setMode("GUEST_AUTO");
        setStatus("CONNECTING_DB");
        setErrorMsg(null);

        // Realtime Listener for ANY available host
        const q = query(
            collection(db, "public_hosts"),
            where("status", "==", "AVAILABLE"),
            limit(1)
        );

        guestListenerRef.current = onSnapshot(q, (snapshot) => {
            setStatus("SCANNING");

            if (snapshot.empty) {
                setStatus("WAITING_FOR_HOSTS");
                return;
            }

            const target = snapshot.docs[0].data();
            attemptClaim(target.id);

        }, (err) => {
            console.error(err);
            setErrorMsg("Scan Error: " + err.message);
            setStatus("ERROR");
        });
    };

    const attemptClaim = async (targetId) => {
        if (guestListenerRef.current) guestListenerRef.current();
        setStatus("CLAIMING");

        try {
            await updateDoc(doc(db, "public_hosts", targetId), { status: "BUSY" });
            await updateDoc(doc(db, "sessions", targetId), { guestJoined: true, status: "ACTIVE" });

            sessionStorage.setItem("yolofi_session_id", targetId);
            sessionStorage.setItem("yolofi_session_role", "GUEST");
            navigate(`/remote/${targetId}`);

        } catch (e) {
            console.warn("Claim Failed:", e);
            startGuestSearch();
        }
    };

    // Helper
    const formatId = (id) => (id ? id.match(/.{1,4}/g) || [] : []);

    return (
        <div className="link-system-container">
            <div className="glass-card">
                {mode === "MENU" && (
                    <>
                        <div className="intro-text">
                            <h2>Remote Diagnostics</h2>
                            <p>Global Network • Low Latency</p>
                        </div>
                        <div className="role-grid">
                            <button className="role-card host" onClick={startHosting}>
                                <div className="role-icon-bg"><ShieldIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Need Help (Host)</div>
                                    <div className="role-desc">Broadcast Signal</div>
                                </div>
                            </button>

                            <button className="role-card guest" onClick={startGuestSearch}>
                                <div className="role-icon-bg"><BoltIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Want to Help (Guest)</div>
                                    <div className="role-desc">Scan Network</div>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* --- HOST VIEW --- */}
                {mode === "HOST_WAITING" && (
                    <div className="center-view">
                        <div className="pulse-ring"><ShieldIcon size={64} color={status === "ERROR" ? "#ef4444" : "#2563eb"} /></div>

                        {status === "ERROR" ? (
                            <>
                                <h3>Broadcast Failed</h3>
                                <p className="error-text">{errorMsg}</p>
                            </>
                        ) : (
                            <>
                                <h3>{status === "ONLINE_WAITING" ? "You Are Live" : "Connecting..."}</h3>
                                {status === "ONLINE_WAITING" && <p>Registered in Global Pool. Waiting for Guest...</p>}

                                <div className="code-display" style={{ gap: '12px' }}>
                                    {mySessionId ? formatId(mySessionId).map((chunk, i) => (
                                        <span key={i} className="code-chunk large">{chunk}</span>
                                    )) : "..."}
                                </div>

                                <div className="status-badge">
                                    {status === "CONNECTING_DB" && "Initializing Network..."}
                                    {status === "BROADCASTING" && "Broadcasting Signal..."}
                                    {status === "ONLINE_WAITING" && "Waiting for Peer..."}
                                    {status === "MATCHED" && "Peer Found! Connecting..."}
                                </div>
                            </>
                        )}
                        <button className="text-btn" onClick={() => window.location.reload()}>Cancel</button>
                    </div>
                )}

                {/* --- GUEST VIEW --- */}
                {mode === "GUEST_AUTO" && (
                    <div className="center-view">
                        <div className="pulse-ring"><ScanIcon size={64} color={status === "ERROR" ? "#ef4444" : "#4ade80"} /></div>

                        {status === "ERROR" ? (
                            <>
                                <h3>Scan Error</h3>
                                <p className="error-text">{errorMsg}</p>
                            </>
                        ) : (
                            <>
                                <h3>Scanning...</h3>
                                <p>Locating Available Hosts.</p>

                                <div className="status-badge">
                                    {status === "CONNECTING_DB" && "Check Network..."}
                                    {status === "SCANNING" && "Searching Pool..."}
                                    {status === "WAITING_FOR_HOSTS" && "Pool Empty. Waiting..."}
                                    {status === "CLAIMING" && "Host Found! Connecting..."}
                                </div>
                            </>
                        )}
                        <button className="text-btn" onClick={() => window.location.reload()}>Cancel Search</button>
                    </div>
                )}

                <div className="footer-credit">Low-Latency Link • v9.1</div>
            </div>
        </div>
    );
};

export default LinkSystem;
