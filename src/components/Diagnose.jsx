import React, { useState, useRef } from "react";
import "./Diagnose.css";
import { ScanIcon, CheckCircleIcon, BoltIcon } from "./Icons";
import FeedbackForm from "./FeedbackForm";
import AutoFillTop from "./AutoFillTop";
import useAutoFillSpace from "./useAutoFillSpace";
import Optimizer from "./Optimizer";
import DownloadPage from "./DownloadPage";
import GamifiedResults from "./GamifiedResults";
import { classifyStorage, getMemoryStatus, warmNetwork } from "../utils/OptimizerBrain";

const Diagnose = () => {
    // viewState: "IDLE" | "SCANNING" | "REPORT" | "OPTIMIZING" | "DOWNLOAD" | "RESULTS"
    const [viewState, setViewState] = useState("IDLE");
    const [diagnosticReport, setDiagnosticReport] = useState(null);
    const [optimizationResult, setOptimizationResult] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const containerRef = useRef(null);
    const showFill = useAutoFillSpace(containerRef);

    const runDiagnostics = async () => {
        setViewState("SCANNING");
        setTimeout(async () => {
            const report = await generateDiagnosticReport();
            setDiagnosticReport(report);
            setViewState("REPORT");
        }, 2500);
    };

    // ... (rest of methods)
    const startOptimization = () => {
        setViewState("OPTIMIZING");
    };

    const handleOptimizationComplete = (result) => {
        setOptimizationResult(result);
        setViewState("DOWNLOAD"); // Go to Download page first
    };

    const handleDownloadContinue = () => {
        setViewState("RESULTS"); // User skipped/clicked continue -> Show Analysis
    };

    const handleRescan = () => {
        setDiagnosticReport(null);
        runDiagnostics();
    };

    const generateDiagnosticReport = async () => {
        const nav = navigator;
        const connection = nav.connection;

        // Capture Baseline Metrics for Verification
        const storageBaseline = classifyStorage();
        const memoryBaseline = getMemoryStatus();
        // Quick latency check for baseline
        const networkBaseline = await warmNetwork(); // We use this early to get 'before' latency

        const os = detectOS();
        const browser = detectBrowser();
        // ... (rest of standard detection logic)
        const cores = nav.hardwareConcurrency || "Unknown";

        // ... (memory detection code) ...
        let memory = "Unknown";
        if (nav.deviceMemory) {
            // ...
            memory = `~${nav.deviceMemory * 2} GB`;
        } else if (performance.memory) {
            const jsHeapGB = (performance.memory.jsHeapSizeLimit / 1024 / 1024 / 1024).toFixed(1);
            memory = `~${jsHeapGB} GB (estimated)`;
        } else if (os === "iOS" || os === "macOS") {
            memory = estimateIOSMemory();
        }

        const resolution = `${window.screen.width} x ${window.screen.height}`;
        const pixelRatio = window.devicePixelRatio || 1;
        // ... (pixel ratio logic) ...
        let pixelRatioDisplay = `${pixelRatio}x`;
        if (pixelRatio >= 2) pixelRatioDisplay += " (Retina/High-DPI)";
        else if (pixelRatio > 1 && pixelRatio < 2) pixelRatioDisplay += " (Enhanced)";
        else pixelRatioDisplay += " (Standard)";

        // ... (network/battery logic) ...
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
            // ... (storage api logic)
            const estimate = await nav.storage.estimate();
            storageInfo = {
                used: (estimate.usage / 1024 / 1024 / 1024).toFixed(2),
                total: (estimate.quota / 1024 / 1024 / 1024).toFixed(2),
                usagePercent: ((estimate.usage / estimate.quota) * 100).toFixed(1),
            };
        }

        return {
            baseline: {
                storage: storageBaseline,
                memory: memoryBaseline,
                network: networkBaseline
            },
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
        if (data.storageInfo && data.storageInfo.usagePercent > 90) issues.push({ severity: "high", title: "Low Storage" });

        if (!issues.length) recommendations.push({ title: "System Healthy", description: "No major issues detected." });

        return { issues, recommendations };
    };

    return (
        <>
            {showFill && <AutoFillTop />}

            <section ref={containerRef} className="diagnose-path" id="diagnose">

                {/* 1. IDLE & SCANNING STATE - Same initial UI */}
                {(viewState === "IDLE" || viewState === "SCANNING") && (
                    <div style={{ textAlign: "center", width: "100%", marginBottom: "3rem" }}>
                        <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#1f2937" }}>
                            System Diagnostics
                        </h2>
                        <p style={{ maxWidth: "480px", margin: "auto", color: "#6b7280", marginBottom: "1.5rem" }}>
                            Let Yolofi examine your device performance & system condition.
                        </p>

                        {viewState === "IDLE" && (
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
                                Start Scan
                            </button>
                        )}

                        {viewState === "SCANNING" && (
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
                )}

                {/* 2. REPORT STATE */}
                {viewState === "REPORT" && diagnosticReport && (
                    <>
                        <div style={{ textAlign: "center", width: "100%", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#1f2937" }}>Analysis Complete</h2>
                            <button
                                className="optimize-btn"
                                onClick={startOptimization}
                                style={{
                                    padding: "1rem 2.5rem",
                                    borderRadius: "12px",
                                    fontSize: "1.1rem",
                                    background: "#10b981", // Green for action
                                    color: "white",
                                    border: "none",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    margin: "1rem 0",
                                    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.3)",
                                    transition: "transform 0.2s",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "10px"
                                }}
                            >
                                <BoltIcon size={22} color="white" />
                                Intelligent Optimize
                            </button>
                        </div>

                        <div className="diagnostic-report">
                            <div className="report-header">
                                <CheckCircleIcon size={32} color="#10b981" />
                                <div>
                                    <h3>Diagnostic Report</h3>
                                    <p className="scan-time">Scanned at {diagnosticReport.scanTime}</p>
                                </div>
                            </div>

                            <div className="info-grid">
                                {Object.entries(diagnosticReport.systemInfo).map(([k, v]) => (
                                    <InfoItem key={k} label={k} value={v} />
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* 3. OPTIMIZING STATE */}
                {viewState === "OPTIMIZING" && (
                    <Optimizer onComplete={handleOptimizationComplete} />
                )}

                {/* 4. DOWNLOAD STATE (New Interstitial) */}
                {viewState === "DOWNLOAD" && (
                    <DownloadPage onContinue={handleDownloadContinue} />
                )}

                {/* 5. RESULTS STATE */}
                {viewState === "RESULTS" && (
                    <GamifiedResults
                        onRescan={handleRescan}
                        results={optimizationResult}
                        baseline={diagnosticReport?.baseline}
                    />
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
