import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc, updateDoc, collection, onSnapshot, query, where, orderBy, limit, deleteDoc, enableNetwork } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BoltIcon, ShieldIcon, ScanIcon, SearchIcon, CheckCircleIcon } from "./Icons";
import "./LinkSystem.css";

// Generate 12-Digit ID (1 Trillion Combinations)
// Format: 1234 5678 9012
const generateRoomId = () => {
    const min = 100000000000;
    const max = 999999999999;
    return Math.floor(min + Math.random() * (max - min)).toString();
};

const LinkSystem = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("MENU");
    const [mySessionId, setMySessionId] = useState(null);
    const [recentHosts, setRecentHosts] = useState([]);
    const [searchId, setSearchId] = useState("");
    const [status, setStatus] = useState("IDLE");

    // 1. INITIALIZE NETWORK
    useEffect(() => {
        try { enableNetwork(db); } catch (e) { }
    }, []);

    // --- HOST LOGIC ---
    const startHosting = async () => {
        setMode("HOST_WAITING");

        // 12-Digit ID Generation
        let newId = generateRoomId();
        setMySessionId(newId);

        try {
            // Collision Check
            try {
                const checkRef = doc(db, "sessions", newId);
                const checkSnap = await getDoc(checkRef);
                if (checkSnap.exists()) {
                    newId = generateRoomId();
                    setMySessionId(newId);
                }
            } catch (e) {
                console.warn("Offline check skipped.");
            }

            // 1. Create Private Doc
            const sessionRef = doc(db, "sessions", newId);
            await setDoc(sessionRef, {
                created: Date.now(),
                status: "WAITING",
                hostJoined: true,
                hostUid: "anon_host"
            });

            // 2. Publish to 'public_hosts'
            await setDoc(doc(db, "public_hosts", newId), {
                id: newId,
                lastActive: Date.now(),
                status: "ONLINE"
            });

            // 3. Listen for Guest
            const unsub = onSnapshot(sessionRef, (snap) => {
                const data = snap.data();
                if (data && data.guestJoined) {
                    sessionStorage.setItem("yolofi_session_id", newId);
                    sessionStorage.setItem("yolofi_session_role", "HOST");
                    // Cleanup public listing so it doesn't clutter the "Trillion" user list
                    deleteDoc(doc(db, "public_hosts", newId)).catch(console.error);
                    navigate('/diagnose');
                }
            });

            const interval = setInterval(() => {
                updateDoc(doc(db, "public_hosts", newId), { lastActive: Date.now() }).catch(() => { });
            }, 4000);

            return () => { clearInterval(interval); unsub(); };

        } catch (e) {
            console.error("Host Error:", e);
        }
    };

    // --- GUEST LOGIC ---
    useEffect(() => {
        if (mode === "GUEST_FIND") {
            const q = query(collection(db, "public_hosts"), orderBy("lastActive", "desc"), limit(20));
            const unsub = onSnapshot(q, (snapshot) => {
                const valid = [];
                snapshot.forEach(d => valid.push(d.data()));
                setRecentHosts(valid);
            }, (err) => console.warn(err));
            return () => unsub();
        }
    }, [mode]);

    const joinSession = async (targetIdInput) => {
        const targetId = targetIdInput.replace(/\D/g, "");

        if (!targetId || targetId.length !== 12) {
            alert("Enter valid 12-digit ID"); return;
        }

        setStatus("CONNECTING");

        // 1. CACHE (Local Efficiency)
        if (recentHosts.some(h => h.id === targetId)) {
            await connectToId(targetId);
            return;
        }

        // 2. GLOBAL SCALABLE SEARCH (Direct Index Look-up)
        // This is O(1) in Firestore, supporting trillions of records.
        let found = false;
        const sessionRef = doc(db, "sessions", targetId);

        const unsub = onSnapshot(sessionRef, (docSnap) => {
            if (docSnap.exists() && !found) {
                found = true;
                connectToId(targetId);
                unsub();
            }
        });

        setTimeout(() => {
            if (!found) {
                unsub();
                setStatus("IDLE");
                alert("Session ID not found. Ensure Host is online.");
            }
        }, 8000);
    };

    const connectToId = async (id) => {
        try {
            await updateDoc(doc(db, "sessions", id), {
                guestJoined: true,
                status: "ACTIVE"
            });
            sessionStorage.setItem("yolofi_session_id", id);
            sessionStorage.setItem("yolofi_session_role", "GUEST");
            navigate(`/remote/${id}`);
        } catch (e) {
            console.error("Join Failed:", e);
            if (e.message.includes("offline")) {
                navigate(`/remote/${id}`);
            } else {
                alert("Connection Error. Check console.");
                setStatus("IDLE");
            }
        }
    };

    // Helper: 1234 5678 9012 (Chunks of 4)
    const formatIdDisplay = (id) => (id ? id.match(/.{1,4}/g) || [] : []);

    return (
        <div className="link-system-container">
            <div className="glass-card">
                {mode === "MENU" && (
                    <>
                        <div className="intro-text">
                            <h2>Remote Diagnostics</h2>
                            <p>Global P2P Scale Network</p>
                        </div>
                        <div className="role-grid">
                            <button className="role-card host" onClick={startHosting}>
                                <div className="role-icon-bg"><ShieldIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Need Help (Host)</div>
                                    <div className="role-desc">Generate Secure ID</div>
                                </div>
                            </button>

                            <button className="role-card guest" onClick={() => setMode("GUEST_FIND")}>
                                <div className="role-icon-bg"><BoltIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Want to Help (Guest)</div>
                                    <div className="role-desc">Connect via ID</div>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* --- HOST WAITING --- */}
                {mode === "HOST_WAITING" && (
                    <div className="center-view">
                        <div className="pulse-ring"><ShieldIcon size={64} color="#2563eb" /></div>
                        <h3>Global Broadcast</h3>
                        <p>Share this 12-digit ID with your helper.</p>

                        <div className="code-display" style={{ gap: '12px' }}>
                            {mySessionId ? formatIdDisplay(mySessionId).map((chunk, i) => (
                                <span key={i} className="code-chunk large">{chunk}</span>
                            )) : "Generating..."}
                        </div>

                        <p className="status-text">Signal Active. Waiting for connection...</p>
                        <button className="text-btn" onClick={() => window.location.reload()}>Cancel Session</button>
                    </div>
                )}

                {/* --- GUEST FIND --- */}
                {mode === "GUEST_FIND" && (
                    <div className="guest-view">
                        <h3>Connect to Device</h3>

                        <div className="search-box">
                            <SearchIcon size={20} color="#9ca3af" />
                            <input
                                type="text"
                                placeholder="ID: 1234 5678 9012"
                                maxLength={14}
                                value={searchId}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    let formatted = val;
                                    // Format: 1234 5678 9012
                                    if (val.length > 4) formatted = val.slice(0, 4) + " " + val.slice(4);
                                    if (val.length > 8) formatted = formatted.slice(0, 9) + " " + val.slice(8);
                                    setSearchId(formatted);
                                }}
                            />
                            <button
                                className="join-btn"
                                disabled={searchId.replace(/\D/g, '').length !== 12}
                                onClick={() => joinSession(searchId)}
                            >
                                {status === "CONNECTING" ? "Searching..." : "Connect"}
                            </button>
                        </div>

                        <div className="recent-list-container">
                            <h4>Public Sessions (Global)</h4>
                            {recentHosts.length === 0 ? (
                                <div className="empty-list">Searching global feed...</div>
                            ) : (
                                <div className="recent-list">
                                    {recentHosts.map(h => (
                                        <div key={h.id} className="recent-item" onClick={() => joinSession(h.id)}>
                                            <div className="signal-dot"></div>
                                            <span className="device-id">#{h.id}</span>
                                            <span className="connect-link">Connect &rarr;</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className="text-btn" onClick={() => setMode("MENU")}>Back</button>
                    </div>
                )}

                <div className="footer-credit">Trillion-Scale Network Architecture • v3.0</div>
            </div>
        </div>
    );
};

export default LinkSystem;
