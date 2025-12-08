import { useEffect, useState } from "react";
import "./Splash.css";
import logo from "../assets/logo.jpg";

export default function Splash({ onFinish }) {
    const [checks, setChecks] = useState([]);
    const [fadeOut, setFadeOut] = useState(false);

    const diagnosticChecks = [
        { id: 1, text: "System detected", delay: 300 },
        { id: 2, text: "Diagnostic tools loaded", delay: 900 },
        { id: 3, text: "Ready to troubleshoot", delay: 1600 }
    ];

    useEffect(() => {
        // Show checks progressively
        diagnosticChecks.forEach((check) => {
            setTimeout(() => {
                setChecks(prev => [...prev, check.id]);
            }, check.delay);
        });

        // Finish and fade out
        const finishTimer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => onFinish && onFinish(), 500);
        }, 2500);

        return () => clearTimeout(finishTimer);
    }, [onFinish]);

    return (
        <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
            <div className="splash-content">
                {/* Logo */}
                <div className="splash-logo-wrapper">
                    <img src={logo} alt="Yolofi" className="splash-logo" />
                </div>

                {/* Brand Name */}
                <h1 className="splash-brand">Yolofi</h1>

                {/* Tagline */}
                <p className="splash-tagline">Smart PC Troubleshooting</p>

                {/* Diagnostic Checks */}
                <div className="splash-checks">
                    {diagnosticChecks.map((check) => (
                        <div
                            key={check.id}
                            className={`check-item ${checks.includes(check.id) ? 'visible' : ''}`}
                        >
                            <svg
                                className="check-icon"
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                            >
                                <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
                                <path
                                    d="M6 9L8 11L12 7"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <span>{check.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
