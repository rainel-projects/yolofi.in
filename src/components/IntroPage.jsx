import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
// Real-time stats sync enabled
// Real-time stats sync enabled
import BrowserEngine from "../utils/BrowserEngine";
import { doc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore'; // Re-adding if needed, or at least the CSS/Icons
import "./GetStarted.css";
import { CpuIcon, NetworkIcon, ShieldIcon, BoltIcon } from './Icons';

export default function IntroPage({ onContinue }) {
    const [stats, setStats] = useState(() => {
        const cached = localStorage.getItem("yolofi_total_fixed");
        return {
            issuesResolved: cached ? parseInt(cached) : 0,
            successRate: 99,
            avgFixTime: '< 45s'
        };
    });
    const [loading, setLoading] = useState(true);
    const [quickIssue, setQuickIssue] = useState(null);

    useEffect(() => {
        // QUICK HEALTH CHECK (Real-time)
        const checkHealth = async () => {
            const mem = await BrowserEngine.detectMemoryLeaks();
            const store = BrowserEngine.analyzeStorage();

            if (mem.leakDetected) {
                setQuickIssue(`RAM Critical: ${mem.usedJSHeap}`);
            } else if (store.keyCount > 50 || store.usedBytes > 1024 * 1024) {
                setQuickIssue(`Storage Bloat: ${store.keyCount} artifacts`);
            } else if (performance.memory && performance.memory.usedJSHeapSize > 50 * 1024 * 1024) {
                // Even if not a "leak", high usage is worth checking
                setQuickIssue(`High Memory Load: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(0)}MB`);
            }
        };
        checkHealth();

        let isMounted = true;
        let unsubscribe = () => { };

        // 2. Real-time Listener (The "Truth")
        const statsRef = doc(db, "marketing", "stats");

        try {
            unsubscribe = onSnapshot(statsRef,
                (docSnap) => {
                    if (isMounted) {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            const liveCount = data.optimizations || 0;

                            // console.log(">> SYNC: Received live update:", liveCount);
                            setStats(prev => ({ ...prev, issuesResolved: liveCount }));

                            // Update cache
                            localStorage.setItem("yolofi_total_fixed", liveCount.toString());
                        } else {
                            // Smart Seeding: Recycle local truth if available
                            const cachedVal = parseInt(localStorage.getItem("yolofi_total_fixed") || "0");
                            const seedValue = cachedVal > 142 ? cachedVal : 142;

                            setDoc(statsRef, { optimizations: seedValue }).catch(e => console.warn("Init failed", e));
                        }
                        setLoading(false);
                    }
                },
                () => {
                    if (isMounted) setLoading(false);
                }
            );
        } catch (e) {
            console.error("Setup failed", e);
            // Ensure async update or check mount
            setTimeout(() => { if (isMounted) setLoading(false); }, 0);
        }

        // 3. BATCH FLUSHER (The "Worker")
        // Checks periodically if there are pending stats to upload
        const batchFlusher = setInterval(async () => {
            if (!isMounted) return;

            const pending = parseInt(localStorage.getItem("yolofi_pending_batch") || "0");
            if (pending > 0) {
                console.log(`>> BATCH: Flushing ${pending} pending issues to Cloud...`);
                try {
                    await updateDoc(statsRef, { optimizations: increment(pending) });
                    console.log(">> BATCH: Flush Success! Clearing queue.");
                    localStorage.setItem("yolofi_pending_batch", "0");
                } catch (e) {
                    console.warn(">> BATCH: Flush failed (Network?), retrying next cycle.", e);
                }
            }
        }, 10000); // Check every 10 seconds

        // Safety Timeout
        const safety = setTimeout(() => {
            if (isMounted) setLoading(false);
        }, 2500);

        return () => {
            isMounted = false;
            unsubscribe();
            clearTimeout(safety);
            clearInterval(batchFlusher);
        };
    }, []);

    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
        return num.toLocaleString();
    };

    return (
        <div className="intro-page">
            <div className="intro-content">
                <div className="intro-tag">Autonomous Runtime Intelligence</div>

                <h1 className="intro-title">
                    Diagnose & Accelerate<br />
                    Your Browser Core
                </h1>

                {/* REAL-TIME TRIGGER: Actual Issue detected on mount */}
                {quickIssue && (
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        padding: '8px 16px', borderRadius: '50px', marginBottom: '1.5rem',
                        fontSize: '0.9rem', color: '#ef4444', fontWeight: 'bold',
                        animation: 'pulse 2s infinite'
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></span>
                        {quickIssue} Detected
                    </div>
                )}

                <p className="intro-description">
                    Advanced zero-install telemetry. Visualize memory leaks, prune DOM bloat, and optimize storage vectors in real-time.
                </p>

                <div className="intro-stats">
                    <div className="stat-item">
                        <div className="stat-value">
                            {loading && stats.issuesResolved === 0 ? '...' : formatNumber(stats.issuesResolved)}
                        </div>
                        <div className="stat-label">Issues Resolved</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-value">{stats.successRate}%</div>
                        <div className="stat-label">Success Rate</div>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <div className="stat-value">{stats.avgFixTime}</div>
                        <div className="stat-label">Avg. Fix Time</div>
                    </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                    <button className="intro-cta" onClick={onContinue} style={{ marginBottom: 0 }}>
                        Start Free Diagnosis
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <button className="intro-cta-secondary" onClick={() => window.location.href = '/link'}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        Link Desktops
                    </button>
                </div>

                <div className="trust-indicators">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 14L3 11V6L8 3L13 6V11L8 14Z" stroke="#10b981" strokeWidth="1.5" fill="none" />
                        <path d="M6 8L7.5 9.5L10.5 6.5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>No installation required</span>
                    <span className="separator">•</span>
                    <span>100% secure</span>
                    <span className="separator">•</span>
                    <span>Free forever</span>
                </div>
            </div>

            {/* VISUAL SIDE - ANIMATED DASHBOARD */}
            <div className="intro-visual">
                <div className="glass-dashboard">
                    <div className="dashboard-header">
                        <div className="traffic-lights">
                            <div className="light red"></div>
                            <div className="light yellow"></div>
                            <div className="light green"></div>
                        </div>
                        <div className="header-title">System Status: Active</div>
                    </div>

                    <div className="dashboard-body">
                        {/* Central Scanner */}
                        <div className="scanner-container">
                            <div className="radar-circle"></div>
                            <div className="radar-sweep"></div>
                            <div className="shield-center">
                                <ShieldIcon size={32} color="#4f46e5" />
                            </div>
                        </div>

                        {/* Floating Metrics */}
                        <div className="metric-floating item-1">
                            <div className="metric-icon"><CpuIcon size={18} color="#10b981" /></div>
                            <div className="metric-info">
                                <div className="metric-label">CPU Load</div>
                                <div className="metric-bar"><div className="fill cpu-fill"></div></div>
                            </div>
                        </div>

                        <div className="metric-floating item-2">
                            <div className="metric-icon"><NetworkIcon size={18} color="#3b82f6" /></div>
                            <div className="metric-info">
                                <div className="metric-label">Network Latency</div>
                                <div className="metric-bar"><div className="fill net-fill"></div></div>
                            </div>
                        </div>

                        <div className="metric-floating item-3">
                            <div className="metric-icon"><BoltIcon size={18} color="#f59e0b" /></div>
                            <div className="metric-info">
                                <div className="metric-label">Optimization</div>
                                <div className="metric-bar"><div className="fill opt-fill"></div></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
            </div>

        </div>
    );
}
