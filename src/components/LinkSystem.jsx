import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import peerRelay from "../services/PeerRelay";
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
    const [availableGuests, setAvailableGuests] = useState([]);
    const [availableHosts, setAvailableHosts] = useState([]);

    // Connect to relay server on mount
    useEffect(() => {
        const connectRelay = async () => {
            try {
                await peerRelay.connect();
                console.log('✅ Connected to relay server');
            } catch (e) {
                console.error('❌ Failed to connect to relay server:', e);
                setErrorMsg("Relay server offline. Please start the server.");
            }
        };

        connectRelay();

        // Cleanup on unmount
        return () => {
            peerRelay.disconnect();
        };
    }, []);

    // --- HOST: O(1) REGISTER ---
    const startHosting = async () => {
        setMode("HOST_WAITING");
        setStatus("BROADCASTING");
        setErrorMsg(null);

        const newId = generateId();
        setMySessionId(newId);

        try {
            // O(1) Write - INSTANT
            peerRelay.registerHost(newId);

            // Listen for registration confirmation
            peerRelay.on('REGISTERED', (msg) => {
                if (msg.id === newId) {
                    setStatus("ONLINE_WAITING");
                    console.log('✅ Host registered successfully');
                }
            });

            // Listen for available guests
            peerRelay.on('GUEST_AVAILABLE', (msg) => {
                setAvailableGuests(prev => {
                    if (!prev.find(g => g.id === msg.guestId)) {
                        return [...prev, { id: msg.guestId, timestamp: Date.now() }];
                    }
                    return prev;
                });
            });

            // Listen for match
            peerRelay.on('MATCHED', (msg) => {
                setStatus("MATCHED");
                sessionStorage.setItem("yolofi_session_id", newId);
                sessionStorage.setItem("yolofi_session_role", "HOST");
                setTimeout(() => navigate('/diagnose'), 500);
            });

            // Heartbeat
            const hb = setInterval(() => {
                peerRelay.heartbeat(newId);
            }, 5000);

            return () => clearInterval(hb);

        } catch (e) {
            console.error(e);
            setErrorMsg("Error: " + e.message);
            setStatus("ERROR");
        }
    };

    // --- GUEST: O(1) SCAN & CLAIM ---
    const startGuestSearch = async () => {
        setMode("GUEST_AUTO");
        setStatus("REGISTERING");
        setErrorMsg(null);

        const guestId = generateId();
        setMySessionId(guestId);

        try {
            // O(1) Write - INSTANT
            peerRelay.registerGuest(guestId);

            setStatus("SCANNING");

            // Listen for available hosts
            peerRelay.on('HOSTS_LIST', (msg) => {
                console.log('📋 Available hosts:', msg.hosts);
                setAvailableHosts(msg.hosts);

                if (msg.hosts.length > 0) {
                    // Auto-claim first available host
                    attemptClaim(msg.hosts[0], guestId);
                } else {
                    setStatus("WAITING_FOR_HOSTS");
                }
            });

            // Listen for new hosts
            peerRelay.on('HOST_AVAILABLE', (msg) => {
                setAvailableHosts(prev => [...prev, msg.hostId]);
                // Auto-claim if we're waiting
                if (status === "WAITING_FOR_HOSTS") {
                    attemptClaim(msg.hostId, guestId);
                }
            });

            // Listen for match
            peerRelay.on('MATCHED', (msg) => {
                setStatus("MATCHED");
                sessionStorage.setItem("yolofi_session_id", msg.hostId);
                sessionStorage.setItem("yolofi_session_role", "GUEST");
                setTimeout(() => navigate(`/remote/${msg.hostId}`), 500);
            });

            // Listen for claim failure
            peerRelay.on('CLAIM_FAILED', (msg) => {
                console.warn('Claim failed:', msg.reason);
                setStatus("SCANNING");
            });

            // Heartbeat
            const hb = setInterval(() => {
                peerRelay.heartbeat(guestId);
            }, 5000);

            return () => clearInterval(hb);

        } catch (e) {
            console.error(e);
            setErrorMsg("Scan Error: " + e.message);
            setStatus("ERROR");
        }
    };

    const attemptClaim = (targetId, guestId) => {
        setStatus("CLAIMING");
        peerRelay.claimHost(targetId, guestId);
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
                            <p>WebSocket Network • O(1) Discovery</p>
                        </div>
                        <div className="role-grid">
                            <button className="role-card host" onClick={startHosting}>
                                <div className="role-icon-bg"><ShieldIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Need Help (Host)</div>
                                    <div className="role-desc">Instant Registration</div>
                                </div>
                            </button>

                            <button className="role-card guest" onClick={startGuestSearch}>
                                <div className="role-icon-bg"><BoltIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">I Want to Help (Guest)</div>
                                    <div className="role-desc">Instant Discovery</div>
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
                                <h3>Connection Failed</h3>
                                <p className="error-text">{errorMsg}</p>
                            </>
                        ) : (
                            <>
                                <h3>{status === "ONLINE_WAITING" ? "You Are Live" : "Connecting..."}</h3>
                                {status === "ONLINE_WAITING" && <p>Registered in Relay. Waiting for Guest...</p>}

                                <div className="code-display" style={{ gap: '12px' }}>
                                    {mySessionId ? formatId(mySessionId).map((chunk, i) => (
                                        <span key={i} className="code-chunk large">{chunk}</span>
                                    )) : "..."}
                                </div>

                                {status === "ONLINE_WAITING" && availableGuests.length > 0 && (
                                    <div className="guest-list" style={{ marginTop: '20px', padding: '15px', background: 'rgba(37,99,235,0.1)', borderRadius: '12px' }}>
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#60a5fa' }}>
                                            {availableGuests.length} Guest{availableGuests.length > 1 ? 's' : ''} Searching
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {availableGuests.slice(0, 5).map((guest, idx) => (
                                                <div key={guest.id} style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                    Guest #{formatId(guest.id).join('')}
                                                </div>
                                            ))}
                                            {availableGuests.length > 5 && (
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>+{availableGuests.length - 5} more...</div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="status-badge">
                                    {status === "BROADCASTING" && "Registering..."}
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
                                    {status === "REGISTERING" && "Connecting to Relay..."}
                                    {status === "SCANNING" && "Searching Pool..."}
                                    {status === "WAITING_FOR_HOSTS" && "Pool Empty. Waiting..."}
                                    {status === "CLAIMING" && "Host Found! Connecting..."}
                                    {status === "MATCHED" && "Success! Redirecting..."}
                                </div>
                            </>
                        )}
                        <button className="text-btn" onClick={() => window.location.reload()}>Cancel Search</button>
                    </div>
                )}

                <div className="footer-credit">WebSocket Relay • O(1) Discovery • v10.0</div>
            </div>
        </div>
    );
};

