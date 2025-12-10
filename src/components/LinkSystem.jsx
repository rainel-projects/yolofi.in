import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, setDoc, getDoc, updateDoc, collection, onSnapshot, query, where, orderBy, limit, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BoltIcon, ShieldIcon, ScanIcon, SearchIcon, CheckCircleIcon } from "./Icons";
import "./LinkSystem.css";

// Generate 9-Digit ID (formatted as string)
// Range: 100,000,000 to 999,999,999 (900 Million combinations)
const generateRoomId = () => Math.floor(100000000 + Math.random() * 900000000).toString();

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

        // OPTIMISTIC UPDATE: Generate and show ID immediately so user isn't stuck waiting
        let newId = generateRoomId();
        setMySessionId(newId);

        try {
            // COLLISION CHECK (Best Effort)
            // If network is offline, we SKIP the check to allow the UI to function
            try {
                let isUnique = false;
                let retries = 0;
                while (!isUnique && retries < 3) {
                    const checkRef = doc(db, "sessions", newId);
                    const checkSnap = await getDoc(checkRef);
                    if (!checkSnap.exists()) {
                        isUnique = true;
                    } else {
                        // Collision! Generate new one
                        newId = generateRoomId();
                        setMySessionId(newId); // Update UI
                        retries++;
                    }
                }
            } catch (networkError) {
                console.warn("Offline/Network Error during check. Proceeding optimistically.", networkError);
                // Proceed to 'setDoc' anyway - Firebase handles offline writes
            }

            // 1. Create Private Sesion Doc
            const sessionRef = doc(db, "sessions", newId);
            await setDoc(sessionRef, {
                created: Date.now(),
                status: "WAITING",
                hostJoined: true
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
            }, (error) => {
                console.error("Snapshot Error:", error);
            });

            // 4. Heatbeat Loop
            const interval = setInterval(() => {
                updateDoc(doc(db, "public_hosts", newId), { lastActive: Date.now() })
                    .catch(() => { });
            }, 4000);

            return () => {
                clearInterval(interval);
                unsub();
            };

        } catch (e) {
            console.error("Host Error:", e);
            // Even on error, we stay in "WAITING" mode if state was set
            // Only alert if we critically failed before generating ID
            if (!newId) {
                alert("Error: " + e.message);
                setMode("MENU");
            }
        }
    };

    // --- GUEST LOGIC ---
    useEffect(() => {
        if (mode === "GUEST_FIND") {
            const q = query(
                collection(db, "public_hosts"),
                orderBy("lastActive", "desc"),
                limit(20)
            );

            // Using try/catch specifically for the listener setup isn't standard,
            // but we can handle the error callback
            const unsub = onSnapshot(q, (snapshot) => {
                const valid = [];
                const now = Date.now();
                snapshot.forEach(d => {
                    const data = d.data();
                    if (now - data.lastActive < 10000) {
                        valid.push(data);
                    }
                });
                setRecentHosts(valid);
            }, (error) => {
                console.log("Guest list unavailable (Offline?):", error);
                // Cannot fetch list, but manual search might still work if cache exists
            });
            return () => unsub();
        }
    }, [mode]);

    const joinSession = async (targetIdInput) => {
        const targetId = targetIdInput.replace(/\D/g, "");

        if (!targetId || targetId.length !== 9) {
            alert("Please enter a valid 9-digit ID.");
            return;
        }

        setStatus("CONNECTING");

        try {
            const sessionRef = doc(db, "sessions", targetId);
            const sessionSnap = await getDoc(sessionRef);

            if (sessionSnap.exists()) {
                await updateDoc(sessionRef, {
                    guestJoined: true,
                    status: "ACTIVE"
                });

                sessionStorage.setItem("yolofi_session_id", targetId);
                sessionStorage.setItem("yolofi_session_role", "GUEST");
                navigate(`/remote/${targetId}`);
            } else {
                alert("Session ID not found. The host may be offline or the code is incorrect.");
                setStatus("IDLE");
            }
        } catch (e) {
            console.error("Join Error:", e);
            alert("Connection Failed: " + e.message);
            setStatus("IDLE");
        }
    };

    // Helper to format ID nicely (123 456 789)
    const formatIdDisplay = (id) => {
        if (!id) return [];
        return id.match(/.{1,3}/g) || [];
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
                                    <div className="role-desc">Connect to a PC using a 9-digit ID.</div>
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
                        <p>Share this Secure ID with your helper.</p>

                        <div className="code-display">
                            {mySessionId ? formatIdDisplay(mySessionId).map((chunk, i) => (
                                <span key={i} className="code-chunk">{chunk}</span>
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
