import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import swarmPeer from "../services/SwarmPeerService";
import manualPeer from "../services/ManualPeerService"; // Keep backup if needed
import { BoltIcon, ShieldIcon, ScanIcon, CheckCircleIcon } from "./Icons";
import "./LinkSystem.css";

const LinkSystem = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("MENU");
    const [status, setStatus] = useState("IDLE");
    const [peerList, setPeerList] = useState([]);
    const [connectedPeer, setConnectedPeer] = useState(null);

    useEffect(() => {
        // Global Swarm Listeners
        const updatePeers = (peers) => {
            // Filter: If I am GUEST, I want HOSTS. If I am HOST, I want GUESTS (maybe).
            // Actually, usually Guest finds Host.
            setPeerList(peers);
        };

        const handleOpen = (peerId) => {
            console.log("Global Link Established!");
            setStatus("CONNECTED");
            setConnectedPeer(peerId);
            setTimeout(() => {
                if (swarmPeer.role === 'HOST') {
                    navigate('/host-live');
                } else {
                    navigate('/remote/p2p');
                }
            }, 1000);
        };

        swarmPeer.on('peers-update', updatePeers);
        swarmPeer.on('open', handleOpen);

        return () => {
            // Cleanup? swarmPeer persists singleton
        };
    }, [navigate]);

    // --- HOST FLOW ---
    const startHosting = async () => {
        setMode("HOST_BROADCAST");
        setStatus("BROADCASTING");
        swarmPeer.connectToSwarm('HOST');
    };

    // --- GUEST FLOW ---
    const startGuest = () => {
        setMode("GUEST_SCAN");
        setStatus("SCANNING");
        swarmPeer.connectToSwarm('GUEST');
    };

    const joinHost = (targetPeerId) => {
        setStatus("CONNECTING");
        swarmPeer.connectToPeer(targetPeerId.trysteroId);
    };

    // Helper to filter peers
    const validHosts = peerList.filter(p => p.role === 'HOST');

    return (
        <div className="link-system-container">
            <div className="glass-card">
                {mode === "MENU" && (
                    <>
                        <div className="intro-text">
                            <h2>Remote Diagnostics</h2>
                            <p>Connect two devices instantly via Global Swarm.</p>
                        </div>
                        <div className="role-grid">
                            <button className="role-card host" onClick={startHosting}>
                                <div className="role-icon-bg"><ShieldIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">Get Support</div>
                                    <div className="role-desc">Share this device's specialized metrics with an expert or friend.</div>
                                </div>
                            </button>

                            <button className="role-card guest" onClick={startGuest}>
                                <div className="role-icon-bg"><BoltIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">Provide Support</div>
                                    <div className="role-desc">Connect to and diagnose a remote device from here.</div>
                                </div>
                            </button>
                        </div>

                        <div className="use-cases" style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                            <strong>Start here if you want to:</strong>
                            <ul style={{ textAlign: 'left', marginTop: '0.5rem', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                                <li>Fix a friend's browser remotely</li>
                                <li>Debug mobile performance from a desktop</li>
                                <li>Monitor a headless display</li>
                            </ul>
                        </div>
                    </>
                )}

                {/* --- HOST: BROADCASTING --- */}
                {mode === "HOST_BROADCAST" && (
                    <div className="center-view">
                        <div className="pulse-ring">
                            <ShieldIcon size={64} color="#2563eb" />
                            <div className="pulse-circle"></div>
                        </div>
                        <h3>You are Live</h3>
                        <p>Broadcasting to the Global Abstract Environment.</p>
                        <div className="status-badge">
                            {status === "CONNECTED" ? "Guest Connected!" : "Waiting for Stranger..."}
                        </div>

                        <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#94a3b8' }}>
                            Your Swarm ID: <span style={{ fontFamily: 'monospace' }}>{swarmPeer.myId}</span>
                        </div>
                        <button className="text-btn" onClick={() => window.location.reload()}>Disconnect</button>
                    </div>
                )}

                {/* --- GUEST: SCANNING --- */}
                {mode === "GUEST_SCAN" && (
                    <div className="center-view">
                        <h3>Global Discovery</h3>
                        <p>Scanning for hosts in the abstract swarm...</p>

                        <div className="recent-list-container" style={{ width: '100%', maxWidth: '400px', margin: '20px 0' }}>
                            <h4>Available Hosts ({validHosts.length})</h4>

                            <div className="recent-list">
                                {validHosts.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '20px', color: '#cbd5e1' }}>
                                        Scanning for signals...
                                    </div>
                                )}

                                {validHosts.map((peer, i) => (
                                    <div key={i} className="recent-item" onClick={() => joinHost(peer)}>
                                        <div className="signal-dot"></div>
                                        <div className="device-id">HOST #{peer.id}</div>
                                        <div className="connect-link">Connect</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="text-btn" onClick={() => window.location.reload()}>Cancel Scan</button>
                    </div>
                )}

                {status === "CONNECTED" && (
                    <div className="overlay-success">
                        <CheckCircleIcon size={64} color="#4ade80" />
                        <h2>Link Established</h2>
                        <p>Entering Abstract Environment...</p>
                    </div>
                )}

                <div className="footer-credit">BitTorrent Signaling • Global Swarm • v3.0</div>
            </div>
        </div>
    );
};

export default LinkSystem;