export default LinkSystem;
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
    const [availableGuests, setAvailableGuests] = useState([]);
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

            // 3. Commit and Wait for Success
            await batch.commit();

            // 4. Update UI After Write Success
            setStatus("ONLINE_WAITING");

            // 5. Listen for Guests (NEW)
            const guestQuery = query(
                collection(db, "public_guests"),
                where("status", "==", "SEARCHING")
            );
            const unsubGuests = onSnapshot(guestQuery, (snapshot) => {
                const guests = [];
                snapshot.forEach(doc => guests.push(doc.data()));
                setAvailableGuests(guests);
            });

            // 6. Listen for Match
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

            return () => { clearInterval(hb); unsub(); unsubGuests(); };

        } catch (e) {
            console.error(e);
            setErrorMsg("Error: " + e.message);
            setStatus("ERROR");
        }
    };

    // --- GUEST: REALTIME SCAN & CLAIM ---
    const startGuestSearch = () => {
        setMode("GUEST_AUTO");
        setStatus("REGISTERING");
        setErrorMsg(null);

        const guestId = generateId();
        setMySessionId(guestId);

        // Register as Guest in public pool
        const guestRef = doc(db, "public_guests", guestId);
        setDoc(guestRef, {
            id: guestId,
            status: "SEARCHING",
            timestamp: Date.now()
        }).catch(e => console.warn("Guest Registration:", e));

        setStatus("SCANNING");

        // Realtime Listener for ANY available host
        const q = query(
            collection(db, "public_hosts"),
            where("status", "==", "AVAILABLE"),
            limit(1)
        );

        guestListenerRef.current = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                setStatus("WAITING_FOR_HOSTS");
                return;
            }

            const target = snapshot.docs[0].data();
            attemptClaim(target.id, guestId);

        }, (err) => {
            console.error(err);
            setErrorMsg("Scan Error: " + err.message);
            setStatus("ERROR");
        });
    };

    const attemptClaim = async (targetId, guestId) => {
        if (guestListenerRef.current) guestListenerRef.current();
        setStatus("CLAIMING");

        try {
            // Cleanup guest registration
            deleteDoc(doc(db, "public_guests", guestId)).catch(() => { });

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

                                {status === "ONLINE_WAITING" && availableGuests.length > 0 && (
                                    <div className="guest-list" style={{ marginTop: '20px', padding: '15px', background: 'rgba(37,99,235,0.1)', borderRadius: '12px' }}>
                                        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#60a5fa' }}>
                                            {availableGuests.length} Guest{availableGuests.length > 1 ? 's' : ''} Searching
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {availableGuests.slice(0, 5).map((guest, idx) => (
                                                <div key={guest.id} style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                    Guest #{formatId(guest.id).join('')}
                                                </div>
                                            ))}
                                            {availableGuests.length > 5 && (
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>+{availableGuests.length - 5} more...</div>
                                            )}
                                        </div>
                                    </div>
                                )}

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
