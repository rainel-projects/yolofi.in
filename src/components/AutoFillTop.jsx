import React from "react";

const AutoFillTop = () => {
    return (
        <div
            style={{
                width: "100%",
                height: "12rem",
                background: "linear-gradient(135deg, #eef2ff, #f8fafc, #ebf4ff)",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: 1,
            }}
        >
            <svg width="140" height="140" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="90" stroke="#c7d2fe" strokeWidth="1.5" opacity="0.3" />
                <circle cx="100" cy="100" r="60" stroke="#818cf8" strokeWidth="1.5" opacity="0.4" />
                <circle cx="100" cy="100" r="30" stroke="#6366f1" strokeWidth="2" opacity="0.6" />
            </svg>
        </div>
    );
};

export default AutoFillTop;
