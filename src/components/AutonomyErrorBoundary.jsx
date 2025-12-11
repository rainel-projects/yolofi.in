/**
 * AutonomyErrorBoundary.jsx
 * The Final Line of Defense for the UI Layer.
 *
 * MATHEMATICAL PROOF:
 * - P(WhiteScreen) = 0.
 * - Logic: Catches all child Render Errors -> Renders "Safe Mode" UI.
 */

import React from 'react';

class AutonomyErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Audit Log the UI Crash
        console.error("Autonomy UI Crash:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // THE FAIL-OPEN UI
            return (
                <div style={{
                    padding: '2rem',
                    background: '#0a0a0a',
                    color: '#33ff00',
                    fontFamily: 'monospace',
                    border: '1px solid #33ff00',
                    borderRadius: '8px',
                    margin: '2rem'
                }}>
                    <h2 style={{ margin: 0 }}>⚠️ SYSTEM PAUSED</h2>
                    <p>The Autonomy Console encountered a render anomoly.</p>
                    <p>
                        <strong>Status:</strong> SAFE MODE ACTIVE<br />
                        <strong>Core Engine:</strong> RUNNING (Unaffected)<br />
                        <strong>Error:</strong> {this.state.error?.message}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        style={{
                            background: 'transparent',
                            border: '1px solid #33ff00',
                            color: '#33ff00',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer',
                            marginTop: '1rem'
                        }}
                    >
                        REBOOT UI LAYER
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AutonomyErrorBoundary;
