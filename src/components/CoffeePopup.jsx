import React, { useState, useEffect } from 'react';
import './CoffeePopup.css';

const CoffeePopup = () => {
    const [state, setState] = useState('HIDDEN'); // HIDDEN -> POPUP -> MINIMIZED

    useEffect(() => {
        // Show popup after intro splash (approx 4s total load time, giving user 1s to breathe)
        const timer = setTimeout(() => {
            // Check if already supported or dismissed recently? 
            // Aggressive growth hacking: Show it always until clicked, but minimizable.
            setState('POPUP');
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleMinimize = (e) => {
        e.stopPropagation();
        setState('MINIMIZED');
    };

    if (state === 'HIDDEN') return null;

    if (state === 'MINIMIZED') {
        return (
            <a href="https://buymeacoffee.com/yolofi" target="_blank" rel="noopener noreferrer" className="coffee-fab">
                <span className="coffee-emoji">☕</span>
            </a>
        );
    }

    return (
        <div className="coffee-overlays">
            <div className="coffee-modal" onClick={() => window.open("https://buymeacoffee.com/yolofi", "_blank")}>
                <button className="close-btn-x" onClick={handleMinimize}>×</button>
                <div className="coffee-icon-lg">☕</div>
                <h3>Fuel the Magic</h3>
                <p>Yolofi remains free & serverless thanks to supporters like you. Help us keep the lights on?</p>
                <div className="coffee-cta-btn">
                    Buy a Coffee
                    <div className="shine-sweep"></div>
                </div>
                <div className="trust-micro">Secure & Direct • $5 Support</div>
            </div>
        </div>
    );
};

export default CoffeePopup;
