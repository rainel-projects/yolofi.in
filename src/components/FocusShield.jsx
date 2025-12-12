import React, { useState, useEffect } from "react";
import { sentinel } from "../autonomy/SystemSentinel";
import { ShieldIcon, BoltIcon } from "./Icons";
import "./FocusShield.css";

const FocusShield = () => {
    const [isActive, setIsActive] = useState(false);
    const [statusText, setStatusText] = useState("Tap to Activate Shield");

    const toggleShield = () => {
        if (!isActive) {
            const success = sentinel.activateFocusMode();
            if (success) {
                setIsActive(true);
                setStatusText("Focus Shield Active");
            } else {
                // If system is locked, it might return false
                setStatusText("System Locked - Cannot Activate");
                setTimeout(() => setStatusText("Tap to Activate Shield"), 2000);
            }
        } else {
            sentinel.deactivateFocusMode();
            setIsActive(false);
            setStatusText("Tap to Activate Shield");
        }
    };

    return (
        <div className="focus-shield-container">
            <div
                className={`shield-toggle ${isActive ? 'active' : ''}`}
                onClick={toggleShield}
                title="Toggle Focus Shield"
            >
                <div className="shield-icon">
                    <ShieldIcon size={40} />
                </div>
            </div>

            <div className={`shield-status ${isActive ? 'active' : ''}`}>
                {statusText}
            </div>

            <div className="shield-tooltip">
                {isActive
                    ? "Optimizing Network & Memory for Calls/Gaming"
                    : "Prevent Lag during Calls & Gaming"
                }
            </div>
        </div>
    );
};

export default FocusShield;
