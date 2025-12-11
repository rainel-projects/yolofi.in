import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldIcon, ScanIcon, BoltIcon, CheckCircleIcon, ActivityIcon, HeartIcon, SearchIcon } from './Icons';
import CoffeePopup from './CoffeePopup';

const Showcase = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            fontFamily: "'Inter', sans-serif",
            background: '#ffffff',
            minHeight: '100vh',
            color: '#111827',
            overflowX: 'hidden'
        }}>
            {/* HERO SECTION */}
            <header style={{
                maxWidth: '1200px', margin: '0 auto', padding: '4rem 1.5rem',
                textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <div style={{
                    marginBottom: '1.5rem', background: '#eff6ff', color: '#2563eb',
                    padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: '600', fontSize: '0.9rem',
                    boxShadow: '0 0 0 4px #eff6ff', display: 'inline-flex', alignItems: 'center', gap: '8px'
                }}>
                    <ActivityIcon size={16} /> Now Live: Version 3.0
                </div>

                <h1 style={{
                    fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1',
                    marginBottom: '1.5rem', letterSpacing: '-0.02em',
                    background: 'linear-gradient(to right, #1e3a8a, #2563eb)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
                    The Serverless <br /> Browser Optimizer.
                </h1>

                <p style={{
                    fontSize: '1.25rem', color: '#4b5563', maxWidth: '600px',
                    lineHeight: '1.6', marginBottom: '2.5rem'
                }}>
                    Yolofi instantly diagnoses RAM leaks, clears bloat, and optimizes runtime performance.
                    Running entirely locally in your browser. No installs.
                </p>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: '1rem 2rem', fontSize: '1.1rem', background: '#2563eb', color: 'white',
                            border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)', transition: 'transform 0.2s',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <BoltIcon size={20} color="white" /> Launch Application
                    </button>

                    <button
                        onClick={() => navigate('/inspector')}
                        style={{
                            padding: '1rem 2rem', fontSize: '1.1rem', background: 'white', color: '#1f2937',
                            border: '1px solid #e5e7eb', borderRadius: '12px', fontWeight: '600', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <SearchIcon size={20} color="#1f2937" /> Analyze a Website
                    </button>
                </div>

                {/* Mobile Note */}
                <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldIcon size={14} color="#9ca3af" /> Works best on Desktop Chrome/Edge
                </div>
            </header>

            {/* FEATURE GRID */}
            <section style={{ background: '#f9fafb', padding: '4rem 1.5rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'
                    }}>
                        {/* F1 */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                            <div style={{ width: '48px', height: '48px', background: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <ScanIcon size={24} color="#2563eb" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>Zero-Install Core</h3>
                            <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
                                Uses advanced browser APIs (`performance.memory`, `navigator.storage`) to analyze system health without requiring any downloads.
                            </p>
                        </div>

                        {/* F2 */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                            <div style={{ width: '48px', height: '48px', background: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <BoltIcon size={24} color="#16a34a" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>Instant RAM Flush</h3>
                            <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
                                Triggers garbage collection hints and detaches unused DOM nodes to reclaim up to 40% of wasted memory instantly.
                            </p>
                        </div>

                        {/* F3 */}
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                            <div style={{ width: '48px', height: '48px', background: '#fae8ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <ShieldIcon size={24} color="#c026d3" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem' }}>Remote Debugging</h3>
                            <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
                                Generate a secure P2P link to diagnose any device globally. View live telemetry via WebRTC.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#6b7280' }}>
                <p style={{ fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    built with <HeartIcon size={16} color="#ef4444" style={{ fill: '#ef4444' }} /> for the web.
                </p>
                <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                    © 2025 Yolofi Inc.
                </div>
            </footer>
        </div>
    );
};

export default Showcase;
