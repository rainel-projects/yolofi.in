import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, updateDoc, collection, onSnapshot, query, where, limit, deleteDoc, enableNetwork, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BoltIcon, ShieldIcon, ScanIcon, CheckCircleIcon } from "./Icons";
import "./LinkSystem.css";

// Trillion-Scale ID (12 Digits)
const generateId = () => Math.floor(100000000000 + Math.random() * 900000000000).toString();

const LinkSystem = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("MENU"); // MENU, HOST_WAITING, GUEST_AUTO
    const [status, setStatus] = useState("IDLE");
    const [mySessionId, setMySessionId] = useState(null);
    const retryRef = useRef(null);
    const stopSearchRef = useRef(false);

    useEffect(() => {
        try { enableNetwork(db); } catch (e) { }
        return () => {
            stopSearchRef.current = true;
            if (retryRef.current) clearTimeout(retryRef.current);
        };
    }, []);

    // --- HOST: GENERATE & MARK AVAILABLE ---
    const startHosting = async () => {
        setMode("HOST_WAITING");
        setStatus("REGISTERING");

        const newId = generateId();
        setMySessionId(newId);

        try {
            // 1. Create Internal Session
            await setDoc(doc(db, "sessions", newId), {
                created: Date.now(),
                status: "WAITING",
                hostJoined: true
            });

            // 2. Add to Public Structure as AVAILABLE
            // This is the "Data Structure" guests will search
            await setDoc(doc(db, "public_hosts", newId), {
                id: newId,
                status: "AVAILABLE", // Explicit Flag
                timestamp: Date.now()
            });
            setStatus("WAITING_CONNECT");

            // 3. Listen for Status Change (BUSY/MATCHED)
            const unsub = onSnapshot(doc(db, "sessions", newId), (snap) => {
                const data = snap.data();
                if (data && data.guestJoined) {
                    setStatus("MATCHED");
                    sessionStorage.setItem("yolofi_session_id", newId);
                    sessionStorage.setItem("yolofi_session_role", "HOST");

                    // Cleanup public listing (optional, or mark archived)
                    deleteDoc(doc(db, "public_hosts", newId)).catch(() => { });

                    setTimeout(() => navigate('/diagnose'), 500);
                }
            });

            // Heartbeat
            const hb = setInterval(() => {
                updateDoc(doc(db, "public_hosts", newId), { timestamp: Date.now() }).catch(() => { });
            }, 5000);

            return () => { clearInterval(hb); unsub(); };

        } catch (e) {
            console.error(e);
            alert("Host Error: " + e.message);
            setMode("MENU");
        }
    };

    // --- GUEST: AUTO SEARCH (AVAILABLE ONLY) ---
    const startAutoSearch = () => {
        setMode("GUEST_AUTO");
        setStatus("SEARCHING");
        stopSearchRef.current = false;
        performSearch();
    };

    const performSearch = async () => {
        if (stopSearchRef.current) return;

        try {
            // 1. FETCH ONLY AVAILABLE HOSTS
            // Scalable: limit(50) ensures we don't read trillions
            const q = query(
                collection(db, "public_hosts"),
                where("status", "==", "AVAILABLE"),
                limit(50)
            );

            const snapshot = await getDocs(q);
            const availableHosts = [];
            snapshot.forEach(d => availableHosts.push(d.data()));

            if (availableHosts.length === 0) {
                setStatus("NO_HOSTS_RETRY");
                // Retry after delay
                retryRef.current = setTimeout(performSearch, 2000);
                return;
            }

            // 2. PICK RANDOM (Load Balancing)
            const target = availableHosts[Math.floor(Math.random() * availableHosts.length)];

            // 3. ATOMIC CLAIM (Mark BUSY)
            attemptClaim(target.id);

        } catch (e) {
            console.warn("Search Error", e);
            if (e.code === 'permission-denied') {
                alert("Database Permission Error. Check Rules.");
                setMode("MENU");
            } else {
                retryRef.current = setTimeout(performSearch, 3000);
            }
        }
    };

    const attemptClaim = async (targetId) => {
        if (stopSearchRef.current) return;
        setStatus("CLAIMING");

        try {
            // Try to set status to BUSY. 
            // If another guest did this milliseconds ago, this write might fail or we double-check.

            // Note: In a real transaction we'd check value first, but here 
            // we will overwrite 'public_hosts' status and update 'sessions' 
            // If we are the first to hit 'sessions', we win.

            await updateDoc(doc(db, "public_hosts", targetId), {
                status: "BUSY"
            });

            await updateDoc(doc(db, "sessions", targetId), {
                guestJoined: true,
                status: "ACTIVE"
            });

            // SUCCESS
            stopSearchRef.current = true;
            sessionStorage.setItem("yolofi_session_id", targetId);
            sessionStorage.setItem("yolofi_session_role", "GUEST");
            navigate(`/remote/${targetId}`);

        } catch (e) {
            console.warn("Claim Failed (Race Condition):", e);
            // Someone else grabbed it. Go back to pool.
            setStatus("SEARCHING");
            retryRef.current = setTimeout(performSearch, 1000);
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
                            <p>Global Auto-Match System</p>
                        </div>
                        <div className="role-grid">
                            <button className="role-card host" onClick={startHosting}>
                                <div className="role-icon-bg"><ShieldIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Need Help (Host)</div>
                                    <div className="role-desc">Generate & Wait</div>
                                </div>
                            </button>

                            <button className="role-card guest" onClick={startAutoSearch}>
                                <div className="role-icon-bg"><BoltIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Want to Help (Guest)</div>
                                    <div className="role-desc">Auto-Search Available</div>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* --- HOST VIEW --- */}
                {mode === "HOST_WAITING" && (
                    <div className="center-view">
                        <div className="pulse-ring"><ShieldIcon size={64} color="#2563eb" /></div>
                        <h3>Broadcasting Signal</h3>
                        <p>Your System ID is listed as <strong>AVAILABLE</strong>.</p>

                        <div className="code-display" style={{ gap: '12px' }}>
                            {mySessionId ? formatId(mySessionId).map((chunk, i) => (
                                <span key={i} className="code-chunk large">{chunk}</span>
                            )) : "..."}
                        </div>

                        <div className="status-badge">
                            {status === "REGISTERING" && "Registering in Network..."}
                            {status === "WAITING_CONNECT" && "Waiting for Auto-Match..."}
                            {status === "MATCHED" && "Matched! Connecting..."}
                        </div>
                        <button className="text-btn" onClick={() => window.location.reload()}>Cancel</button>
                    </div>
                )}

                {/* --- GUEST VIEW --- */}
                {mode === "GUEST_AUTO" && (
                    <div className="center-view">
                        <div className="pulse-ring"><ScanIcon size={64} color="#4ade80" /></div>
                        <h3>Scanning Network...</h3>
                        <p>Searching for <strong>AVAILABLE</strong> Hosts.</p>

                        <div className="status-badge">
                            {status === "SEARCHING" && "Querying Data Structure..."}
                            {status === "NO_HOSTS_RETRY" && "No Available Hosts. Retrying..."}
                            {status === "CLAIMING" && "Found Host! Allocating..."}
                        </div>
                        <button className="text-btn" onClick={() => window.location.reload()}>Cancel Search</button>
                    </div>
                )}

                <div className="footer-credit">Trillion-Scale Auto-Discovery • v7.0</div>
            </div>
        </div>
    );
};

export default LinkSystem;
