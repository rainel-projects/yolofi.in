/**
 * WEG Dashboard Logic
 * Real-time compliance monitoring and interactive testing
 */

// Update dashboard stats
function updateDashboard() {
    if (!window.WEG || !window.WEG.initialized) {
        setTimeout(updateDashboard, 100);
        return;
    }

    const stats = window.WEG.getStats();

    // Update hero stats
    document.getElementById('total-checks').textContent = stats.totalChecks.toLocaleString();
    document.getElementById('violations-blocked').textContent = stats.blocked.toLocaleString();
    document.getElementById('avg-time').textContent = stats.avgCheckTime.toFixed(2) + 'ms';

    // Update dashboard metrics
    document.getElementById('dash-checks').textContent = stats.totalChecks;
    document.getElementById('dash-allowed').textContent = stats.allowed;
    document.getElementById('dash-blocked').textContent = stats.blocked;
    document.getElementById('dash-perf').textContent = stats.avgCheckTime.toFixed(2) + 'ms';

    // Update violations list
    updateViolationsList(stats.recentViolations);
}

// Update violations list
function updateViolationsList(violations) {
    const container = document.getElementById('violations-list');

    if (!violations || violations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
                <p>No violations detected</p>
            </div>
        `;
        return;
    }

    container.innerHTML = violations.map(v => {
        const time = new Date(v.timestamp).toLocaleTimeString();
        const violationList = v.violations.map(viol => viol.rule).join(', ');

        return `
            <div class="violation-item">
                <div class="violation-header">
                    <span class="violation-time">${time}</span>
                    <span class="violation-context">${v.context}</span>
                </div>
                <div class="violation-message">${violationList}</div>
            </div>
        `;
    }).join('');
}

// Scan page for compliance issues
async function scanPage() {
    const btn = document.getElementById('scan-btn');
    const container = document.getElementById('scan-results');

    if (!window.WEG || !window.WEG.scanPage) {
        container.innerHTML = `
            <div class="scan-placeholder">
                <p style="color: #ef4444;">WEG not fully initialized. Please wait...</p>
            </div>
        `;
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Scanning...';

    container.innerHTML = `
        <div class="scan-placeholder">
            <div class="spinner"></div>
            <p>Scanning page for compliance issues...</p>
        </div>
    `;

    try {
        const results = await window.WEG.scanPage();

        if (results.totalIssues === 0) {
            container.innerHTML = `
                <div class="scan-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                    </svg>
                    <p style="color: #10b981; font-weight: 600;">✓ No compliance issues found</p>
                </div>
            `;
        } else {
            const issuesHTML = results.issues.map(issue => {
                const severityClass = issue.severity === 'high' ? '' : 'warning';
                return `
                    <div class="scan-issue ${severityClass}">
                        <div class="scan-issue-header">
                            <span class="scan-issue-type">${issue.type}</span>
                            <span class="scan-issue-count">${issue.count}</span>
                        </div>
                        <div class="scan-issue-message">${issue.message}</div>
                        ${issue.scripts ? `<div class="scan-issue-details">${issue.scripts.join(', ')}</div>` : ''}
                    </div>
                `;
            }).join('');

            container.innerHTML = `<div class="scan-results-list">${issuesHTML}</div>`;
        }
    } catch (error) {
        container.innerHTML = `
            <div class="scan-placeholder">
                <p style="color: #ef4444;">Scan failed: ${error.message}</p>
            </div>
        `;
    }

    btn.disabled = false;
    btn.textContent = 'Scan Now';
}

// Test functions
function testTracking() {
    const output = document.getElementById('test-output');
    output.innerHTML = '';

    if (!window.WEG || !window.WEG.initialized) {
        logTest('❌ FAILED: WEG not initialized yet', 'error');
        return;
    }

    try {
        // This should be blocked by GDPR policy
        eval('ga("create", "UA-XXXXX-Y", "auto");');
        logTest('❌ FAILED: Tracking code was not blocked', 'error');
    } catch (e) {
        logTest('✓ SUCCESS: Tracking code blocked by WEG', 'success');
        logTest('Reason: ' + e.message, 'info');
    }

    updateDashboard();
}

function testInlineScript() {
    const output = document.getElementById('test-output');
    output.innerHTML = '';

    if (!window.WEG || !window.WEG.initialized) {
        logTest('❌ FAILED: WEG not initialized yet', 'error');
        return;
    }

    try {
        // This should be blocked by CSP policy
        eval('document.write("<script>alert(1)</script>");');
        logTest('❌ FAILED: Inline script was not blocked', 'error');
    } catch (e) {
        logTest('✓ SUCCESS: Inline script blocked by WEG', 'success');
        logTest('Reason: ' + e.message, 'info');
    }

    updateDashboard();
}

function testDynamicEval() {
    const output = document.getElementById('test-output');
    output.innerHTML = '';

    if (!window.WEG || !window.WEG.initialized) {
        logTest('❌ FAILED: WEG not initialized yet', 'error');
        return;
    }

    try {
        // This should be allowed (no violations)
        const result = eval('2 + 2');
        logTest('✓ SUCCESS: Safe code executed', 'success');
        logTest('Result: ' + result, 'info');
        logTest('Verification time: ' + window.WEG.getStats().avgCheckTime.toFixed(2) + 'ms', 'info');
    } catch (e) {
        logTest('❌ FAILED: Safe code was blocked', 'error');
        logTest('Reason: ' + e.message, 'info');
    }

    updateDashboard();
}

function logTest(message, type = 'info') {
    const output = document.getElementById('test-output');
    const color = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6b7280';
    const line = document.createElement('div');
    line.style.color = color;
    line.textContent = '> ' + message;
    output.appendChild(line);
}

// Copy integration code
function copyCode() {
    const code = document.getElementById('integration-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// Listen for WEG violations
window.addEventListener('weg:violation', (event) => {
    console.log('[WEG Dashboard] Violation detected:', event.detail);
    updateDashboard();
});

// Initialize dashboard
function initializeDashboard() {
    // Attach scan button
    document.getElementById('scan-btn').addEventListener('click', scanPage);

    // Attach upgrade button
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', handleUpgrade);
    }

    // Update dashboard every 2 seconds
    setInterval(updateDashboard, 2000);

    // Initial update
    updateDashboard();

    console.log('[WEG Dashboard] Initialized after WEG');
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.WEG && window.WEG.initialized) {
        initializeDashboard();
    } else {
        window.addEventListener('weg:initialized', initializeDashboard, { once: true });
    }
});

// Handle upgrade button click
async function handleUpgrade() {
    // Create coming soon dialog
    const dialog = document.createElement('div');
    dialog.className = 'payment-dialog-overlay';
    dialog.innerHTML = `
        <div class="payment-dialog">
            <div class="payment-dialog-header">
                <h3>Payment Integration Coming Soon</h3>
            </div>
            <div class="payment-dialog-body">
                <div style="text-align: center; padding: 20px 0;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0066FF" stroke-width="2" style="margin-bottom: 16px;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <p style="font-size: 16px; color: #1a1a1a; margin-bottom: 12px; font-weight: 500;">
                        Payment integration is currently under development
                    </p>
                    <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                        We're working on implementing secure payment processing. Please check back soon for updates.
                    </p>
                </div>
            </div>
            <div class="payment-dialog-actions">
                <button class="btn-dialog btn-confirm" onclick="this.closest('.payment-dialog-overlay').remove()" style="width: 100%;">Got it</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);
}

// Add CSS for spinner
const style = document.createElement('style');
style.textContent = `
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e5e7eb;
        border-top-color: #8ab4df;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .violation-item {
        padding: 12px;
        background: rgba(239, 68, 68, 0.05);
        border-left: 3px solid #ef4444;
        border-radius: 8px;
        margin-bottom: 8px;
    }
    
    .violation-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
    }
    
    .violation-time {
        font-size: 12px;
        color: #6b7280;
    }
    
    .violation-context {
        font-size: 12px;
        font-weight: 600;
        color: #ef4444;
    }
    
    .violation-message {
        font-size: 13px;
        color: #1a1a1a;
    }
    
    .scan-issue-details {
        margin-top: 8px;
        font-size: 11px;
        color: #6b7280;
        font-family: 'Courier New', monospace;
    }
`;
document.head.appendChild(style);
