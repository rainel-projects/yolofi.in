import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldIcon, BrainIcon, BoltIcon, CheckCircleIcon } from './Icons';
import './GetStarted.css'; // Reusing base styles for container

const Showcase = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#ffffff',
            color: '#18181b',
            padding: '4rem 2rem',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Header */}
            <div style={{ maxWidth: '1200px', margin: '0 auto 4rem', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '3rem', fontWeight: 800, marginBottom: '1rem',
                    background: 'linear-gradient(to right, #000, #444)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                    YOLOFI SUITE
                </h1>
                <p style={{ color: '#52525b', fontSize: '1.2rem' }}>
                    Professional-Grade Browser Optimization Tools
                </p>
            </div>

            {/* Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>

                {/* Card 1: Diagnostics (Main) */}
                <div style={cardStyle} onClick={() => navigate('/diagnose')}>
                    <div style={iconBoxStyle('#eff6ff', '#2563eb')}>
                        <BoltIcon size={32} color="#2563eb" />
                    </div>
                    <h3 style={titleStyle}>System Diagnostics</h3>
                    <p style={descStyle}>
                        Full-stack analysis of memory, storage, and network latency.
                        Auto-fixes common browser bottlenecks.
                    </p>
                    <div style={linkStyle}>Launch Scanner →</div>
                </div>

                {/* Card 2: Focus Shield (New Feature) */}
                <div style={{ ...cardStyle, border: '2px solid #bae6fd', background: '#f0f9ff' }} onClick={() => navigate('/focus-shield')}>
                    <div style={iconBoxStyle('#e0f2fe', '#0ea5e9')}>
                        <ShieldIcon size={32} color="#0ea5e9" />
                    </div>
                    <h3 style={titleStyle}>Focus Shield</h3>
                    <p style={descStyle}>
                        Active stabilizer for **Gaming** and **Video Calls**.
                        Prevents lag spikes via keep-alive pings.
                    </p>
                    <div style={{ ...linkStyle, color: '#0284c7' }}>Activate Shield →</div>
                </div>

                {/* Card 3: Autonomy (Admin) */}
                <div style={cardStyle} onClick={() => navigate('/autonomy')}>
                    <div style={iconBoxStyle('#f3e8ff', '#7c3aed')}>
                        <BrainIcon size={32} color="#7c3aed" />
                    </div>
                    <h3 style={titleStyle}>Autonomy Console</h3>
                    <p style={descStyle}>
                        Inspect the High-SRA Engine's internal decision matrix.
                        For developers and auditors.
                    </p>
                    <div style={linkStyle}>View Engine →</div>
                </div>

                {/* Card 4: Link System (Peer) */}
                <div style={cardStyle} onClick={() => navigate('/link')}>
                    <div style={iconBoxStyle('#ecfdf5', '#059669')}>
                        <CheckCircleIcon size={32} color="#059669" />
                    </div>
                    <h3 style={titleStyle}>Yolofi Link</h3>
                    <p style={descStyle}>
                        Remote troubleshooting. Connect to another device and diagnose it from anywhere.
                    </p>
                    <div style={linkStyle}>Open Link →</div>
                </div>

            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem', color: '#a1a1aa' }}>
                v1.0.0-HighSRA • Run Locally at localhost:5173
            </div>
        </div>
    );
};

// Styles
const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e4e4e7',
    borderRadius: '16px',
    padding: '2rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
};

const iconBoxStyle = (bg, color) => ({
    width: '56px', height: '56px', borderRadius: '12px',
    background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '1.5rem'
});

const titleStyle = {
    fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#18181b'
};

const descStyle = {
    fontSize: '1rem', color: '#52525b', lineHeight: 1.6, marginBottom: '2rem', flex: 1
};

const linkStyle = {
    fontSize: '1rem', fontWeight: 600, color: '#2563eb', marginTop: 'auto'
};

export default Showcase;
