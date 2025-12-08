import "./GetStarted.css";

export default function GetStarted({ onContinue }) {
    return (
        <div className="gs-container">
            <h1 className="gs-title">Welcome to Yolofi</h1>
            <p className="gs-subtitle">Simple, smart & fast computer troubleshooting.</p>

            <button className="gs-button" onClick={onContinue}>
                Get Started →
            </button>
        </div>
    );
}
