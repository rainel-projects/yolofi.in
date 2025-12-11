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
            background: '#000',
            minHeight: '100vh',
            color: '#0f0',
            fontFamily: 'monospace',
            padding: '2rem'
        }}>
            {/* HEADER */}
            <header style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>AUTONOMY CONSOLE v1.0</h1>
                    <span style={{ color: '#666', fontSize: '0.8rem' }}>DETERMINISTIC GOVERNANCE ENGINE</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        background: metrics.status === 'ACTIVE' ? '#0f0' : '#f00',
                        color: '#000',
                        padding: '2px 8px',
                        fontWeight: 'bold',
                        borderRadius: '2px'
                    }}>
                        {metrics.status}
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>HASH: {metrics.hash}</div>
                </div>
            </header>

            {/* METRICS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>

                {/* STABILITY GRAPH (Visual Proof) */}
                <div style={{ border: '1px solid #333', padding: '1rem' }}>
                    <h3>SYSTEM STABILITY (Main Thread)</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                        {metrics.stability}%
                    </div>
                    <div style={{ height: '4px', background: '#333', marginTop: '1rem' }}>
                        <div style={{ height: '100%', width: `${metrics.stability}%`, background: '#0f0' }} />
                    </div>
                    <p style={{ color: '#666', fontSize: '0.8rem' }}>
                        Target: 100% | Measured: {metrics.stability}%
                    </p>
                </div>

                {/* CONTROLS */}
                <div style={{ border: '1px solid #333', padding: '1rem' }}>
                    <h3>CHAOS CONTROLS</h3>
                    <button
                        onClick={toggleSimulation}
                        style={{
                            background: simIntensity > 0 ? '#f00' : '#333',
                            color: '#fff',
                            border: 'none',
                            padding: '1rem',
                            width: '100%',
                            cursor: 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        {simIntensity > 0 ? '⛔ STOP TRAFFIC SIM' : '🔥 INJECT 5,000 OPS/SEC'}
                    </button>

                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                        Simulates heavy load. Notice the UI does not freeze.
                        (Proof of Isolation).
                    </div>
                </div>
            </div>

            {/* REVENUE ACTION */}
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <button
                    onClick={handleExport}
                    style={{
                        background: '#0f0',
                        color: '#000',
                        border: 'none',
                        padding: '1rem 2rem',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 0 10px rgba(0,255,0,0.4)'
                    }}
                >
                    ⬇️ EXPORT AUDIT REPORT (JSON)
                </button>
                <div style={{ marginTop: '1rem', color: '#666' }}>
                    Generates verification proof for compliance teams.
                </div>
            </div>

            {/* SPONSOR BADGE */}
            <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', opacity: 0.7 }}>
                <span style={{ border: '1px solid #333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    ❤️ Supported by GitHub Sponsors
                </span>
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
