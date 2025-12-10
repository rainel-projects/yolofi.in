import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc, updateDoc, collection, onSnapshot, query, where, orderBy, limit, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BoltIcon, ShieldIcon, ScanIcon, SearchIcon, CheckCircleIcon } from "./Icons";
import "./LinkSystem.css";

// Generate 6-Digit ID (Host-Driven)
const generateRoomId = () => Math.floor(100000 + Math.random() * 900000).toString();

const LinkSystem = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("MENU"); // MENU, HOST_WAITING, GUEST_FIND
    const [mySessionId, setMySessionId] = useState(null);
    const [recentHosts, setRecentHosts] = useState([]);
    const [searchId, setSearchId] = useState("");
    const [status, setStatus] = useState("IDLE");

    // --- HOST LOGIC ---
    const startHosting = async () => {
        setMode("HOST_WAITING");
        const newId = generateRoomId();
        setMySessionId(newId);

        try {
            // 1. Create Private Session Doc (for handshake)
            const sessionRef = doc(db, "sessions", newId);
            await setDoc(sessionRef, {
                created: Date.now(),
                status: "WAITING", // Changes to ACTIVE when Guest joins
                hostJoined: true
            });

            // 2. Publish to 'public_hosts' for Discovery (TTL Heartbeat)
            // separate collection so 'sessions' doesn't get flooded with reads
            await setDoc(doc(db, "public_hosts", newId), {
                id: newId,
                lastActive: Date.now(),
                status: "ONLINE"
            });

            // 3. Listen for Guest Join directly on the Session
            const unsub = onSnapshot(sessionRef, (snap) => {
                const data = snap.data();
                if (data && data.guestJoined) {
                    // Guest has arrived!
                    sessionStorage.setItem("yolofi_session_id", newId);
                    sessionStorage.setItem("yolofi_session_role", "HOST");
                    // Cleanup public listing so no one else tries to join
                    deleteDoc(doc(db, "public_hosts", newId)).catch(console.error);
                    navigate('/diagnose');
                }
            });

            // 4. Heatbeat Loop (Keep 'public_hosts' entry alive)
            const interval = setInterval(() => {
                updateDoc(doc(db, "public_hosts", newId), { lastActive: Date.now() })
                    .catch(() => { }); // ignore errors (e.g. if doc deleted)
            }, 4000);

            return () => {
                clearInterval(interval);
                unsub();
            };

        } catch (e) {
            console.error("Host Error:", e);
            setStatus("ERROR");
        }
    };

    // --- GUEST LOGIC ---
    // Fetch top 20 recent hosts
    useEffect(() => {
        if (mode === "GUEST_FIND") {
            const q = query(
                collection(db, "public_hosts"),
                orderBy("lastActive", "desc"),
                limit(20)
            );

            const unsub = onSnapshot(q, (snapshot) => {
                const valid = [];
                const now = Date.now();
                snapshot.forEach(d => {
                    const data = d.data();
                    // Client-side stale check (10s)
                    if (now - data.lastActive < 10000) {
                        valid.push(data);
                    }
                });
                setRecentHosts(valid);
            });
            return () => unsub();
        }
    }, [mode]);

    const joinSession = async (targetId) => {
        if (!targetId || targetId.length !== 6) return;
        setStatus("CONNECTING");

        try {
            const sessionRef = doc(db, "sessions", targetId);
            const sessionSnap = await getDoc(sessionRef);

            if (sessionSnap.exists()) {
                // Determine if this is a valid room
                // Join the room
                await updateDoc(sessionRef, {
                    guestJoined: true,
                    status: "ACTIVE"
                });

                sessionStorage.setItem("yolofi_session_id", targetId);
                sessionStorage.setItem("yolofi_session_role", "GUEST");
                navigate(`/remote/${targetId}`);
            } else {
                alert("Session ID not found or expired.");
                setStatus("IDLE");
            }
        } catch (e) {
            console.error("Join Error:", e);
            alert("Connection Failed");
            setStatus("IDLE");
        }
    };

    return (
        <div className="link-system-container">
            <div className="glass-card">

                {/* --- MENU --- */}
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
                                    <div className="role-desc">Generate a secure ID for an expert to join.</div>
                                </div>
                            </button>

                            <button className="role-card guest" onClick={() => setMode("GUEST_FIND")}>
                                <div className="role-icon-bg"><BoltIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Want to Help (Guest)</div>
                                    <div className="role-desc">Connect to a device via ID or list.</div>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* --- HOST WAITING --- */}
                {mode === "HOST_WAITING" && (
                    <div className="center-view">
                        <div className="pulse-ring">
                            <div className="pulse-circle"></div>
                            <ShieldIcon size={64} color="#2563eb" />
                        </div>
                        <h3>Broadcasting Signal...</h3>
                        <p>Share this Connection ID with your helper.</p>

                        <div className="code-display">
                            {mySessionId ? mySessionId.split('').map((char, i) => (
                                <span key={i} className="code-char">{char}</span>
                            )) : "Wait..."}
                        </div>

                        <p className="status-text">Waiting for incoming connection...</p>
                        <button className="text-btn" onClick={() => window.location.reload()}>Cancel Session</button>
                    </div>
                )}

                {/* --- GUEST FIND --- */}
                {mode === "GUEST_FIND" && (
                    <div className="guest-view">
                        <h3>Connect to Device</h3>

                        {/* 1. Direct Search */}
                        <div className="search-box">
                            <SearchIcon size={20} color="#9ca3af" />
                            <input
                                type="text"
                                placeholder="Enter 6-Digit ID"
                                maxLength={6}
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value.replace(/\D/g, ''))}
                            />
                            <button
                                className="join-btn"
                                disabled={searchId.length !== 6}
                                onClick={() => joinSession(searchId)}
                            >
                                Connect
                            </button>
                        </div>

                        <div className="divider"><span>OR</span></div>

                        {/* 2. Recent List */}
                        <div className="recent-list-container">
                            <h4>Recent Broadcasts</h4>
                            {recentHosts.length === 0 ? (
                                <div className="empty-list">No local hosts detected.</div>
                            ) : (
                                <div className="recent-list">
                                    {recentHosts.map(h => (
                                        <div key={h.id} className="recent-item" onClick={() => joinSession(h.id)}>
                                            <div className="signal-dot"></div>
                                            <span className="device-id">Device #{h.id}</span>
                                            <span className="connect-link">Connect &rarr;</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button className="text-btn" onClick={() => setMode("MENU")}>Back</button>
                    </div>
                )}

                <div className="footer-credit">
                    Secure P2P Protocol • Inspired by TeamViewer Technology
                </div>
            </div>
        </div>
    );
};

export default LinkSystem;
