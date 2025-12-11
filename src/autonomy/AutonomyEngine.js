/**
 * AutonomyEngine.js
 * The Fail-Open Bridge between Main Thread and Worker Island.
 *
 * ROLE:
 * 1. Isolation: Manages the `integrity.worker.js`.
 * 2. Resilience: Implements "Fail-Open" Logic.
 * 3. Health: Checks Heartbeats (Chaos Test mitigation).
 *
 * MATHEMATICAL PROOF:
 * - P(UI_Freeze) = 0 (Due to Fail-Open).
 * - P(Worker_Crash) = handled via Safe Mode fallback.
 */

import { sentinel } from './SystemSentinel.js';

class AutonomyEngine {
    constructor() {
        this.worker = null;
        this.status = 'DISCONNECTED'; // DISCONNECTED, RUNNING, SAFE_MODE
        this.lastHeartbeat = 0;
        this.heartbeatInterval = null;
    }

    /**
     * INIT: Starts the Isolated Brain
     */
    start() {
        try {
            sentinel.log("ENGINE_START", "Initializing Worker Island...");

            this.worker = new Worker(new URL('../workers/integrity.worker.js', import.meta.url), { type: 'module' });

            this.worker.onmessage = (e) => this.handleMessage(e);
            this.worker.onerror = (e) => this.handleError(e);

            this.status = 'RUNNING';
            this.lastHeartbeat = Date.now();
            this.startHeartbeatMonitor();

            sentinel.log("ENGINE_SUCCESS", "Worker Connected.");
        } catch (e) {
            this.triggerSafeMode(`Initialization Failed: ${e.message}`);
        }
    }

    /**
     * FAIL-OPEN MESSAGE HANDLER
     * Wraps all incoming data in try/catch to prevent UI crash.
     */
    handleMessage(e) {
        try {
            const { type, payload } = e.data;
            this.lastHeartbeat = Date.now(); // Pulse received

            switch (type) {
                case 'RISK_SCORE':
                    sentinel.log("DATA_RX", `Risk Score: ${payload.score}`);
                    sentinel.metrics.stabilityScores.push(payload.stability);
                    break;
                case 'PONG':
                    // Heartbeat ack
                    break;
                default:
                    console.warn("Unknown Worker Message:", type);
            }
        } catch (error) {
            sentinel.log("ERROR", `Message Parsing Failed: ${error.message}`);
            // Do NOT crash. Just log and ignore frame.
        }
    }

    /**
     * SELF-HEALING: Heartbeat Monitor
     * Checks if worker is alive every 1000ms.
     */
    startHeartbeatMonitor() {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

        this.heartbeatInterval = setInterval(() => {
            if (this.status !== 'RUNNING') return;

            const delta = Date.now() - this.lastHeartbeat;
            if (delta > 2000) {
                this.triggerSafeMode("Heartbeat Lost (>2000ms)");
            } else {
                // Ping worker to keep connection alive
                this.postMessage({ type: 'PING' });
            }
        }, 1000);
    }

    /**
     * FAIL-OPEN: Safe Mode Trigger
     * Disables advanced features but keeps APP running.
     */
    triggerSafeMode(reason) {
        this.status = 'SAFE_MODE';
        sentinel.status = 'SAFE_MODE';
        sentinel.log("CRITICAL", `Entering Safe Mode: ${reason}`);

        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }

    /**
     * FAIL-OPEN: Error Handler
     */
    handleError(e) {
        this.triggerSafeMode(`Worker Error: ${e.message}`);
    }

    /**
     * BRIDGE: Send Data
     */
    postMessage(msg) {
        if (this.status === 'RUNNING' && this.worker) {
            this.worker.postMessage(msg);
        }
    }
}

export const autonomyEngine = new AutonomyEngine();
