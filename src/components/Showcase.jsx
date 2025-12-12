import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldIcon, BrainIcon, BoltIcon, CheckCircleIcon } from './Icons';
import './GetStarted.css'; // Reusing base styles

const Showcase = () => {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('yolofi_theme') === 'dark';
    });

    useEffect(() => {
        localStorage.setItem('yolofi_theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // Dynamic Theme Colors
    const theme = {
        bg: darkMode ? '#09090b' : '#ffffff',
        text: darkMode ? '#f4f4f5' : '#18181b',
        subtext: darkMode ? '#a1a1aa' : '#52525b',
        cardBg: darkMode ? '#18181b' : '#ffffff',
        cardBorder: darkMode ? '1px solid #27272a' : '1px solid #e4e4e7',
        headingGradient: darkMode ? 'linear-gradient(to right, #fff, #a1a1aa)' : 'linear-gradient(to right, #000, #444)',
        hoverShadow: darkMode ? '0 8px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.08)'
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: theme.bg,
            color: theme.text,
            padding: 'clamp(2rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem)', // Fluid Padding
            fontFamily: 'Inter, sans-serif',
            transition: 'background 0.3s ease, color 0.3s ease'
        }}>
            {/* Theme Toggle */}
            <button
                onClick={() => setDarkMode(!darkMode)}
                style={{
                    position: 'absolute', top: '1.5rem', right: '1.5rem',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: theme.subtext, padding: '8px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Header */}
            <div style={{ maxWidth: '1200px', margin: '0 auto clamp(2rem, 5vw, 4rem)', textAlign: 'center' }}>
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
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // robust mobile min-width
                gap: '24px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>

                {/* Card 1: Diagnostics */}
                <Card
                    theme={theme}
                    onClick={() => navigate('/diagnose')}
                    icon={<BoltIcon size={32} color="#2563eb" />}
                    iconBg={darkMode ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff'}
                    title="System Diagnostics"
                    desc="Full-stack analysis of memory, storage, and network latency. Auto-fixes common browser bottlenecks."
                    link="Launch Scanner →"
                />

                {/* Card 2: Focus Shield */}
                <Card
                    theme={theme}
                    onClick={() => navigate('/focus-shield')}
                    icon={<ShieldIcon size={32} color="#0ea5e9" />}
                    iconBg={darkMode ? 'rgba(14, 165, 233, 0.15)' : '#e0f2fe'}
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
                    iconBg={darkMode ? 'rgba(124, 58, 237, 0.15)' : '#f3e8ff'}
                    title="Autonomy Console"
                    desc="Inspect the High-SRA Engine's internal decision matrix. For developers and auditors."
                    link="View Engine →"
                />

                {/* Card 4: Link System */}
                <Card
                    theme={theme}
                    onClick={() => navigate('/link')}
                    icon={<CheckCircleIcon size={32} color="#059669" />}
                    iconBg={darkMode ? 'rgba(5, 150, 105, 0.15)' : '#ecfdf5'}
                    title="Yolofi Link"
                    desc="Remote troubleshooting. Connect to another device and diagnose it from anywhere."
                    link="Open Link →"
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

// Simple SVG Icons for Theme Toggle
const SunIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
        <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const MoonIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default Showcase;
