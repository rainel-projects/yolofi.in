import React from "react";
import "./Diagnose.css"; // Reuse existing styles or create new ones
import { CheckCircleIcon, BoltIcon } from "./Icons";

const DownloadPage = ({ onContinue }) => {
    return (
        <div className="download-page-container" style={{ textAlign: "center", padding: "3rem 1rem", animation: "fadeIn 0.5s ease-out" }}>

            <div style={{ marginBottom: "2rem" }}>
                <div style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem"
                }}>
                    <CheckCircleIcon size={48} color="#10b981" />
                </div>
                <h2 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#1f2937", marginBottom: "0.5rem" }}>
                    Optimization Successful
                </h2>
                <p style={{ fontSize: "1.1rem", color: "#6b7280", maxWidth: "500px", margin: "auto" }}>
                    Your browser performance has been restored.
                </p>
            </div>

            <div className="download-card" style={{
                background: "linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)",
                border: "1px solid #e5e7eb",
                borderRadius: "20px",
                padding: "2.5rem",
                maxWidth: "600px",
                margin: "0 auto 3rem",
                boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
            }}>
                <h3 style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "1rem", color: "#111827" }}>
                    Maintain Peak Performance
                </h3>
                <p style={{ color: "#4b5563", marginBottom: "2rem", lineHeight: "1.6" }}>
                    To ensure your device stays optimized and secure against future slowdowns,
                    we recommend installing our free dedicated tools.
                </p>

                <button
                    onClick={() => window.open("https://example.com/download", "_blank")}
                    style={{
                        padding: "1rem 2.5rem",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "white",
                        background: "#2563eb",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(37, 99, 235, 0.3)",
                        transition: "all 0.2s",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "1rem"
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Free Tools
                </button>
                <div style={{ fontSize: "0.9rem", color: "#9ca3af", marginTop: "0.5rem" }}>
                    Auto-detecting your device...
                </div>
            </div>

            <div>
                <button
                    onClick={onContinue}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "#6b7280",
                        fontSize: "1rem",
                        cursor: "pointer",
                        textDecoration: "underline",
                        padding: "10px"
                    }}
                >
                    No thanks, show my performance results &rarr;
                </button>
            </div>
        </div>
    );
};

export default DownloadPage;
