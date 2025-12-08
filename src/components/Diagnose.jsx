import React, { useState } from 'react';
import './Diagnose.css';
import { ScanIcon, CheckCircleIcon } from './Icons';
import FeedbackForm from './FeedbackForm';

const Diagnose = () => {
    const [diagnosticReport, setDiagnosticReport] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    const runDiagnostics = async () => {
        setIsScanning(true);

        // Simulate scanning delay for better UX
        setTimeout(async () => {
            const report = await generateDiagnosticReport();
            setDiagnosticReport(report);
            setIsScanning(false);
        }, 2500);
    };

    const generateDiagnosticReport = async () => {
        // Get real device information
        const nav = navigator;
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

        // Basic system info
        const os = detectOS();
        const browser = detectBrowser();
        const cores = nav.hardwareConcurrency || 'Unknown';
        const memory = nav.deviceMemory ? `${nav.deviceMemory} GB` : 'Unknown';

        // Screen info
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const resolution = `${screenWidth} x ${screenHeight}`;
        const pixelRatio = window.devicePixelRatio || 1;

        // Network info
        const networkType = connection?.effectiveType || 'Unknown';
        const downlink = connection?.downlink ? `${connection.downlink} Mbps` : 'Unknown';

        // Battery info (if available)
        let batteryInfo = null;
        if (nav.getBattery) {
            try {
                const battery = await nav.getBattery();
                batteryInfo = {
                    level: Math.round(battery.level * 100),
                    charging: battery.charging
                };
            } catch (e) {
                // Battery API not available
            }
        }

        // Language & timezone
        const language = nav.language || 'Unknown';
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Storage estimate (if available)
        let storageInfo = null;
        if (nav.storage && nav.storage.estimate) {
            try {
                const estimate = await nav.storage.estimate();
                const used = (estimate.usage / (1024 * 1024 * 1024)).toFixed(2);
                const total = (estimate.quota / (1024 * 1024 * 1024)).toFixed(2);
                const usagePercent = ((estimate.usage / estimate.quota) * 100).toFixed(1);
                storageInfo = { used, total, usagePercent };
            } catch (e) {
                // Storage API not available
            }
        }

        // Detect issues and recommendations
        const issues = detectIssues({
            cores,
            memory,
            networkType,
            storageInfo,
            batteryInfo,
            pixelRatio
        });

        return {
            systemInfo: {
                os,
                browser,
                cores,
                memory,
                resolution,
                pixelRatio: `${pixelRatio}x`,
                language,
                timezone
            },
            networkInfo: {
                type: networkType,
                speed: downlink
            },
            batteryInfo,
            storageInfo,
            issues,
            scanTime: new Date().toLocaleString()
        };
    };

    const detectOS = () => {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('Win') !== -1) return 'Windows';
        if (userAgent.indexOf('Mac') !== -1) return 'macOS';
        if (userAgent.indexOf('Linux') !== -1) return 'Linux';
        if (userAgent.indexOf('Android') !== -1) return 'Android';
        if (userAgent.indexOf('iOS') !== -1) return 'iOS';
        return 'Unknown';
    };

    const detectBrowser = () => {
        const userAgent = navigator.userAgent;
        if (userAgent.indexOf('Chrome') !== -1 && userAgent.indexOf('Edg') === -1) return 'Chrome';
        if (userAgent.indexOf('Safari') !== -1 && userAgent.indexOf('Chrome') === -1) return 'Safari';
        if (userAgent.indexOf('Firefox') !== -1) return 'Firefox';
        if (userAgent.indexOf('Edg') !== -1) return 'Edge';
        if (userAgent.indexOf('Opera') !== -1 || userAgent.indexOf('OPR') !== -1) return 'Opera';
        return 'Unknown';
    };

    const detectIssues = (data) => {
        const issues = [];
        const recommendations = [];

        // Check CPU cores
        if (data.cores !== 'Unknown' && data.cores < 4) {
            issues.push({
                severity: 'warning',
                title: 'Low CPU Cores',
                description: `Your device has ${data.cores} cores. Modern apps may run slowly.`,
                recommendation: 'Consider upgrading for better multitasking performance.'
            });
        }

        // Check memory
        if (data.memory !== 'Unknown') {
            const memGB = parseInt(data.memory);
            if (memGB < 4) {
                issues.push({
                    severity: 'high',
                    title: 'Low RAM',
                    description: `Only ${data.memory} RAM detected. This may cause slowdowns.`,
                    recommendation: 'Upgrade to at least 8GB RAM for better performance.'
                });
            }
        }

        // Check network
        if (data.networkType === 'slow-2g' || data.networkType === '2g') {
            issues.push({
                severity: 'medium',
                title: 'Slow Network',
                description: 'Your connection is very slow. This affects browsing and downloads.',
                recommendation: 'Switch to WiFi or check your network provider.'
            });
        }

        // Check storage
        if (data.storageInfo && parseFloat(data.storageInfo.usagePercent) > 90) {
            issues.push({
                severity: 'high',
                title: 'Storage Almost Full',
                description: `${data.storageInfo.usagePercent}% of storage used.`,
                recommendation: 'Free up space by deleting unused files and apps.'
            });
        }

        // Check battery
        if (data.batteryInfo && data.batteryInfo.level < 20 && !data.batteryInfo.charging) {
            issues.push({
                severity: 'warning',
                title: 'Low Battery',
                description: `Battery at ${data.batteryInfo.level}%. Device may shut down soon.`,
                recommendation: 'Connect to power source immediately.'
            });
        }

        // If no issues found
        if (issues.length === 0) {
            recommendations.push({
                title: 'System Healthy',
                description: 'No critical issues detected. Your system is running optimally!'
            });
        }

        return { issues, recommendations };
    };

    return (
        <section className="path-section section-left diagnose-path" id="diagnose">
            <div className="section-content">
                <div className="section-number">03</div>
                <h2 className="section-title">Start Diagnosis</h2>
                <p className="section-text">
                    Let our AI analyze your system and identify issues automatically.
                </p>

                {!diagnosticReport && !isScanning && (
                    <button className="scan-button" onClick={runDiagnostics}>
                        <ScanIcon size={24} color="white" />
                        <span>Start System Scan</span>
                    </button>
                )}

                {diagnosticReport && (
                    <div className="diagnostic-report">
                        <div className="report-header">
                            <CheckCircleIcon size={32} color="#10b981" />
                            <div>
                                <h3>Diagnostic Complete</h3>
                                <p className="scan-time">Scanned at {diagnosticReport.scanTime}</p>
                            </div>
                        </div>

                        {/* System Information */}
                        <div className="report-section">
                            <h4>System Information</h4>
                            <div className="info-grid">
                                <InfoItem label="Operating System" value={diagnosticReport.systemInfo.os} />
                                <InfoItem label="Browser" value={diagnosticReport.systemInfo.browser} />
                                <InfoItem label="CPU Cores" value={diagnosticReport.systemInfo.cores} />
                                <InfoItem label="RAM" value={diagnosticReport.systemInfo.memory} />
                                <InfoItem label="Screen Resolution" value={diagnosticReport.systemInfo.resolution} />
                                <InfoItem label="Pixel Ratio" value={diagnosticReport.systemInfo.pixelRatio} />
                                <InfoItem label="Language" value={diagnosticReport.systemInfo.language} />
                                <InfoItem label="Timezone" value={diagnosticReport.systemInfo.timezone} />
                            </div>
                        </div>

                        {/* Network Information */}
                        <div className="report-section">
                            <h4>Network Status</h4>
                            <div className="info-grid">
                                <InfoItem label="Connection Type" value={diagnosticReport.networkInfo.type} />
                                <InfoItem label="Download Speed" value={diagnosticReport.networkInfo.speed} />
                            </div>
                        </div>

                        {/* Battery Information */}
                        {diagnosticReport.batteryInfo && (
                            <div className="report-section">
                                <h4>Battery Status</h4>
                                <div className="info-grid">
                                    <InfoItem
                                        label="Battery Level"
                                        value={`${diagnosticReport.batteryInfo.level}%`}
                                    />
                                    <InfoItem
                                        label="Charging"
                                        value={diagnosticReport.batteryInfo.charging ? 'Yes' : 'No'}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Storage Information */}
                        {diagnosticReport.storageInfo && (
                            <div className="report-section">
                                <h4>Storage Usage</h4>
                                <div className="storage-bar">
                                    <div className="storage-fill" style={{ width: `${diagnosticReport.storageInfo.usagePercent}%` }}></div>
                                </div>
                                <div className="storage-info">
                                    <span>{diagnosticReport.storageInfo.used} GB used</span>
                                    <span>{diagnosticReport.storageInfo.total} GB total</span>
                                </div>
                            </div>
                        )}

                        {/* Issues & Recommendations */}
                        {diagnosticReport.issues.issues.length > 0 && (
                            <div className="report-section issues-section">
                                <h4>⚠️ Issues Detected</h4>
                                {diagnosticReport.issues.issues.map((issue, index) => (
                                    <div key={index} className={`issue-card ${issue.severity}`}>
                                        <div className="issue-header">
                                            <span className="severity-badge">{issue.severity}</span>
                                            <h5>{issue.title}</h5>
                                        </div>
                                        <p className="issue-desc">{issue.description}</p>
                                        <p className="issue-rec">💡 {issue.recommendation}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {diagnosticReport.issues.recommendations.length > 0 && (
                            <div className="report-section recommendations-section">
                                {diagnosticReport.issues.recommendations.map((rec, index) => (
                                    <div key={index} className="recommendation-card">
                                        <h5>✅ {rec.title}</h5>
                                        <p>{rec.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            className="feedback-btn"
                            onClick={() => setShowFeedback(true)}
                        >
                            Share Your Experience
                        </button>
                    </div>
                )}
            </div>

            <div className="section-visual">
                <div className="diagnose-visual">
                    {isScanning ? (
                        <div className="scanner-ring">
                            <div className="scan-pulse"></div>
                        </div>
                    ) : (
                        <svg width="300" height="300" viewBox="0 0 300 300">
                            <circle cx="150" cy="150" r="120" fill="none" stroke="#667eea" strokeWidth="2" opacity="0.2" />
                            <circle cx="150" cy="150" r="90" fill="none" stroke="#764ba2" strokeWidth="2" opacity="0.3" />
                            <circle cx="150" cy="150" r="60" fill="none" stroke="#667eea" strokeWidth="3" opacity="0.5" />
                            <circle cx="150" cy="150" r="30" fill="#667eea" opacity="0.1" />
                        </svg>
                    )}
                </div>
            </div>

            {showFeedback && (
                <FeedbackForm
                    onClose={() => setShowFeedback(false)}
                    issue={diagnosticReport?.systemInfo?.os || "System issue"}
                />
            )}
        </section>
    );
};

// Helper component for info items
const InfoItem = ({ label, value }) => (
    <div className="info-item">
        <span className="info-label">{label}</span>
        <span className="info-value">{value}</span>
    </div>
);

export default Diagnose;
