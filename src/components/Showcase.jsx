import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldIcon, BrainIcon, BoltIcon, CheckCircleIcon } from './Icons';
import './GetStarted.css'; // Reusing base styles

const Showcase = () => {
    const navigate = useNavigate();

    // Static Light Theme Colors
    const theme = {
        bg: '#ffffff',
        text: '#18181b',
        subtext: '#52525b',
        cardBg: '#ffffff',
        cardBorder: '1px solid #e4e4e7',
        headingGradient: 'linear-gradient(to right, #000, #444)',
        hoverShadow: '0 10px 30px rgba(0,0,0,0.08)'
    };

    return (
        <div className="showcase-container">

            {/* Header */}
            <div className="showcase-header">
                <h1 style={{
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)', // Fluid Font
                    fontWeight: 800, marginBottom: '1rem',
                    background: theme.headingGradient,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                    YOLOFI SUITE
                </h1>
                <p style={{ color: theme.subtext, fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
                    Professional-Grade Browser Optimization Tools
                </p>
            </div>

            {/* Grid */}
            <div className="showcase-grid">

                {/* Card 1: Diagnostics */}
                <Card
                    theme={theme}
                    onClick={() => navigate('/diagnose')}
                    icon={<BoltIcon size={32} color="#2563eb" />}
                    iconBg='#eff6ff'
                    title="System Diagnostics"
                    desc="Full-stack analysis of memory, storage, and network latency. Auto-fixes common browser bottlenecks."
                    link="Launch Scanner →"
                />

                {/* Card 2: Focus Shield */}
                <Card
                    theme={theme}
                    onClick={() => navigate('/focus-shield')}
                    icon={<ShieldIcon size={32} color="#0ea5e9" />}
                    iconBg='#e0f2fe'
                    highlight
                    title="Focus Shield"
                    desc="Active stabilizer for Gaming and Video Calls. Prevents lag spikes via keep-alive pings."
                    link="Activate Shield →"
                />

                {/* Card 3: Autonomy */}
                <Card
                    theme={theme}
                    onClick={() => navigate('/autonomy')}
                    icon={<BrainIcon size={32} color="#7c3aed" />}
                    iconBg='#f3e8ff'
                    title="Autonomy Console"
                    desc="Inspect the High-SRA Engine's internal decision matrix. For developers and auditors."
                    link="View Engine →"
                />

                {/* Card 4: Link System */}
                <Card
                    theme={theme}
                    onClick={() => navigate('/link')}
                    icon={<CheckCircleIcon size={32} color="#059669" />}
                    iconBg='#ecfdf5'
                    title="Yolofi Link"
                    desc="Remote troubleshooting. Connect to another device and diagnose it from anywhere."
                    link="Open Link →"
                />

                {/* Card 5: Edge Search */}
                <Card
                    theme={theme}
                    onClick={() => window.location.href = '/edge'}
                    icon={<span style={{ fontSize: '32px' }}>⚡</span>}
                    iconBg='#f0fdfa'
                    title="Edge Search"
                    desc="Zero-server-cost distributed search. Think locally, navigate without asking permission."
                    link="Try Edge Search →"
                />

            </div>

            <div style={{ textAlign: 'center', marginTop: '4rem', color: '#a1a1aa' }}>
                v1.0.0-HighSRA
            </div>
        </div>
    );
};

// Reusable Card Component
const Card = ({ theme, onClick, icon, iconBg, title, desc, link, highlight }) => (
    <div
        onClick={onClick}
        style={{
            background: theme.cardBg,
            border: highlight ? '2px solid #0ea5e9' : theme.cardBorder,
            borderRadius: '16px',
            padding: '2rem',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
        <div style={{
            width: '56px', height: '56px', borderRadius: '12px',
            background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '1.5rem'
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: theme.text }}>
            {title}
        </h3>
        <p style={{ fontSize: '1rem', color: theme.subtext, lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
            {desc}
        </p>
        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#2563eb', marginTop: 'auto' }}>
            {link}
        </div>
    </div>
);

export default Showcase;
