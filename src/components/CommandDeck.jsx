import React, { useState, useEffect } from "react";
import swarmPeer from "../services/SwarmPeerService";
import BrowserEngine from "../utils/BrowserEngine";
import {
    ActivityIcon, CheckCircleIcon, WifiIcon,
    TerminalIcon, TrashIcon, LayersIcon, ScanIcon,
    BoltIcon
} from "./Icons";
import "./CommandDeck.css";

const CommandDeck = ({ role, sessionId }) => {
    const [lastCmd, setLastCmd] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        if (role === "HOST") {
            const handleData = async (payload) => {
                // Filter for 'cmd' channel
                if (payload.channel !== 'cmd') return;

                if (payload.type === 'CMD_EXECUTE') {
                    setLastCmd(`EXECUTING: ${payload.action} ...`);
                    setIsExecuting(true);

                    // Execute the actual logic
                    try {
                        await executeHostCommand(payload.action);

                        // Send ACK back
                        swarmPeer.send({ channel: 'cmd', type: 'SIGNAL', kind: 'ACK' });
                        setLastCmd(`COMPLETED: ${payload.action}`);
                    } catch (e) {
                        console.error(e);
                        setLastCmd(`FAILED: ${payload.action}`);
                    } finally {
                        setTimeout(() => setIsExecuting(false), 2000);
                    }
                } else if (payload.type === 'SIGNAL') {
                    setLastCmd(`SIGNAL RECEIVED: ${payload.kind}`);
                }
            };

            swarmPeer.on('data', handleData);
            return () => swarmPeer.off('data', handleData);
        }
    }, [role]);

    const executeHostCommand = async (action) => {
        switch (action) {
            case "SYSTEM_SCAN":
                await BrowserEngine.runFullDiagnostics();
                break;
            case "FLUSH_RAM":
                await BrowserEngine.performMemoryCleanup();
                break;
            case "OPTIMIZE_DOM":
                await BrowserEngine.optimizeRenderPipeline();
                break;
            case "STORAGE_PURGE":
                await BrowserEngine.cleanupClientCaches();
                break;
            default:
                break;
        }
    };

    // --- GUEST CONTROLS ---
    const sendSignal = (kind) => {
        swarmPeer.send({ channel: 'cmd', type: 'SIGNAL', kind, from: 'GUEST' });
    };

    const sendCommand = (action) => {
        swarmPeer.send({ channel: 'cmd', type: 'CMD_EXECUTE', action, from: 'GUEST' });
    };

    if (role === "HOST") {
        return (
            <div className={`deck-host-log ${isExecuting ? 'deck-active' : ''}`}>
                <div className="deck-status-light"></div>
                <span className="deck-log-text">
                    {lastCmd || "SYSTEM LINK ESTABLISHED. WAITING FOR COMMANDS..."}
                </span>
            </div>
        );
    }

    // GUEST VIEW
    return (
        <div className="command-deck">
            <div className="deck-header">
                <TerminalIcon size={16} /> <span>COMMAND MODULE // {sessionId ? sessionId.slice(0, 6) : 'P2P'}</span>
            </div>

            <div className="deck-grid">
                {/* SIGNALS */}
                <div className="deck-section">
                    <span className="deck-label">SIGNALS</span>
                    <div className="signal-row">
                        <button className="deck-btn signal-ping" onClick={() => sendSignal('PING')}>
                            <ActivityIcon />
                        </button>
                        <button className="deck-btn signal-ack" onClick={() => sendSignal('ACK')}>
                            <CheckCircleIcon />
                        </button>
                        <button className="deck-btn signal-warn" onClick={() => sendSignal('WARNING')}>
                            <WifiIcon />
                        </button>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="deck-section">
                    <span className="deck-label">EXECUTABLES</span>
                    <div className="action-grid">
                        <button className="deck-btn action-item" onClick={() => sendCommand('SYSTEM_SCAN')}>
                            <ScanIcon size={20} />
                            <span>FULL SCAN</span>
                        </button>
                        <button className="deck-btn action-item" onClick={() => sendCommand('FLUSH_RAM')}>
                            <TrashIcon size={20} />
                            <span>FLUSH RAM</span>
                        </button>
                        <button className="deck-btn action-item" onClick={() => sendCommand('OPTIMIZE_DOM')}>
                            <LayersIcon size={20} />
                            <span>OPT DOM</span>
                        </button>
                        <button className="deck-btn action-item" onClick={() => sendCommand('STORAGE_PURGE')}>
                            <BoltIcon size={20} />
                            <span>PURGE CACHE</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandDeck;
