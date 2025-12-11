import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanIcon, ShieldIcon, BoltIcon, CheckCircleIcon, ActivityIcon, TrashIcon } from './Icons';
import FixGenerator from '../utils/FixGenerator';

const WebInspector = () => {
    const navigate = useNavigate();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [activeFix, setActiveFix] = useState(null); // { title, code }

    // Use a public key if you have one, or leave blank for lower limits.
    // For a demo/portfolio, blank usually works fine for modest usage.
    const API_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

    const handleScan = async (e) => {
        e.preventDefault();
        if (!url) return;

        // Add https if missing
        let target = url;
        if (!target.startsWith('http')) target = 'https://' + target;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Fetch Mobile Strategy by default
            const response = await fetch(`${API_ENDPOINT}?url=${encodeURIComponent(target)}&strategy=mobile&category=PERFORMANCE&category=SEO`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            const lh = data.lighthouseResult;
            const score = Math.round(lh.categories.performance.score * 100);

            // Extract useful audits
            const audits = lh.audits;
            const opportunities = [];

            // 1. Text Compression
            if (audits['uses-text-compression'].score < 0.9) {
                opportunities.push({
                    id: 'compression',
                    title: 'Enable Text Compression',
                    desc: 'Text-based resources should be served with compression (Gzip/Brotli).',
                    savings: audits['uses-text-compression'].displayValue,
                    fixType: 'SERVER_CONFIG'
                });
            }

            // 2. Browser Caching
            if (audits['uses-long-cache-ttl'].score < 0.9) {
                opportunities.push({
                    id: 'caching',
                    title: 'Leverage Browser Caching',
                    desc: 'Serve static assets with an efficient cache policy.',
                    savings: audits['uses-long-cache-ttl'].displayValue,
                    fixType: 'SERVER_CONFIG'
                });
            }

            // 3. Image Sizing
            if (audits['uses-responsive-images'].score < 0.9) {
                opportunities.push({
                    id: 'images',
                    title: 'Properly Size Images',
                    desc: 'Serve images that are appropriately sized to save cellular data.',
                    savings: audits['uses-responsive-images'].displayValue,
                    fixType: 'MANUAL',
                    items: audits['uses-responsive-images'].details?.items || []
                });
            }

            // 4. SEO
            const seoScore = Math.round(lh.categories.seo.score * 100);
            if (seoScore < 90) {
                opportunities.push({
                    id: 'seo',
                    title: 'SEO Best Practices',
                    desc: 'Page lacks some basic SEO meta tags or structure.',
                    savings: `${100 - seoScore} pts lost`,
                    fixType: 'HTML'
                });
            }

            setResult({
                score,
                seoScore,
                url: target,
                opportunities
            });

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to analyze URL. Please check the domain.");
        } finally {
            setLoading(false);
        }
    };

    const openFix = (opp) => {
        let code = '';
        if (opp.id === 'compression') code = FixGenerator.generateCompressionConfig('apache') + '\n' + FixGenerator.generateCompressionConfig('nginx');
        if (opp.id === 'caching') code = FixGenerator.generateCacheHeaders('apache') + '\n' + FixGenerator.generateCacheHeaders('nginx');
        if (opp.id === 'seo') code = FixGenerator.generateBasicSEO();
        if (opp.id === 'images') code = FixGenerator.generateImageAdvice(opp.items);

        setActiveFix({ title: opp.title, code });
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
            {/* Header */}
            <div style={{ padding: '1.5rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: '700', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <ShieldIcon size={24} color="#2563eb" /> Yolofi Inspector
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '2rem' }}>Scan Any Website</h1>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2.5rem' }}>
                    Detect performance bottlenecks and generate instant server fixes.
                </p>

                {/* Input Form */}
                <form onSubmit={handleScan} style={{ display: 'flex', gap: '10px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '0.5rem', background: 'white', borderRadius: '12px' }}>
                    <input
                        type="text"
                        placeholder="Enter URL (e.g. google.com)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: '#2563eb', color: 'white', border: 'none', padding: '0 2rem',
                            borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Scanning...' : 'Analyze'}
                    </button>
                </form>

                {/* Loading State */}
                {loading && (
                    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                        <div className="scanner-ring" style={{ margin: '0 auto 1.5rem' }}>
                            <div className="scan-pulse"></div>
                            <ScanIcon size={64} color="#2563eb" />
                        </div>
                        <p style={{ color: '#64748b' }}>Running remote diagnostic agents...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', textAlign: 'center' }}>
                        ⚠️ {error}
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div style={{ marginTop: '3rem', animation: 'fadeIn 0.5s ease' }}>
                        {/* Score Card */}
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '3rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '100px', height: '100px', borderRadius: '50%',
                                    border: `8px solid ${result.score >= 90 ? '#22c55e' : result.score >= 50 ? '#f59e0b' : '#ef4444'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2.5rem', fontWeight: '800', margin: '0 auto 1rem'
                                }}>
                                    {result.score}
                                </div>
                                <div style={{ fontWeight: '600', color: '#64748b' }}>Performance</div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '100px', height: '100px', borderRadius: '50%',
                                    border: `8px solid ${result.seoScore >= 90 ? '#22c55e' : result.seoScore >= 50 ? '#f59e0b' : '#ef4444'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2.5rem', fontWeight: '800', margin: '0 auto 1rem'
                                }}>
                                    {result.seoScore}
                                </div>
                                <div style={{ fontWeight: '600', color: '#64748b' }}>SEO Health</div>
                            </div>
                        </div>

                        {/* Audit List */}
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Optimizations Found ({result.opportunities.length})</h3>

                        {result.opportunities.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', background: '#f0fdf4', borderRadius: '12px', color: '#166534' }}>
                                <CheckCircleIcon size={32} />
                                <p style={{ fontWeight: '600', marginTop: '0.5rem' }}>No major issues found! Great job.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {result.opportunities.map(opp => (
                                    <div key={opp.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: '#b91c1c' }}>{opp.title}</h4>
                                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{opp.desc}</p>
                                            {opp.savings && <span style={{ display: 'inline-block', marginTop: '0.5rem', background: '#fee2e2', color: '#991b1b', fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px' }}>Impact: {opp.savings}</span>}
                                        </div>
                                        <button
                                            onClick={() => openFix(opp)}
                                            style={{
                                                background: '#2563eb', color: 'white', border: 'none', padding: '0.75rem 1.5rem',
                                                borderRadius: '8px', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Fix This
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Fix Modal */}
            {activeFix && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', width: '90%', maxWidth: '600px', borderRadius: '16px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>{activeFix.title}</h2>
                            <button onClick={() => setActiveFix(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <p style={{ marginBottom: '1rem', color: '#64748b' }}>Copy the code below to fix this issue.</p>

                        <pre style={{
                            background: '#1e293b', color: '#e2e8f0', padding: '1.5rem', borderRadius: '8px',
                            overflowX: 'auto', fontFamily: 'monospace', fontSize: '0.9rem'
                        }}>
                            {activeFix.code}
                        </pre>

                        <button
                            onClick={() => setActiveFix(null)}
                            style={{ width: '100%', marginTop: '2rem', padding: '1rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WebInspector;
