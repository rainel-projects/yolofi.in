import React, { useEffect, useState } from "react";
import peerRelay from "../services/PeerRelay";
import {
    ActivityIcon, CheckCircleIcon, WifiIcon,
    ShieldIcon, TerminalIcon, BoltIcon
} from "./Icons";
import "./SignalOverlay.css";

// VISUAL LANGUAGE (Pure SVG, No Emojis)
const SignalOverlay = () => {
    const [signals, setSignals] = useState([]);

    useEffect(() => {
        // Listen for High-Frequency Signals (Zero DB Cost)
        peerRelay.on('SIGNAL', (msg) => {
            triggerVisual(msg.kind, msg.from);
        });

        // Listen for System Actions
        peerRelay.on('ACTION', (msg) => {
            triggerVisual("ACTION", "SYSTEM", msg.actionName);
        });
    }, []);

    const triggerVisual = (kind, fromVal, details = "") => {
        const id = Date.now();
        setSignals(prev => [...prev, { id, kind, from: fromVal, details }]);

        // Auto-remove after animation
        setTimeout(() => {
            setSignals(prev => prev.filter(s => s.id !== id));
        }, 3000);
    };

    return (
        <div className="signal-layer">
            {signals.map(s => (
                <div key={s.id} className={`signal-toast signal-${s.kind.toLowerCase()}`}>
                    <div className="signal-icon">
                        {s.kind === "PING" && <ActivityIcon color="#3b82f6" />}
                        {s.kind === "ACK" && <CheckCircleIcon color="#10b981" />}
                        {s.kind === "WARNING" && <WifiIcon color="#f59e0b" />}
                        {s.kind === "ACTION" && <TerminalIcon color="#6366f1" />}
                    </div>
                    <div className="signal-content">
                        <span className="signal-label">
                            {s.kind === "PING" && "REMOTE PING"}
                            {s.kind === "ACK" && "CONFIRMED"}
                            {s.kind === "WARNING" && "ALERT"}
                            {s.kind === "ACTION" && `CMD: ${s.details}`}
                        </span>
                        <div className="signal-bar"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SignalOverlay;
