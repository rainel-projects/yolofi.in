/* eslint-disable no-restricted-globals */

/**
 * High-SRA Integrity Worker
 * 
 * ROLE: The "Auditor" & "Traffic Simulator"
 * ARCHITECTURE: Isolated Web Worker
 * GUARANTEE: Zero-Risk (Cannot block Main Thread)
 */

let heartbeatInterval = null;

self.onmessage = async (e) => {
    const { type, payload } = e.data;

    try {
        if (type === 'RUN_DIAGNOSTICS') {
            const report = await runSafeDiagnostics(payload);
            self.postMessage({ type: 'RESULT', data: report });
        }
        else if (type === 'STRESS_TEST') {
            const result = runTrafficSimulation(payload.intensity || 1);
            self.postMessage({ type: 'STRESS_RESULT', data: result });
        }
        // --- Focus Shield Logic (Background Thread) ---
        else if (type === 'START_SHIELD') {
            if (heartbeatInterval) clearInterval(heartbeatInterval);

            // 8-Second Heartbeat (User Request: "Every 8 Seconds")
            heartbeatInterval = setInterval(() => {
                self.postMessage({ type: 'HEARTBEAT' });
            }, 8000);

            self.postMessage({ type: 'SHIELD_STARTED' });
        }
        else if (type === 'STOP_SHIELD') {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            heartbeatInterval = null;
            self.postMessage({ type: 'SHIELD_STOPPED' });
        }
    } catch (error) {
        // Zero-Risk Fallback: Always fail open
        self.postMessage({
            type: 'ERROR',
            error: error.message,
            fallback: { status: 'Unknown', riskScore: 0 }
        });
    }
};

/**
 * Pure Function: Analyze System Snapshot
 * @param {Object} metrics - Memory usage, storage estimate, etc.
 */
async function runSafeDiagnostics(metrics) {
    // 1. Memory Analysis (Heuristic)
    // We treat >90% usage as High Risk
    let memoryRisk = 0;
    if (metrics.memory && metrics.memory.usedJSHeapSize) {
        const usageRatio = metrics.memory.usedJSHeapSize / metrics.memory.jsHeapSizeLimit;
        if (usageRatio > 0.9) memoryRisk = 1.0;
        else if (usageRatio > 0.7) memoryRisk = 0.5;
    }

    // 2. Storage Risk (Quota Check)
    // We treat <10% remaining as High Risk
    let storageRisk = 0;
    if (metrics.storage && metrics.storage.quota) {
        const usedRatio = metrics.storage.usage / metrics.storage.quota;
        if (usedRatio > 0.9) storageRisk = 1.0;
    }

    // 3. Overall Integrity Score (0.0 - 1.0)
    // 1.0 = Perfect Health, 0.0 = Critical Failure
    const integrityScore = 1.0 - Math.max(memoryRisk, storageRisk);

    return {
        integrityScore: parseFloat(integrityScore.toFixed(3)),
        memoryRisk,
        storageRisk,
        timestamp: Date.now(),
        tier: getSystemTier(integrityScore)
    };
}

/**
 * Traffic Simulation (Stress Test)
 * Generates synthetic load to prove isolation.
 */
function runTrafficSimulation(intensity) {
    const start = performance.now();
    let operations = 0;

    // Simulate Heavy Compute (Prime Number Calculation)
    // Intensity 1 = 10k ops, Intensity 10 = 100k ops
    const limit = intensity * 10000;

    const primes = [];
    for (let i = 2; i <= limit; i++) {
        let isPrime = true;
        for (let j = 2; j <= Math.sqrt(i); j++) {
            if (i % j === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) primes.push(i);
        operations++;
    }

    const duration = performance.now() - start;

    return {
        operations,
        duration,
        primesFound: primes.length,
        status: 'STABLE' // If this returns, the worker didn't crash
    };
}

function getSystemTier(score) {
    if (score >= 0.99) return 'Obsidian';
    if (score >= 0.90) return 'Diamond';
    if (score >= 0.75) return 'Gold';
    return 'Standard';
}
