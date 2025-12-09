/**
 * Yolofi Optimizer Brain
 * Core logic for the "Browser Performance Intelligence System"
 */

// --- 1. Context-Aware Storage Intelligence ---
export const classifyStorage = () => {
    let keys = [];
    try {
        keys = Object.keys(localStorage);
    } catch (e) {
        console.warn("LocalStorage access denied", e);
        return { critical: [], safe: [], trash: [], totalSize: 0 };
    }

    const report = {
        critical: [], // Tokens, Sessions (Protected)
        safe: [],     // Preferences, Settings (Keep)
        trash: [],    // Logs, Temp, Cache, Old Tests (Auto-delete)
        totalSize: 0
    };

    keys.forEach(k => {
        const val = localStorage.getItem(k) || "";
        report.totalSize += k.length + val.length;

        // Regex for Critical Data (Auth tokens, sessions)
        if (/auth|token|session|jwt|uid|user_id|login/i.test(k)) {
            report.critical.push(k);
        }
        // Regex for Trash (Logs, temp, cache, analytics garbage, ab_tests)
        else if (/cache|tmp|temp|log|debug|track|analytics|ab_|test_|old_|garbage/i.test(k)) {
            report.trash.push(k);
        }
        // Default to Safe (UI prefs, themes, app state)
        else {
            report.safe.push(k);
        }
    });

    return report;
};

// --- NEW: Real Storage API Estimation ---
export const getStorageEstimate = async () => {
    if (navigator.storage && navigator.storage.estimate) {
        try {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage || 0,
                quota: estimate.quota || 0
            };
        } catch (e) {
            console.warn("Storage API failed", e);
        }
    }
    return { usage: 0, quota: 0 };
};

// --- 2. Intelligent Memory Monitoring ---
export const getMemoryStatus = () => {
    // Note: performance.memory is Chrome/Chromium only standard
    const mem = window.performance && window.performance.memory;

    if (!mem) return { status: "Unknown", percent: 0, label: "Standard" };

    const used = mem.usedJSHeapSize;
    const total = mem.jsHeapSizeLimit;
    const percent = Math.round((used / total) * 100);

    let status = "Smooth";
    let label = "Efficient";
    let color = "#10b981"; // Green

    if (percent < 35) {
        status = "Smooth";
        label = "Your device is operating efficiently.";
        color = "#10b981";
    } else if (percent < 65) {
        status = "Active";
        label = "You’re multitasking. We can improve responsiveness.";
        color = "#f59e0b"; // Yellow
    } else if (percent < 85) {
        status = "Heavy";
        label = "Yolofi can optimize memory and refresh unused scripts.";
        color = "#f97316"; // Orange
    } else {
        status = "Critical";
        label = "Performance degradation detected — Action recommended.";
        color = "#ef4444"; // Red
    }

    return { used, total, percent, status, label, color };
};

// --- 3. Adaptive Network Conditioning ---
export const warmNetwork = async () => {
    const results = {
        latency: 0,
        preconnected: 0,
        status: "Stable"
    };

    // 1. Preconnect to common CDNs to warm up DNS/TCP
    const commonCDNs = [
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com",
        "https://google.com"
    ];

    commonCDNs.forEach(url => {
        const check = document.head.querySelector(`link[href="${url}"]`);
        if (!check) {
            const link = document.createElement("link");
            link.rel = "preconnect";
            link.href = url;
            document.head.appendChild(link);
            results.preconnected++;
        }
    });

    // 2. Latency Pings (simulated real-world fetch)
    const pings = [
        fetch(window.location.origin, { method: 'HEAD', mode: 'no-cors' }).then(() => Date.now()),
        // Add a lightweight public endpoint if needed, but origin is safest for now
    ];

    const start = Date.now();
    try {
        await Promise.all(pings);
        const end = Date.now();
        results.latency = end - start;

        if (results.latency < 50) results.status = "Lightning Fast";
        else if (results.latency < 150) results.status = "Fast";
        else results.status = "Standard";

    } catch (e) {
        results.status = "Offline/Unstable";
    }

    return results;
};

// --- 4. Service Worker Housekeeping ---
export const cleanServiceWorkers = async () => {
    let removed = 0;
    if ('serviceWorker' in navigator) {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                // If scope is not current origin or creates redundancy, unregister
                // For this safer implementation, we'll just report them or unregister if explicitly 'waiting'
                if (registration.waiting) {
                    await registration.unregister();
                    removed++;
                }
            }
        } catch (e) {
            console.warn("SW Cleanup failed", e);
        }
    }
    return removed;
};


// --- ORCHESTRATOR: The Main Optimizer Function ---
export const runRealOptimization = async () => {
    console.log("🧠 Yolofi Brain: Starting Optimization Sequence...");

    // 1. Storage Cleanup and Real Analysis
    const [storageScan, storageEstimate] = await Promise.all([
        Promise.resolve(classifyStorage()), // Sync ref wrapper
        getStorageEstimate()
    ]);

    let freedBytes = 0;
    // Clean LocalStorage Trash
    storageScan.trash.forEach(key => {
        try {
            const val = localStorage.getItem(key) || "";
            freedBytes += (key.length + val.length);
            localStorage.removeItem(key);
        } catch (e) { }
    });

    // 2. Service Worker Cleanup
    const workersRemoved = await cleanServiceWorkers();

    // 3. Network Warmup
    const networkStat = await warmNetwork();

    // 4. Memory Re-check
    const finalMemory = getMemoryStatus();

    // 5. Deterministic Score Calculation
    // Base: 10
    // +5 if any bytes freed
    // +2 per worker removed (capped at 10)
    // +5 if Network is Fast or Lightning
    // +5 if Memory is Smooth
    let scoreBoost = 10;
    if (freedBytes > 0) scoreBoost += 5;
    scoreBoost += Math.min(workersRemoved * 2, 10);
    if (networkStat.status.includes("Fast")) scoreBoost += 5;
    if (finalMemory.status === "Smooth") scoreBoost += 5;


    // Return the "Actions Taken" Report
    return {
        actions: {
            storage: {
                // Return REAL usage estimate as 'scanned' to show scope
                // Fallback to totalSize if estimate is 0 (unlikely in modern browsers)
                scanned: storageEstimate.usage > 0 ? storageEstimate.usage : storageScan.totalSize,
                cleaned: freedBytes,
                filesRemoved: storageScan.trash.length,
                keptSafe: storageScan.safe.length + storageScan.critical.length,
                counts: {
                    critical: storageScan.critical.length,
                    useful: storageScan.safe.length,
                    trash: storageScan.trash.length
                },
                quota: storageEstimate.quota
            },
            network: {
                latency: networkStat.latency,
                status: networkStat.status,
                boosted: true
            },
            workers: {
                removed: workersRemoved
            },
            memory: {
                status: finalMemory.status,
                percent: finalMemory.percent
            }
        },
        scoreImprovement: scoreBoost
    };
};
