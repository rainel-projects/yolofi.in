import React from 'react';
import logo from '../assets/logo.jpg';

export default function Intro({ onContinue }) {
    return (
        <div style={styles.container}>
            <img src={logo} alt="Yolofi" style={styles.logo} />

            <h1 style={styles.heading}>Welcome to Yolofi</h1>
            <p style={styles.subText}>Simple, fast and smart PC troubleshooting</p>

            <button style={styles.btn} onClick={onContinue}>
                Get Started →
            </button>
        </div>
    );
}

const styles = {
    container: {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        textAlign: "center",
        alignItems: "center",
        background: "#eef2ff"
    },
    logo: { width: "160px", marginBottom: "20px" },
    heading: { fontSize: "32px", marginBottom: "8px", color: "#222" },
    subText: { color: "#555", marginBottom: "30px", fontSize: "15px" },
    btn: {
        background: "#4a6cff",
        color: "white",
        border: "none",
        padding: "14px 32px",
        borderRadius: "25px",
        fontSize: "17px",
        cursor: "pointer",
        transition: "0.3s"
    }
};
