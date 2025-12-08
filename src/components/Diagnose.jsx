import React, { useState, useRef } from "react";
import "./Diagnose.css";
import { ScanIcon, CheckCircleIcon } from "./Icons";
import FeedbackForm from "./FeedbackForm";
import AutoFillTop from "./AutoFillTop";
import useAutoFillSpace from "./useAutoFillSpace";

const Diagnose = () => {
    const [diagnosticReport, setDiagnosticReport] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    const containerRef = useRef(null);
    const showFill = useAutoFillSpace(containerRef);

    const runDiagnostics = async () => {
        setIsScanning(true);

        setTimeout(async () => {
            const report = await generateDiagnosticReport();
            setDiagnosticReport(report);
            setIsScanning(false);
        }, 2500);
    };



    const generateDiagnosticReport = async () => {
        const nav = navigator;
        const connection = nav.connection;

        const os = detectOS();
        const browser = detectBrowser();
        const cores = nav.hardwareConcurrency || "Unknown";

        // Memory: deviceMemory gives approximate value (privacy-limited)
        // For better accuracy, estimate based on performance.memory if available
        let memory = "Unknown";
        if (nav.deviceMemory) {
            // deviceMemory is intentionally limited by browsers (usually shows ~half of actual RAM)
            // Show a more realistic estimate
            const reportedMemory = nav.deviceMemory;
            const estimatedActual = reportedMemory * 2; // Common browser behavior
            memory = `~${estimatedActual} GB (${reportedMemory} GB available to browser)`;
        } else if (performance.memory) {
            // Fallback: estimate from JS heap
            const jsHeapGB = (performance.memory.jsHeapSizeLimit / 1024 / 1024 / 1024).toFixed(1);
            memory = `~${jsHeapGB} GB (estimated)`;
        } else if (os === "iOS" || os === "macOS") {
            // iOS/Safari doesn't support deviceMemory, estimate based on device
            memory = estimateIOSMemory();
        }

        const resolution = `${window.screen.width} x ${window.screen.height}`;
        const pixelRatio = window.devicePixelRatio || 1;

        // Make pixel ratio more understandable
        let pixelRatioDisplay = `${pixelRatio}x`;
        if (pixelRatio >= 2) {
            pixelRatioDisplay += " (Retina/High-DPI)";
        } else if (pixelRatio > 1 && pixelRatio < 2) {
            pixelRatioDisplay += " (Enhanced)";
        } else {
            pixelRatioDisplay += " (Standard)";
        }

        const networkType = connection?.effectiveType || "Unknown";
        const downlink = connection?.downlink ? `${connection.downlink} Mbps` : "Unknown";

        let batteryInfo = null;
        if (nav.getBattery) {
            const battery = await nav.getBattery();
            batteryInfo = {
                level: Math.round(battery.level * 100),
                charging: battery.charging,
            };
        }

        let storageInfo = null;
        if (nav.storage?.estimate) {
            const estimate = await nav.storage.estimate();
            storageInfo = {
                used: (estimate.usage / 1024 / 1024 / 1024).toFixed(2),
                total: (estimate.quota / 1024 / 1024 / 1024).toFixed(2),
                usagePercent: ((estimate.usage / estimate.quota) * 100).toFixed(1),
            };
        }

        return {
            systemInfo: {
                os,
                browser,
                cores,
                memory,
                resolution,
                pixelRatio: pixelRatioDisplay,
                language: nav.language,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            networkInfo: { type: networkType, speed: downlink },
            batteryInfo,
            storageInfo,
            issues: detectIssues({ cores, memory, networkType, storageInfo, batteryInfo }),
            scanTime: new Date().toLocaleString(),
        };
    };


    const estimateIOSMemory = () => {
        return "Restricted (Apple Privacy)";
    };


    const detectOS = () => {
        const u = navigator.userAgent;
        if (u.includes("Win")) return "Windows";
        if (u.includes("Mac")) return "macOS";
        if (u.includes("Linux")) return "Linux";
        if (u.includes("Android")) return "Android";
        if (u.includes("iOS")) return "iOS";
        return "Unknown";
    };

    const detectBrowser = () => {
        const u = navigator.userAgent;
        if (u.includes("Edg")) return "Edge";
        if (u.includes("Chrome")) return "Chrome";
        if (u.includes("Firefox")) return "Firefox";
        if (u.includes("Safari")) return "Safari";
        return "Unknown";
    };

    const detectIssues = (data) => {
        const issues = [];
        const recommendations = [];

        if (data.cores < 4) issues.push({ severity: "warning", title: "Low CPU Cores" });

        if (parseInt(data.memory) < 4) issues.push({ severity: "high", title: "Low RAM" });

        if (data.networkType === "2g") issues.push({ severity: "medium", title: "Slow Network" });

        if (data.storageInfo && data.storageInfo.usagePercent > 90)
            issues.push({ severity: "high", title: "Low Storage" });

        if (!issues.length)
            recommendations.push({ title: "System Healthy", description: "No major issues detected." });

        return { issues, recommendations };
    };

    return (
        <>
            {showFill && <AutoFillTop />}

            <section ref={containerRef} className="diagnose-path" id="diagnose">

                {/* ---- Scan UI - Always visible ---- */}
                <div style={{ textAlign: "center", width: "100%", marginBottom: "3rem" }}>
                    <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#1f2937" }}>
                        System Diagnostics
                    </h2>
                    <p style={{ maxWidth: "480px", margin: "auto", color: "#6b7280", marginBottom: "1.5rem" }}>
                        {!diagnosticReport
                            ? "Let Yolofi examine your device performance & system condition."
                            : "Your diagnostic report is ready. Scan again to refresh."
                        }
                    </p>

                    {!isScanning && (
                        <button
                            className="scan-button"
                            onClick={runDiagnostics}
                            style={{
                                padding: "1rem 2.5rem",
                                borderRadius: "12px",
                                fontSize: "1rem",
                                background: "#6a85ff",
                                color: "white",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "10px",
                                boxShadow: "0 6px 16px rgba(106,133,255,0.25)",
                                border: "none",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                            }}
                        >
                            <ScanIcon size={26} color="white" />
                            {diagnosticReport ? "Re-scan" : "Start Scan"}
                        </button>
                    )}

                    {isScanning && (
                        <div style={{ display: "inline-block" }}>
                            <div className="scanner-ring">
                                <div className="scan-pulse"></div>
                            </div>
                            <p style={{ marginTop: "12px", fontSize: "0.9rem", color: "#6b7280" }}>
                                Running diagnostics...
                            </p>
                        </div>
                    )}
                </div>

                {/* ---- Report UI - Shows below button ---- */}
                {diagnosticReport && (
                    <div className="diagnostic-report">
                        <div className="report-header">
                            <CheckCircleIcon size={32} color="#10b981" />
                            <div>
                                <h3>Diagnostic Complete</h3>
                                <p className="scan-time">Scanned at {diagnosticReport.scanTime}</p>
                            </div>
                        </div>

                        <div className="info-grid">
                            {Object.entries(diagnosticReport.systemInfo).map(([k, v]) => (
                                <InfoItem key={k} label={k} value={v} />
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="info-item">
        <strong>{label}:</strong> {value}
    </div>
);

export default Diagnose;
