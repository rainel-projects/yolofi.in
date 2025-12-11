/**
 * AutonomyConsole.jsx
 * The "Hacker Dashboard" - Visual Proof of High-SRA.
 *
 * ROLE:
 * 1. Visual Verification: Shows the "Flatline" (Stability).
 * 2. Revenue: "Export Audit Report" button.
 * 3. Trust: "Automated Verification" Badges.
 */

import React, { useState, useEffect } from 'react';
import { sentinel } from '../autonomy/SystemSentinel';
import { autonomyEngine } from '../autonomy/AutonomyEngine';
import AutonomyErrorBoundary from './AutonomyErrorBoundary';

const ConsoleUI = () => {
    const [metrics, setMetrics] = useState({ stability: 100, risk: 0, status: 'INIT' });
    const [simIntensity, setSimIntensity] = useState(0);

    // Poll Sentinel for updates
    useEffect(() => {
        // Start Engine on Mount if not running
        if (autonomyEngine.status === 'DISCONNECTED') {
            autonomyEngine.start();
        }

        const interval = setInterval(() => {
            setMetrics({
                stability: sentinel.calculateAverageStability(),
                risk: sentinel.metrics.riskFactor,
                status: sentinel.status,
                hash: sentinel.getLatestHash()
            });
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const handleExport = () => {
        const report = sentinel.generateAuditReport();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "High-SRA-Audit-Report.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const toggleSimulation = () => {
        const newIntensity = simIntensity === 0 ? 5000 : 0; // 5k ops or 0
        setSimIntensity(newIntensity);
        autonomyEngine.postMessage({ type: 'START_STRESS', payload: newIntensity });
    };

    return (
        <div style={{
            background: '#f9fafb',
            minHeight: '100vh',
            color: '#111827',
            fontFamily: "'Inter', sans-serif",
            padding: '2rem'
        }}>
            {/* HEADER */}
            <header style={{
                maxWidth: '1000px', margin: '0 auto 2rem auto',
                background: '#fff', padding: '1.5rem', borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>Autonomy Console</h1>
                    <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Deterministic Governance Engine</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        background: metrics.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                        color: metrics.status === 'ACTIVE' ? '#166534' : '#991b1b',
                        padding: '4px 12px',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        borderRadius: '20px',
                        display: 'inline-block'
                    }}>
                        {metrics.status}
                    </div>
                </div>
            </header>

            {/* METRICS GRID */}
            <div style={{ maxWidth: '1000px', margin: '0 auto 2rem auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>

                {/* STABILITY GRAPH */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>System Stability</h3>
                    <div style={{ fontSize: '3.5rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem' }}>
                        {metrics.stability}%
                    </div>
                    <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${metrics.stability}%`, background: '#22c55e', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                    </div>
                </div>

                {/* CONTROLS */}
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Chaos Controls</h3>
                    <button
                        onClick={toggleSimulation}
                        style={{
                            background: simIntensity > 0 ? '#ef4444' : '#2563eb',
                            color: '#fff',
                            border: 'none',
                            padding: '0.75rem',
                            width: '100%',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginBottom: '1rem',
                            transition: 'background 0.2s'
                        }}
                    >
                        {simIntensity > 0 ? 'Stop Traffic Simulation' : 'Inject 5,000 Ops/Sec'}
                    </button>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: '1.5' }}>
                        Simulates heavy computational load. Observe that the UI remains fluid (Proof of Isolation).
                    </p>
                </div>
            </div>

            {/* LOCKED INTEGRATIONS */}
            <div style={{ maxWidth: '1000px', margin: '0 auto 2rem auto' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Enterprise Adapters</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                    {/* CLOUDFLARE */}
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ filter: 'blur(3px)', opacity: 0.4, pointerEvents: 'none' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>Cloudflare Edge-State</h4>
                            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Syncs agent state with Workers KV.</p>
                        </div>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <div style={{ background: '#f3f4f6', padding: '8px 16px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LOCKED FEATURE</span>
                                <a href="https://github.com/sponsors/yourusername" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none' }}>Unlock for $1k →</a>
                            </div>
                        </div>
                    </div>

                    {/* DATADOG */}
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ filter: 'blur(3px)', opacity: 0.4, pointerEvents: 'none' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>Datadog RUM Stream</h4>
                            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Real-time telemetry injection.</p>
                        </div>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <div style={{ background: '#f3f4f6', padding: '8px 16px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LOCKED FEATURE</span>
                                <a href="https://github.com/sponsors/yourusername" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none' }}>Unlock for $2.5k →</a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* ACTION */}
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <button
                    onClick={handleExport}
                    style={{
                        background: '#ffffff',
                        color: '#111827',
                        border: '1px solid #e5e7eb',
                        padding: '1rem 2rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s',
                        outline: 'none'
                    }}
                >
                    Export Compliance Report (JSON)
                </button>
            </div>

            {/* SPONSOR BADGE */}
            <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', opacity: 0.7 }}>
                <a href="https://github.com/sponsors/yourusername" target="_blank" rel="noreferrer" style={{
                    textDecoration: 'none',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    color: '#6b7280',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <span style={{ color: '#ef4444' }}>♥</span> Supported by GitHub Sponsors
                </a>
            </div>
        </div>
    );
};

// WRAP IN MATH-PROOF ERROR BOUNDARY
const AutonomyConsole = () => (
    <AutonomyErrorBoundary>
        <ConsoleUI />
    </AutonomyErrorBoundary>
);

export default AutonomyConsole;
