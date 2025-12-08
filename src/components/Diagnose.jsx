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
        const memory = nav.deviceMemory ? `${nav.deviceMemory} GB` : "Unknown";

        const resolution = `${window.screen.width} x ${window.screen.height}`;
        const pixelRatio = window.devicePixelRatio || 1;

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
                pixelRatio: `${pixelRatio}x`,
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

    <p className="scan-time">Scanned at {diagnosticReport.scanTime}</p>
                            </div >
                        </div >

    <div className="info-grid">
        {Object.entries(diagnosticReport.systemInfo).map(([k, v]) => (
            <InfoItem key={k} label={k} value={v} />
        ))}
    </div>
                    </div >
                )}
            </section >
        </>
    );
};

const InfoItem = ({ label, value }) => (
    <div className="info-item">
        <strong>{label}:</strong> {value}
    </div>
);

export default Diagnose;
