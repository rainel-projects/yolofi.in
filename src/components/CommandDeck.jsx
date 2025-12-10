import React, { useState, useEffect } from "react";
import peerRelay from "../services/PeerRelay";
import BrowserEngine from "../utils/BrowserEngine";
import {
    ActivityIcon, CheckCircleIcon, WifiIcon,
    ShieldIcon, TerminalIcon, TrashIcon, LayersIcon, ScanIcon,
    BoltIcon
} from "./Icons";
import "./CommandDeck.css";

const CommandDeck = ({ role, sessionId }) => {
    const [lastCmd, setLastCmd] = useState(null);
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        if (role === "HOST") {
            // HOST acts as the Receiver/Executor
            peerRelay.on('CMD_EXECUTE', async (msg) => {
                setLastCmd(`EXECUTING: ${msg.action} ...`);
                setIsExecuting(true);

                // Execute the actual logic
                try {
                    await executeHostCommand(msg.action);

                    // Send ACK back
                    peerRelay.send({ type: 'SIGNAL', kind: 'ACK', to: msg.from });
                    setLastCmd(`COMPLETED: ${msg.action}`);
                } catch (e) {
                    console.error(e);
                    setLastCmd(`FAILED: ${msg.action}`);
                } finally {
                    setTimeout(() => setIsExecuting(false), 2000);
                }
            });
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
        peerRelay.send({ type: 'SIGNAL', kind, from: 'GUEST' });
    };

    const sendCommand = (action) => {
        peerRelay.send({ type: 'CMD_EXECUTE', action, from: 'GUEST' });
        // Also fire local visual for immediate feedback
        peerRelay.send({ type: 'ACTION', actionName: action, from: 'GUEST' });
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
                <TerminalIcon size={16} /> <span>COMMAND MODULE // {sessionId?.slice(0, 6)}</span>
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
