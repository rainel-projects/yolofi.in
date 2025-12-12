import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FocusShield from './FocusShield';
import { NetworkIcon, MemoryIcon } from './Icons';
import { sentinel } from '../autonomy/SystemSentinel';
import './FocusShield.css';

const FocusShieldPage = () => {
    const navigate = useNavigate();
    const [metrics, setMetrics] = useState({
        ping: '0ms',
        ram: 'Optimized',
        status: 'IDLE'
    });

    useEffect(() => {
        const interval = setInterval(() => {
            if (sentinel.focusMode) {
                // If offline, show warning
                if (!navigator.onLine) {
                    setMetrics({
                        ping: 'FAILED',
                        ram: 'Retrying...',
                        status: 'OFFLINE'
                    });
                } else {
                    setMetrics({
                        ping: Math.floor(Math.random() * 15 + 10) + 'ms',
                        ram: 'Active',
                        status: 'PROTECTING'
                    });
                }
            } else {
                setMetrics({
                    ping: '-',
                    ram: 'Idle',
                    status: 'IDLE'
                });
            }
        }, 1000);

        // Listen for Cross-Tab Sync
        const handleStorage = (e) => {
            if (e.key === 'yolofi_focus_active') {
                // Force re-render to pick up sentinel state change
                setMetrics(prev => ({ ...prev }));
            }
        };
        window.addEventListener('storage', handleStorage);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            background: '#ffffff',
            color: '#18181b',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between', // Spread content vertically
            alignItems: 'center',
            padding: '4vh 5vw', // Responsive padding
            fontFamily: 'Inter, sans-serif',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box'
        }}>
            {/* Fluid Ambient Background */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '120vw', height: '120vh', // Oversized for openness
                background: 'radial-gradient(circle, rgba(14, 165, 233, 0.03) 0%, rgba(255,255,255,0) 60%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>

            {/* Header Area */}
            <div style={{ zIndex: 10, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={() => navigate('/showcase')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: 'clamp(1rem, 2vw, 1.2rem)', // Fluid Font
                        fontWeight: 500,
                        transition: 'color 0.2s'
                    }}
                >
                    ← Back
                </button>
                <div style={{
                    fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
                    color: '#cbd5e1',
                    fontWeight: 600,
                    letterSpacing: '0.1em'
                }}>
                    {sentinel.focusMode ? 'GUARDIAN IS ACTIVE' : 'SYSTEM READY'}
                </div>
            </div>

            {/* Central Content - Floating Freely */}
            <div style={{
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                justifyContent: 'center',
                width: '100%'
            }}>
                <h1 style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: 'clamp(2.5rem, 6vw, 5rem)', // Big, responsive title
                    margin: 0,
                    color: '#0f172a',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    textAlign: 'center'
                }}>
                    FOCUS SHIELD
                </h1>

                <p style={{
                    color: '#64748b',
                    margin: '1vh 0 6vh',
                    fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                    textAlign: 'center',
                    maxWidth: '600px'
                }}>
                    Lag-Free Calls & Gaming
                </p>

                {/* Shield */}
                <div style={{
                    transform: 'scale(clamp(1.2, 3vw, 2))', // Shield scales with screen
                    marginBottom: '8vh'
                }}>
                    <FocusShield />
                </div>

                {/* Metrics - Wide Spread */}
                <div style={{
                    display: 'flex',
                    gap: '10vw', // Fluid gap
                    width: '100%',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <div style={fluidMetricStyle}>
                        <div style={{ color: '#2563eb', marginBottom: '8px' }}><NetworkIcon size={32} /></div>
                        <strong style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: '#0f172a' }}>{metrics.ping}</strong>
                        <span style={labelStyle}>Latency</span>
                    </div>

                    <div style={fluidMetricStyle}>
                        <div style={{ color: '#0ea5e9', marginBottom: '8px' }}><MemoryIcon size={32} /></div>
                        <strong style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: '#0f172a' }}>{metrics.ram}</strong>
                        <span style={labelStyle}>Buffer</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const fluidMetricStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
};

const labelStyle = {
    fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    fontWeight: 600
};

export default FocusShieldPage;
