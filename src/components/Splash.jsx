import { useEffect, useState } from "react";
import "./Splash.css";
import logo from "../assets/logo.jpg";

export default function Splash({ onFinish }) {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => onFinish && onFinish(), 600);
        }, 2000);

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div className={`splash-container ${fadeOut ? "fade-out" : ""}`}>
            <img src={logo} alt="Yolofi" className="splash-logo" />
            <p className="loading-text">Starting up...</p>
        </div>
    );
}
