import React, { useEffect, useState } from 'react';
import './Splash.css';
import logo from '../assets/logo.jpg';

const Splash = ({ onComplete }) => {
    const [exiting, setExiting] = useState(false);

    useEffect(() => {
        // Hold splash for 3 seconds, then exit
        const timer = setTimeout(() => {
            setExiting(true);

            // Wait for exit animation to finish before unmounting
            setTimeout(() => {
                onComplete && onComplete();
            }, 800);
        }, 2500);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`splash-container ${exiting ? 'splash-exit' : ''}`}>
            <div className="splash-content">
                <div className="logo-wrapper">
                    <img src={logo} alt="Yolofi Logo" className="splash-logo" />
                </div>
                <h1 className="splash-tagline">
                    <span>Troubleshoot.</span>
                    <span>Solve.</span>
                    <span>Relax.</span>
                </h1>
            </div>
        </div>
    );
};

export default Splash;
