import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc, updateDoc, collection, onSnapshot, query, where, orderBy, limit, deleteDoc, enableNetwork } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BoltIcon, ShieldIcon, ScanIcon, SearchIcon, CheckCircleIcon } from "./Icons";
import "./LinkSystem.css";

// Generate 9-Digit ID (formatted as string)
const generateRoomId = () => Math.floor(100000000 + Math.random() * 900000000).toString();

const LinkSystem = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("MENU");
    const [mySessionId, setMySessionId] = useState(null);
    const [recentHosts, setRecentHosts] = useState([]);
    const [searchId, setSearchId] = useState("");
    const [status, setStatus] = useState("IDLE");

    // 1. INITIALIZE NETWORK (No Auth)
    useEffect(() => {
        // Force network connection if possible
        try { enableNetwork(db); } catch (e) { }
    }, []);

    // --- HOST LOGIC ---
    const startHosting = async () => {
        setMode("HOST_WAITING");

        // INSTANT ID GENERATION (Client Side)
        let newId = generateRoomId();
        setMySessionId(newId);

        try {
            // Collision Check (Best Effort - Skipped if offline)
            try {
                const checkRef = doc(db, "sessions", newId);
                const checkSnap = await getDoc(checkRef);
                if (checkSnap.exists()) {
                    newId = generateRoomId();
                    setMySessionId(newId);
                }
            } catch (e) {
                console.warn("Offline/Network check skipped. Using generated ID.");
            }

            // 1. Create Private Doc (Unauthenticated)
            const sessionRef = doc(db, "sessions", newId);
            await setDoc(sessionRef, {
                created: Date.now(),
                status: "WAITING",
                hostJoined: true,
                hostUid: "anon_guest" // No real Auth UID
            });

            // 2. Publish to 'public_hosts'
            await setDoc(doc(db, "public_hosts", newId), {
                id: newId,
                lastActive: Date.now(),
                status: "ONLINE"
            });

            // 3. Listen for Guest Join
            const unsub = onSnapshot(sessionRef, (snap) => {
                const data = snap.data();
                if (data && data.guestJoined) {
                    sessionStorage.setItem("yolofi_session_id", newId);
                    sessionStorage.setItem("yolofi_session_role", "HOST");
                    deleteDoc(doc(db, "public_hosts", newId)).catch(console.error);
                    navigate('/diagnose');
                }
            });

            // 4. Heartbeat
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
            // Realtime Listener
            const unsub = onSnapshot(q, (snapshot) => {
                const valid = [];
                snapshot.forEach(d => valid.push(d.data()));
                setRecentHosts(valid);
            }, (err) => {
                console.warn("Guest List Error (likely permission or offline):", err);
            });
            return () => unsub();
        }
    }, [mode]);

    const joinSession = async (targetIdInput) => {
        const targetId = targetIdInput.replace(/\D/g, "");

        if (!targetId || targetId.length !== 9) {
            alert("Enter valid 9-digit ID"); return;
        }

        setStatus("CONNECTING");

        // 1. CACHE CHECK
        if (recentHosts.some(h => h.id === targetId)) {
            console.log("🚀 Found in Cache!");
            await connectToId(targetId);
            return;
        }

        // 2. REALTIME SEARCH
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
                // If it fails due to permissions, we alert but often navigating allows fallback
                alert("Connection Error. Check console.");
                setStatus("IDLE");
            }
        }
    };

    const formatIdDisplay = (id) => (id ? id.match(/.{1,3}/g) || [] : []);

    return (
        <div className="link-system-container">
            <div className="glass-card">
                {mode === "MENU" && (
                    <>
                        <div className="intro-text">
                            <h2>Remote Diagnostics</h2>
                            <p>Professional Peer-to-Peer Fix Tool</p>
                        </div>
                        <div className="role-grid">
                            <button className="role-card host" onClick={startHosting}>
                                <div className="role-icon-bg"><ShieldIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Need Help (Host)</div>
                                    <div className="role-desc">Generate ID</div>
                                </div>
                            </button>

                            <button className="role-card guest" onClick={() => setMode("GUEST_FIND")}>
                                <div className="role-icon-bg"><BoltIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Want to Help (Guest)</div>
                                    <div className="role-desc">Join via ID</div>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* --- HOST WAITING --- */}
                {mode === "HOST_WAITING" && (
                    <div className="center-view">
                        <div className="pulse-ring"><ShieldIcon size={64} color="#2563eb" /></div>
                        <h3>Broadcasting Signal...</h3>
                        <div className="code-display">
                            {mySessionId ? formatIdDisplay(mySessionId).map((chunk, i) => (
                                <span key={i} className="code-chunk">{chunk}</span>
                            )) : "Generating..."}
                        </div>
                        <p className="status-text">Waiting for guest...</p>
                        <button className="text-btn" onClick={() => window.location.reload()}>Cancel</button>
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
                                placeholder="ID: 123 456 789"
                                maxLength={11}
                                value={searchId}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    let formatted = val;
                                    if (val.length > 3) formatted = val.slice(0, 3) + " " + val.slice(3);
                                    if (val.length > 6) formatted = formatted.slice(0, 7) + " " + val.slice(6);
                                    setSearchId(formatted);
                                }}
                            />
                            <button
                                className="join-btn"
                                disabled={searchId.replace(/\D/g, '').length !== 9}
                                onClick={() => joinSession(searchId)}
                            >
                                {status === "CONNECTING" ? "Searching..." : "Connect"}
                            </button>
                        </div>
                        <div className="recent-list-container">
                            <h4>Active Sessions</h4>
                            {recentHosts.length === 0 ? <div className="empty-list">Scanning...</div> :
                                recentHosts.map(h => (
                                    <div key={h.id} className="recent-item" onClick={() => joinSession(h.id)}>
                                        <div className="signal-dot"></div>
                                        <span>Device #{h.id}</span>
                                        <span className="connect-link">Join &rarr;</span>
                                    </div>
                                ))
                            }
                        </div>
                        <button className="text-btn" onClick={() => setMode("MENU")}>Back</button>
                    </div>
                )}

                <div className="footer-credit">Secure P2P Protocol • v2.1.0</div>
            </div>
        </div>
    );
};

export default LinkSystem;
