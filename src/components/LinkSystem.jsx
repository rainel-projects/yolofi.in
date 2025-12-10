import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import manualPeer from "../services/ManualPeerService";
import { BoltIcon, ShieldIcon, ScanIcon, CheckCircleIcon } from "./Icons";
import "./LinkSystem.css";

const LinkSystem = () => {
    const navigate = useNavigate();
    const [mode, setMode] = useState("MENU"); // MENU, HOST_GENERATE, HOST_WAIT_ANSWER, GUEST_INPUT, GUEST_GENERATE
    const [status, setStatus] = useState("IDLE");
    const [localCode, setLocalCode] = useState(""); // Offer for Host, Answer for Guest
    const [remoteCode, setRemoteCode] = useState("");
    const [copyStatus, setCopyStatus] = useState("Copy");

    useEffect(() => {
        // Global listener for connection
        manualPeer.on('open', () => {
            console.log("CHANNEL OPEN");
            setStatus("CONNECTED");
            setTimeout(() => {
                if (manualPeer.role === 'HOST') {
                    navigate('/host-live');
                } else {
                    navigate('/remote/p2p');
                }
            }, 1000);
        });

        return () => {
            // Cleanup listeners if needed
        };
    }, [navigate]);

    // --- HOST FLOW ---
    const startHosting = async () => {
        setMode("HOST_GENERATE");
        setStatus("GENERATING_OFFER");
        try {
            const offer = await manualPeer.generateOffer();
            setLocalCode(offer);
            setStatus("WAITING_SHARE");
        } catch (e) {
            console.error(e);
            setStatus("ERROR");
        }
    };

    const handleHostConnect = async () => {
        if (!remoteCode) return;
        setStatus("CONNECTING");
        try {
            await manualPeer.processAnswer(remoteCode);
            // Wait for 'open' event
        } catch (e) {
            console.error(e);
            setStatus("ERROR");
        }
    };

    // --- GUEST FLOW ---
    const startGuest = () => {
        setMode("GUEST_INPUT");
    };

    const handleGuestJoin = async () => {
        if (!remoteCode) return;
        setStatus("GENERATING_ANSWER");
        setMode("GUEST_GENERATE");
        try {
            const answer = await manualPeer.generateAnswer(remoteCode);
            setLocalCode(answer);
            setStatus("WAITING_RETURN");
        } catch (e) {
            console.error(e);
            setStatus("ERROR");
        }
    };

    // --- HELPER ---
    const copyToClipboard = () => {
        navigator.clipboard.writeText(localCode);
        setCopyStatus("Copied!");
        setTimeout(() => setCopyStatus("Copy"), 2000);
    };

    return (
        <div className="link-system-container">
            <div className="glass-card">
                {mode === "MENU" && (
                    <>
                        <div className="intro-text">
                            <h2>Peer Link</h2>
                            <p>Serverless • Encrypted • P2P</p>
                        </div>
                        <div className="role-grid">
                            <button className="role-card host" onClick={startHosting}>
                                <div className="role-icon-bg"><ShieldIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">Initialize Host</div>
                                    <div className="role-desc">Generate Connection Token</div>
                                </div>
                            </button>

                            <button className="role-card guest" onClick={startGuest}>
                                <div className="role-icon-bg"><BoltIcon size={32} /></div>
                                <div className="role-content">
                                    <div className="role-title">Join Session</div>
                                    <div className="role-desc">Input Host Token</div>
                                </div>
                            </button>
                        </div>
                    </>
                )}

                {/* --- HOST: SHOW OFFER --- */}
                {mode === "HOST_GENERATE" && (
                    <div className="center-view">
                        <h3>{status === "GENERATING_OFFER" ? "Generating Token..." : "Session Token Generated"}</h3>
                        <p style={{ marginBottom: '10px' }}>
                            {status === "GENERATING_OFFER" ? "Gathering secure candidates (this may take a few seconds)..." : "1. Copy this token and send it to your Guest."}
                        </p>

                        <div className="token-box">
                            <textarea readOnly value={status === "GENERATING_OFFER" ? "..." : localCode} className="code-area" />
                            {status !== "GENERATING_OFFER" && <button className="copy-btn" onClick={copyToClipboard}>{copyStatus}</button>}
                        </div>

                        <p style={{ marginTop: '20px', marginBottom: '10px' }}>2. Paste the Guest's response token below:</p>
                        <textarea
                            className="input-area"
                            placeholder="Paste Response Token here..."
                            value={remoteCode}
                            onChange={(e) => setRemoteCode(e.target.value)}
                        />

                        <button className="action-btn" onClick={handleHostConnect} disabled={!remoteCode}>
                            {status === "CONNECTING" ? "Verifying..." : "Establish Connection"}
                        </button>
                        <button className="text-btn" onClick={() => window.location.reload()}>Cancel</button>
                    </div>
                )}

                {/* --- GUEST: INPUT OFFER --- */}
                {mode === "GUEST_INPUT" && (
                    <div className="center-view">
                        <h3>Input Host Token</h3>
                        <p>Paste the huge block of text the Host sent you.</p>

                        <textarea
                            className="input-area"
                            placeholder="Paste Host Token here..."
                            value={remoteCode}
                            onChange={(e) => setRemoteCode(e.target.value)}
                        />

                        <button className="action-btn" onClick={handleGuestJoin} disabled={!remoteCode}>
                            Generate Response
                        </button>
                        <button className="text-btn" onClick={() => window.location.reload()}>Cancel</button>

                    </div>
                )}

                {/* --- GUEST: SHOW ANSWER --- */}
                {mode === "GUEST_GENERATE" && (
                    <div className="center-view">
                        <h3>Response Token Ready</h3>
                        <p>Copy this and send it back to the Host immediately.</p>
                        <div className="token-box">
                            <textarea readOnly value={localCode} className="code-area" />
                            <button className="copy-btn" onClick={copyToClipboard}>{copyStatus}</button>
                        </div>

                        <div className="status-badge" style={{ marginTop: '20px' }}>
                            {status === "CONNECTED" ? "Connection Secured!" : "Waiting for Host confirmation..."}
                        </div>
                    </div>
                )}

                {status === "CONNECTED" && (
                    <div className="overlay-success">
                        <CheckCircleIcon size={64} color="#4ade80" />
                        <h2>System Linked</h2>
                        <p>Redirecting to Interface...</p>
                    </div>
                )}

                <div className="footer-credit">Zero-Server Protocol • v2.0</div>
            </div>
        </div>
    );
};

export default LinkSystem;
