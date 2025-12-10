import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, updateDoc, collection, onSnapshot, query, limit, deleteDoc, enableNetwork, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BoltIcon, ShieldIcon, ScanIcon } from "./Icons";
import "./LinkSystem.css";

// Trillion-Scale ID
const generateId = () => Math.floor(100000000000 + Math.random() * 900000000000).toString();

const LinkSystem = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("MENU");
    const [status, setStatus] = useState("IDLE");
    const [mySessionId, setMySessionId] = useState(null);
    const guestListenerRef = useRef(null);

    useEffect(() => {
        try { enableNetwork(db); } catch (e) { }
        return () => {
            if (guestListenerRef.current) guestListenerRef.current();
        };
    }, []);

    // --- HOST LOGIC: JOIN POOL ---
    const enterHostPool = async () => {
        setMode("POOL_HOST");
        setStatus("PUBLISHING");

        const myId = generateId();
        setMySessionId(myId);

        try {
            // 1. Create Private
            await setDoc(doc(db, "sessions", myId), {
                created: Date.now(),
                status: "WAITING",
                hostJoined: true
            });

            // 2. Publish to Pool
            await setDoc(doc(db, "public_hosts", myId), {
                id: myId,
                limit: 1 // Single seat
            });
            setStatus("WAITING_MATCH");

            // 3. Wait for Guest Assignment
            const unsub = onSnapshot(doc(db, "sessions", myId), (snap) => {
                const data = snap.data();
                if (data && data.guestJoined) {
                    sessionStorage.setItem("yolofi_session_id", myId);
                    sessionStorage.setItem("yolofi_session_role", "HOST");
                    navigate('/diagnose');
                }
            });

            // Heartbeat
            const hb = setInterval(() => {
                updateDoc(doc(db, "public_hosts", myId), { lastActive: Date.now() }).catch(() => { });
            }, 5000);

            return () => { clearInterval(hb); unsub(); };

        } catch (e) {
            alert("Host Error: " + e.message);
            setMode("MENU");
        }
    };

    // --- GUEST LOGIC: FIND & ASSIGN ---
    const enterGuestPool = () => {
        setMode("POOL_GUEST");
        setStatus("SCANNING");

        // 1. Realtime Listen for AVAILABLE Hosts
        const q = query(collection(db, "public_hosts"), limit(20));

        guestListenerRef.current = onSnapshot(q, (snapshot) => {
            const availableHosts = [];
            snapshot.forEach(d => availableHosts.push(d.data()));

            if (availableHosts.length > 0) {
                // FOUND ONE!
                const target = availableHosts[Math.floor(Math.random() * availableHosts.length)];
                assignHost(target.id);
            } else {
                setStatus("WAITING_FOR_HOSTS");
            }
        });
    };

    const assignHost = async (targetId) => {
        if (status === "ASSIGNING") return; // Prevent double trigger
        setStatus("ASSIGNING");

        // Stop listening so we don't try to match others
        if (guestListenerRef.current) guestListenerRef.current();

        try {
            console.log("Attempting to assign:", targetId);

            // 1. REMOVE FROM POOL (Lock it)
            // This prevents other Guests from finding it.
            await deleteDoc(doc(db, "public_hosts", targetId));

            // 2. CLAIM SESSION
            await updateDoc(doc(db, "sessions", targetId), {
                guestJoined: true,
                status: "MATCHED"
            });

            // 3. CONNECT
            sessionStorage.setItem("yolofi_session_id", targetId);
            sessionStorage.setItem("yolofi_session_role", "GUEST");
            navigate(`/remote/${targetId}`);

        } catch (e) {
            console.warn("Assignment Failed (Taken?):", e);
            setStatus("SCANNING");
            // If failed, restart listener is complex here, better to reload or let user retry
            alert("Match failed (someone else took it). Try again.");
            setMode("MENU");
        }
    };

    // Helper to format ID for display
    const formatIdDisplay = (id) => (id ? id.match(/.{1,4}/g) || [] : []);

    return (
        <div className="link-system-container">
            <div className="glass-card">
                {mode === "MENU" && (
                    <>
                        <div className="intro-text">
                            <h2>Remote Diagnostics</h2>
                            <p>Global Random Matching Pool</p>
                        </div>
                        <div className="role-grid">
                            <button className="role-card host" onClick={enterHostPool}>
                                <div className="role-icon-bg"><ShieldIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Need Help (Join Pool)</div>
                                    <div className="role-desc">Wait for assignment</div>
                                </div>
                            </button>

                            <button className="role-card guest" onClick={enterGuestPool}>
                                <div className="role-icon-bg"><BoltIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Want to Help (Find)</div>
                                    <div className="role-desc">Assign random host</div>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* --- HOST VIEW --- */}
                {mode === "POOL_HOST" && (
                    <div className="center-view">
                        <div className="pulse-ring"><ShieldIcon size={64} color="#2563eb" /></div>
                        <h3>In The Pool</h3>
                        <div className="code-display" style={{ gap: '12px' }}>
                            {mySessionId ? formatIdDisplay(mySessionId).map((chunk, i) => (
                                <span key={i} className="code-chunk large">{chunk}</span>
                            )) : "Generating..."}
                        </div>
                        <div className="status-badge">
                            {status === "PUBLISHING" && "Publishing..."}
                            {status === "WAITING_MATCH" && "Waiting for Assignment..."}
                        </div>
                        <button className="text-btn" onClick={() => window.location.reload()}>Leave Pool</button>
                    </div>
                )}

                {/* --- GUEST VIEW --- */}
                {mode === "POOL_GUEST" && (
                    <div className="center-view">
                        <div className="pulse-ring"><ScanIcon size={64} color="#4ade80" /></div>
                        <h3>Finding Session...</h3>
                        <div className="status-badge">
                            {status === "SCANNING" && "Scanning Network..."}
                            {status === "WAITING_FOR_HOSTS" && "Pool Empty. Waiting for Host..."}
                            {status === "ASSIGNING" && "Host Found! Assigning..."}
                        </div>
                        <button className="text-btn" onClick={() => window.location.reload()}>Cancel</button>
                    </div>
                )}

                <div className="footer-credit">Automated Assignment System • v4.0</div>
            </div>
        </div>
    );
};

export default LinkSystem;
