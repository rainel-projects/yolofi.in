import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, updateDoc, collection, onSnapshot, query, orderBy, limit, deleteDoc, enableNetwork, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BoltIcon, ShieldIcon, ScanIcon } from "./Icons";
import "./LinkSystem.css";

// Trillion-Scale ID
const generateId = () => Math.floor(100000000000 + Math.random() * 900000000000).toString();

const LinkSystem = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("MENU"); // MENU, POOL_HOST, POOL_GUEST
    const [status, setStatus] = useState("IDLE");
    const [_sessionId, setSessionId] = useState(null);
    const retryRef = useRef(null);

    useEffect(() => {
        try { enableNetwork(db); } catch (e) { }
        return () => clearInterval(retryRef.current);
    }, []);

    // --- HOST: ENTER POOL ---
    const enterHostPool = async () => {
        setMode("POOL_HOST");
        setStatus("PUBLISHING");

        const myId = generateId();
        setSessionId(myId);

        try {
            // 1. Create Session
            await setDoc(doc(db, "sessions", myId), {
                created: Date.now(),
                status: "WAITING",
                hostJoined: true
            });

            // 2. Add to Global Pool
            await setDoc(doc(db, "public_hosts", myId), {
                id: myId,
                lastActive: Date.now(),
                type: "HOST_WAITING"
            });
            setStatus("WAITING_MATCH");

            // 3. Listen for Match
            const unsub = onSnapshot(doc(db, "sessions", myId), (snap) => {
                const data = snap.data();
                if (data && data.guestJoined) {
                    sessionStorage.setItem("yolofi_session_id", myId);
                    sessionStorage.setItem("yolofi_session_role", "HOST");
                    deleteDoc(doc(db, "public_hosts", myId)).catch(() => { });
                    navigate('/diagnose');
                }
            });

            // 4. Heartbeat
            const hb = setInterval(() => {
                updateDoc(doc(db, "public_hosts", myId), { lastActive: Date.now() }).catch(() => { });
            }, 4000);

            return () => { clearInterval(hb); unsub(); };

        } catch (e) {
            console.error(e);
            alert("Error joining pool: " + e.message);
            setMode("MENU");
        }
    };

    // --- GUEST: HUNT FOR MATCH ---
    const enterGuestPool = () => {
        setMode("POOL_GUEST");
        setStatus("SCANNING");
        findRandomHost();
    };

    const findRandomHost = async () => {
        try {
            // Fetch recent 50 hosts
            // Note: We bypass 'orderBy' for now to avoid Index Issues, fetch 50 and sort/pick
            const q = query(collection(db, "public_hosts"), limit(50));
            const snap = await getDocs(q);
            const hosts = [];
            snap.forEach(d => hosts.push(d.data()));

            if (hosts.length === 0) {
                setStatus("NO_HOSTS_RETRYING");
                retryRef.current = setTimeout(findRandomHost, 2500); // Retry loop
                return;
            }

            // FILTER & RANDOM PICK
            const candidate = hosts[Math.floor(Math.random() * hosts.length)];

            attemptMatch(candidate.id);

        } catch (e) {
            console.error("Scan Error", e);
            retryRef.current = setTimeout(findRandomHost, 3000);
        }
    };

    const attemptMatch = async (targetId) => {
        setStatus("MATCHING");
        try {
            // ATOMIC CLAIM attempt
            await updateDoc(doc(db, "sessions", targetId), {
                guestJoined: true,
                status: "MATCHED"
            });

            // Success
            sessionStorage.setItem("yolofi_session_id", targetId);
            sessionStorage.setItem("yolofi_session_role", "GUEST");
            navigate(`/remote/${targetId}`);

        } catch (e) {
            console.warn("Match Failed (Race Condition?), retrying...", e);
            // Failed to claim (maybe someone else took it). Pick another.
            findRandomHost();
        }
    };

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
                                    <div className="role-desc">Connect with random expert</div>
                                </div>
                            </button>

                            <button className="role-card guest" onClick={enterGuestPool}>
                                <div className="role-icon-bg"><BoltIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Want to Help (Find)</div>
                                    <div className="role-desc">Match with random request</div>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* --- HOST POOL --- */}
                {mode === "POOL_HOST" && (
                    <div className="center-view">
                        <div className="pulse-ring"><ShieldIcon size={64} color="#2563eb" /></div>
                        <h3>Matching...</h3>
                        <p>You are in the Global Host Pool.</p>
                        <div className="status-badge">
                            {status === "PUBLISHING" && "Joining Network..."}
                            {status === "WAITING_MATCH" && "Waiting for Expert..."}
                        </div>
                        <p className="sub-text">Please wait while we find a helper.</p>
                        <button className="text-btn" onClick={() => window.location.reload()}>Leave Pool</button>
                    </div>
                )}

                {/* --- GUEST POOL --- */}
                {mode === "POOL_GUEST" && (
                    <div className="center-view">
                        <div className="pulse-ring"><ScanIcon size={64} color="#4ade80" /></div>
                        <h3>Finding Session...</h3>
                        <p>Scanning Global Pool for Hosts.</p>
                        <div className="status-badge">
                            {status === "SCANNING" && "Scanning..."}
                            {status === "NO_HOSTS_RETRYING" && "No Hosts Found. Retrying..."}
                            {status === "MATCHING" && "Attempting Connection..."}
                        </div>
                        <button className="text-btn" onClick={() => window.location.reload()}>Stop Search</button>
                    </div>
                )}

                <div className="footer-credit">Random P2P Matching • Trillion-User Ready</div>
            </div>
        </div>
    );
};

export default LinkSystem;
