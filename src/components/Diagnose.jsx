import React, { useState } from 'react';
import './Diagnose.css';
import { ScanIcon, CheckCircleIcon } from './Icons';

const Diagnose = () => {
    const [systemInfo, setSystemInfo] = useState(null);
    const [isScanning, setIsScanning] = useState(false);

    const detectSystem = () => {
        setIsScanning(true);
        setTimeout(() => {
            const info = {
                os: navigator.platform,
                browser: navigator.userAgent.split(' ').pop().split('/')[0],
                cores: navigator.hardwareConcurrency || 'Unknown',
                memory: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown',
            };
            setSystemInfo(info);
            setIsScanning(false);
        }, 2000);
    };

    return (
        <section className="path-section section-left diagnose-path" id="diagnose">
            <div className="section-content">
                <div className="section-number">03</div>
                <h2 className="section-title">Start Diagnosis</h2>
                <p className="section-text">
                    Let our AI analyze your system and identify issues automatically.
                </p>

                {!systemInfo && !isScanning && (
                    <button className="scan-button" onClick={detectSystem}>
                        <ScanIcon size={24} color="white" />
                        <span>Start System Scan</span>
                    </button>
                )}

                {systemInfo && (
                    <div className="quick-results">
                        <div className="result-header">
                            <CheckCircleIcon size={32} color="#10b981" />
                            <span>System Detected</span>
                        </div>
                        <div className="result-items">
                            <div className="result-item">
                                <span className="label">OS:</span>
                                <span className="value">{systemInfo.os}</span>
                            </div>
                            <div className="result-item">
                                <span className="label">Browser:</span>
                                <span className="value">{systemInfo.browser}</span>
                            </div>
                        </div>
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
        </section>
    );
};

export default Diagnose;
