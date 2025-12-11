import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MobileRestriction = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const checkAccess = () => {
            const path = location.pathname;
            // Allow Guest/Host/Marketing routes on mobile
            if (path.startsWith('/link') || path.startsWith('/remote') || path.startsWith('/host-live') || path.startsWith('/join') || path.startsWith('/showcase') || path.startsWith('/inspector')) {
                setIsMobile(false);
                return;
            }

            const width = window.innerWidth;
            const ua = navigator.userAgent.toLowerCase();
            const isMobileDevice = /android|iphone|ipad|ipod/.test(ua);

            // Strict check: Block if it's a phone (UA) OR small screen (< 1024)
            // But if it's an iPad Pro (large screen), maybe allow? 
            // Let's stick to the requested "Not for phones" -> UA check is best.
            // But user said "url not for phones", implying desktop requirement.

            if (isMobileDevice || width < 1024) {
                setIsMobile(true);
            } else {
                setIsMobile(false);
            }
        };

        checkAccess();
        window.addEventListener('resize', checkAccess);
        return () => window.removeEventListener('resize', checkAccess);
    }, [location.pathname]);

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
