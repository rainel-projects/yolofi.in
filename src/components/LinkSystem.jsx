import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import peerRelay from "../services/PeerRelay";
import { BoltIcon, ShieldIcon, ScanIcon } from "./Icons";
import "./LinkSystem.css";

// 12-Digit ID
// Secure High-Entropy ID
const generateId = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const segment = () => Array(4).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
    return `${segment()}-${segment()}-${segment()}-${segment()}`;
};

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
                // PeerRelay now handles shard selection
                await peerRelay.connect();
                console.log('✅ Connected to relay server');
            } catch (e) {
                console.error('❌ Failed to connect to relay server:', e);
                setErrorMsg("Relay server offline. Please start the server.");
            }
        };

        connectRelay();

        // PERSISTENCE: Do not disconnect on unmount so we can navigate to /diagnose
        // Connection will remain active for the singleton instance.
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

            // Listen for registration confirmation (Implicitly ready when socket opens, but we can assume done)
            // Wait for GUEST to join to go LIVE
            peerRelay.on('CONNECTED', (guestId) => {
                console.log(`✅ P2P Established with ${guestId}`);
                setStatus("MATCHED");
                // Save for consistency
                sessionStorage.setItem("yolofi_session_id", newId);
                sessionStorage.setItem("yolofi_session_role", "HOST");
                setTimeout(() => navigate('/host-live'), 800);
            });

            setStatus("ONLINE_WAITING");

            return () => { };

        } catch (e) {
            console.error(e);
            setErrorMsg("Error: " + e.message);
            setStatus("ERROR");
        }
    };

    // --- GUEST: O(1) LOOKUP & P2P ---
    const startGuestSearch = async () => {
        const key = prompt("Enter Host Key (e.g. A7K9...):");
        if (!key) return;

        setMode("GUEST_AUTO");
        setStatus("CONNECTING");
        setErrorMsg(null);

        // We don't generate ID here, server assigns socket ID. we handle connection.

        try {
            // Register as GUEST
            peerRelay.joinHost(key);

            peerRelay.on('READY', () => {
                setStatus("MATCHED");
                sessionStorage.setItem("yolofi_session_id", key);
                sessionStorage.setItem("yolofi_session_role", "GUEST");
                setTimeout(() => navigate(`/remote/${key}`), 500);
            });

            peerRelay.on('ERROR', (err) => {
                setErrorMsg(err);
                setStatus("ERROR");
            });

        } catch (e) {
            console.error(e);
            setErrorMsg("Connection Error: " + e.message);
            setStatus("ERROR");
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
                                <h3>Connection Error</h3>
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
                                    {status === "CONNECTING" && "Handshaking with Host..."}
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
