import React, { useState, useEffect } from 'react';

const MobileRestriction = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            // Using 1024px as standard tablet landscape/small laptop cutoff
            // Anything smaller is restricted
            setIsMobile(window.innerWidth < 1024);
        };

        // Initial check
        checkScreenSize();

        // Listener
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    if (isMobile) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
                background: '#f9fafb', zIndex: 9999,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '2rem', textAlign: 'center', color: '#111827'
            }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: '#fee2e2', color: '#dc2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.5rem'
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                        <line x1="12" y1="2" x2="12" y2="22"></line>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                    </svg>
                </div>

                <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '800' }}>Desktop Only</h1>
                <p style={{ fontSize: '1.1rem', color: '#4b5563', maxWidth: '400px', lineHeight: '1.6' }}>
                    This advanced diagnostic tool requires a large screen and desktop-class browser capabilities to function correctly.
                </p>
                <div style={{ marginTop: '2rem', padding: '1rem', background: '#e0e7ff', borderRadius: '8px', color: '#3730a3', fontSize: '0.9rem', fontWeight: '500' }}>
                    Please open this link on your Computer.
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default MobileRestriction;
