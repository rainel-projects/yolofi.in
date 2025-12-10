import React from 'react';

const FundingPrompt = () => {
    return (
        <div style={{
            margin: "2rem 0",
            padding: "1.5rem",
            background: "#fffbeb",
            borderRadius: "12px",
            border: "1px solid #fcd34d",
            textAlign: "center",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
        }}>
            <p style={{
                fontWeight: "700",
                color: "#92400e",
                marginBottom: "0.5rem",
                fontSize: "1.1rem"
            }}>
                Fund The Development
            </p>
            <p style={{ color: "#b45309", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                Help us keep improving the diagnosis engine. <br />
                Fund for future development.
            </p>
            <a href="https://buymeacoffee.com/yolofi" target="_blank" rel="noopener noreferrer"
                style={{
                    display: "inline-flex", alignItems: "center", gap: "10px",
                    background: "#ffdd00", color: "#000", padding: "12px 24px",
                    borderRadius: "50px", textDecoration: "none", fontWeight: "800",
                    fontSize: "1rem",
                    boxShadow: "0 4px 12px rgba(252, 211, 77, 0.4)",
                    transition: "transform 0.2s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
                <span style={{ fontSize: "1.2rem" }}>☕</span> Buy me a coffee
            </a>
        </div>
    );
};

export default FundingPrompt;
