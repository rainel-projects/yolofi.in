import { useEffect, useState } from "react";
import "./Splash.css";
import logo from "../assets/logo.jpg";

export default function Splash({ onFinish }) {
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Smooth progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                return prev + 2;
            });
        }, 30);

        // Finish after 2.5 seconds
        const finishTimer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => onFinish && onFinish(), 500);
        }, 2500);

        return () => {
            clearInterval(progressInterval);
            clearTimeout(finishTimer);
        };
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

                {/* Progress Bar */}
                <div className="splash-progress">
                    <div
                        className="splash-progress-fill"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Loading Text */}
                <p className="splash-status">
                    {progress < 30 && "Initializing..."}
                    {progress >= 30 && progress < 70 && "Loading diagnostics..."}
                    {progress >= 70 && progress < 100 && "Almost ready..."}
                    {progress >= 100 && "Ready!"}
                </p>
            </div>
        </div>
    );
}
