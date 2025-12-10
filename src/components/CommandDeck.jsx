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
    // GUEST VIEW (READ ONLY)
    return (
        <div className="deck-host-log">
            <div className="deck-status-light" style={{ background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
            <span className="deck-log-text">
                CONNECTED TO HOST // VIEW ONLY MODE // WAITING FOR UPDATES...
            </span>
        </div>
    );
};

export default CommandDeck;
