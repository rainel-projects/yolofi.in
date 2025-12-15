/**
 * WEG (Web Execution Gate Legal) - browser-ow8
 * Runtime verification layer that enforces legal compliance before code execution
 * Makes compliance inevitable by intercepting all web execution
 */

class WebExecutionGate {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
        this.violations = [];
        this.auditLog = [];
        this.policies = null;
        this.stats = {
            totalChecks: 0,
            blocked: 0,
            allowed: 0,
            violations: 0
        };

        console.log('[WEG] Initializing Web Execution Gate Legal v' + this.version);
    }

    /**
     * Initialize WEG and hook into browser execution pipeline
     */
    async init(customPolicies = null) {
        if (this.initialized) {
            console.warn('[WEG] Already initialized');
            return;
        }

        // Load compliance policies
        this.policies = customPolicies || await this.loadDefaultPolicies();

        // Hook into execution points
        this.hookExecutionPoints();

        // Start audit logger
        this.startAuditLogger();

        this.initialized = true;
        this.log('WEG initialized successfully', 'info');

        return this;
    }

    /**
     * Load default compliance policies
     */
    async loadDefaultPolicies() {
        return {
            gdpr: {
                enabled: true,
                requireCookieConsent: true,
                requireDataProcessingConsent: true,
                blockThirdPartyTracking: true
            },
            ccpa: {
                enabled: true,
                requireOptOut: true,
                blockDataSale: true
            },
            accessibility: {
                enabled: true,
                enforceWCAG: 'AA',
                requireAria: true,
                minContrast: 4.5
            },
            security: {
                enabled: true,
                enforceCSP: true,
                blockInlineScripts: false, // Would break most sites
                requireSecureContext: false
            }
        };
    }

    /**
     * Hook into browser execution points
     */
    hookExecutionPoints() {
        // Store original functions
        const originalEval = window.eval;
        const originalFunction = window.Function;
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;

        const self = this;

        // Hook eval()
        window.eval = function (code) {
            const verification = self.verifyExecution('eval', code);
            if (!verification.allowed) {
                self.handleViolation(verification);
                throw new Error('[WEG] Execution blocked: ' + verification.reason);
            }
            return originalEval.call(this, code);
        };

        // Hook Function constructor
        window.Function = function (...args) {
            const code = args[args.length - 1];
            const verification = self.verifyExecution('Function', code);
            if (!verification.allowed) {
                self.handleViolation(verification);
                throw new Error('[WEG] Execution blocked: ' + verification.reason);
            }
            return originalFunction.apply(this, args);
        };

        // Hook setTimeout/setInterval for dynamic code
        window.setTimeout = function (fn, delay, ...args) {
            if (typeof fn === 'string') {
                const verification = self.verifyExecution('setTimeout', fn);
                if (!verification.allowed) {
                    self.handleViolation(verification);
                    throw new Error('[WEG] Execution blocked: ' + verification.reason);
                }
            }
            return originalSetTimeout.call(this, fn, delay, ...args);
        };

        window.setInterval = function (fn, delay, ...args) {
            if (typeof fn === 'string') {
                const verification = self.verifyExecution('setInterval', fn);
                if (!verification.allowed) {
                    self.handleViolation(verification);
                    throw new Error('[WEG] Execution blocked: ' + verification.reason);
                }
            }
            return originalSetInterval.call(this, fn, delay, ...args);
        };

        // Hook script element creation
        const originalCreateElement = document.createElement.bind(document);
        document.createElement = function (tagName, options) {
            const element = originalCreateElement(tagName, options);

            if (tagName.toLowerCase() === 'script') {
                const originalSetAttribute = element.setAttribute.bind(element);
                element.setAttribute = function (name, value) {
                    if (name === 'src') {
                        const verification = self.verifyExecution('script-src', value);
                        if (!verification.allowed) {
                            self.handleViolation(verification);
                            throw new Error('[WEG] Script blocked: ' + verification.reason);
                        }
                    }
                    return originalSetAttribute(name, value);
                };
            }

            return element;
        };

        this.log('Execution hooks installed', 'info');
    }

    /**
     * Verify if execution should be allowed
     */
    verifyExecution(context, code) {
        this.stats.totalChecks++;

        const startTime = performance.now();
        const violations = [];

        // Check GDPR compliance
        if (this.policies.gdpr.enabled) {
            if (this.policies.gdpr.blockThirdPartyTracking && this.isTrackingCode(code)) {
                violations.push({
                    policy: 'GDPR',
                    rule: 'Third-party tracking blocked',
                    severity: 'high'
                });
            }
        }

        // Check Security policies
        if (this.policies.security.enabled) {
            if (this.policies.security.enforceCSP && this.violatesCSP(code)) {
                violations.push({
                    policy: 'Security',
                    rule: 'CSP violation detected',
                    severity: 'critical'
                });
            }

            // CYBERSECURITY: XSS Detection
            if (this.detectXSS(code)) {
                violations.push({
                    policy: 'Cybersecurity',
                    rule: 'XSS attack attempt detected',
                    severity: 'critical'
                });
            }

            // CYBERSECURITY: SQL Injection Detection
            if (this.detectSQLInjection(code)) {
                violations.push({
                    policy: 'Cybersecurity',
                    rule: 'SQL injection attempt detected',
                    severity: 'critical'
                });
            }

            // CYBERSECURITY: Command Injection Detection
            if (this.detectCommandInjection(code)) {
                violations.push({
                    policy: 'Cybersecurity',
                    rule: 'Command injection attempt detected',
                    severity: 'critical'
                });
            }

            // CYBERSECURITY: CSRF Detection
            if (this.detectCSRF(code)) {
                violations.push({
                    policy: 'Cybersecurity',
                    rule: 'CSRF vulnerability detected',
                    severity: 'high'
                });
            }

            // CYBERSECURITY: Cryptojacking Detection
            if (this.detectCryptojacking(code)) {
                violations.push({
                    policy: 'Cybersecurity',
                    rule: 'Cryptojacking attempt detected',
                    severity: 'critical'
                });
            }

            // CYBERSECURITY: Endpoint Security (for URLs)
            if (context === 'script-src') {
                const endpointCheck = this.validateEndpointSecurity(code);
                if (!endpointCheck.secure) {
                    violations.push({
                        policy: 'Cybersecurity',
                        rule: endpointCheck.reason,
                        severity: 'critical'
                    });
                }
            }
        }

        const executionTime = performance.now() - startTime;

        const result = {
            allowed: violations.length === 0,
            context,
            code: code.substring(0, 100), // First 100 chars for logging
            violations,
            executionTime,
            timestamp: Date.now()
        };

        if (result.allowed) {
            this.stats.allowed++;
        } else {
            this.stats.blocked++;
            this.stats.violations += violations.length;

            // Update billing for blocked execution
            if (window.WEGBilling) {
                window.WEGBilling.trackVerification(true);
            }
        }

        // Log to audit trail
        this.auditLog.push(result);

        return result;
    }

    /**
     * Detect tracking code patterns
     */
    isTrackingCode(code) {
        const trackingPatterns = [
            /google-analytics\.com/i,
            /googletagmanager\.com/i,
            /facebook\.com.*\/pixel/i,
            /doubleclick\.net/i,
            /analytics\.js/i,
            /ga\(['"]create/i,
            /_gaq\.push/i
        ];

        return trackingPatterns.some(pattern => pattern.test(code));
    }

    /**
     * Check for CSP violations
     */
    violatesCSP(code) {
        // Check for inline event handlers
        const inlineEventPattern = /on(click|load|error|mouseover|mouseout|keydown|keyup|submit)\s*=/i;

        // Check for dangerous functions
        const dangerousFunctions = /(document\.write|innerHTML\s*=|outerHTML\s*=)/i;

        return inlineEventPattern.test(code) || dangerousFunctions.test(code);
    }

    /**
     * CYBERSECURITY: Detect XSS (Cross-Site Scripting) attempts
     */
    detectXSS(code) {
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /onerror\s*=/gi,
            /onload\s*=/gi,
            /<iframe[^>]*>/gi,
            /eval\s*\(/gi,
            /expression\s*\(/gi,
            /vbscript:/gi,
            /data:text\/html/gi
        ];

        return xssPatterns.some(pattern => pattern.test(code));
    }

    /**
     * CYBERSECURITY: Detect SQL injection attempts
     */
    detectSQLInjection(code) {
        const sqlPatterns = [
            /(\bunion\b.*\bselect\b)|(\bselect\b.*\bunion\b)/gi,
            /\b(drop|delete|insert|update)\b.*\b(table|database|from)\b/gi,
            /('|")\s*(or|and)\s*('|")\s*=\s*('|")/gi,
            /;\s*(drop|delete|insert|update)/gi,
            /--\s*$/gm,
            /\/\*.*\*\//g
        ];

        return sqlPatterns.some(pattern => pattern.test(code));
    }

    /**
     * CYBERSECURITY: Detect command injection attempts
     */
    detectCommandInjection(code) {
        const cmdPatterns = [
            /[;&|`$()]/g,
            /\bexec\b/gi,
            /\bsystem\b/gi,
            /\bshell_exec\b/gi,
            /\bpassthru\b/gi,
            /\bpopen\b/gi
        ];

        return cmdPatterns.some(pattern => pattern.test(code));
    }

    /**
     * CYBERSECURITY: Detect CSRF (Cross-Site Request Forgery) vulnerabilities
     */
    detectCSRF(code) {
        // Check for form submissions without CSRF tokens
        const hasFormSubmit = /\.submit\(\)|form\.submit/gi.test(code);
        const hasCsrfToken = /csrf|_token|authenticity_token/gi.test(code);

        return hasFormSubmit && !hasCsrfToken;
    }

    /**
     * CYBERSECURITY: Validate endpoint security
     */
    validateEndpointSecurity(url) {
        // Check for HTTPS
        if (!url.startsWith('https://') && !url.startsWith('/')) {
            return {
                secure: false,
                reason: 'Non-HTTPS endpoint detected'
            };
        }

        // Check for known malicious domains
        const maliciousDomains = [
            'malware.com',
            'phishing.net',
            'suspicious.org'
        ];

        if (maliciousDomains.some(domain => url.includes(domain))) {
            return {
                secure: false,
                reason: 'Known malicious domain'
            };
        }

        // Check for data exfiltration patterns
        const dataExfilPatterns = [
            /data:.*base64/gi,
            /blob:/gi
        ];

        if (dataExfilPatterns.some(pattern => pattern.test(url))) {
            return {
                secure: false,
                reason: 'Potential data exfiltration detected'
            };
        }

        return { secure: true };
    }

    /**
     * CYBERSECURITY: Detect cryptojacking attempts
     */
    detectCryptojacking(code) {
        const cryptoPatterns = [
            /coinhive/gi,
            /crypto-loot/gi,
            /webminer/gi,
            /minero/gi,
            /cryptonight/gi
        ];

        return cryptoPatterns.some(pattern => pattern.test(code));
    }

    /**
     * Handle compliance violations
     */
    handleViolation(verification) {
        this.violations.push({
            ...verification,
            timestamp: new Date().toISOString()
        });

        // Emit violation event
        window.dispatchEvent(new CustomEvent('weg:violation', {
            detail: verification
        }));

        this.log(`Violation detected: ${verification.violations.map(v => v.rule).join(', ')}`, 'error');
    }

    /**
     * Start audit logger
     */
    startAuditLogger() {
        // Periodically save audit log to localStorage
        setInterval(() => {
            try {
                const logData = {
                    stats: this.stats,
                    recentViolations: this.violations.slice(-10),
                    timestamp: Date.now()
                };
                localStorage.setItem('weg_audit_log', JSON.stringify(logData));
            } catch (e) {
                console.warn('[WEG] Failed to save audit log', e);
            }
        }, 5000);
    }

    /**
     * Get current statistics
     */
    getStats() {
        return {
            ...this.stats,
            avgCheckTime: this.auditLog.length > 0
                ? this.auditLog.reduce((sum, log) => sum + log.executionTime, 0) / this.auditLog.length
                : 0,
            recentViolations: this.violations.slice(-5)
        };
    }

    /**
     * Get full audit log
     */
    getAuditLog() {
        return {
            total: this.auditLog.length,
            logs: this.auditLog.slice(-50), // Last 50 entries
            violations: this.violations
        };
    }

    /**
     * Configure policies
     */
    configure(newPolicies) {
        this.policies = { ...this.policies, ...newPolicies };
        this.log('Policies updated', 'info');
    }

    /**
     * Internal logging
     */
    log(message, level = 'info') {
        const prefix = '[WEG]';
        const timestamp = new Date().toISOString();

        switch (level) {
            case 'error':
                console.error(prefix, timestamp, message);
                break;
            case 'warn':
                console.warn(prefix, timestamp, message);
                break;
            default:
                console.log(prefix, timestamp, message);
        }
    }

    /**
     * Scan current page for compliance issues
     */
    async scanPage() {
        // Track scan for billing
        if (window.WEGBilling) {
            window.WEGBilling.trackScan();
        }

        const issues = [];

        // Check cookies
        if (this.policies.gdpr.enabled && this.policies.gdpr.requireCookieConsent) {
            const cookies = document.cookie.split(';');
            if (cookies.length > 0 && cookies[0] !== '') {
                const hasConsent = localStorage.getItem('cookie_consent');
                if (!hasConsent) {
                    issues.push({
                        type: 'GDPR',
                        severity: 'high',
                        message: 'Cookies set without user consent',
                        count: cookies.length
                    });
                }
            }
        }

        // Check accessibility
        if (this.policies.accessibility.enabled) {
            const images = document.querySelectorAll('img:not([alt])');
            if (images.length > 0) {
                issues.push({
                    type: 'Accessibility',
                    severity: 'medium',
                    message: 'Images missing alt text',
                    count: images.length
                });
            }

            const buttons = document.querySelectorAll('button:not([aria-label]):not(:has(> *))');
            if (buttons.length > 0) {
                issues.push({
                    type: 'Accessibility',
                    severity: 'medium',
                    message: 'Buttons missing accessible labels',
                    count: buttons.length
                });
            }
        }

        // Check for third-party scripts
        const scripts = document.querySelectorAll('script[src]');
        const thirdPartyScripts = Array.from(scripts).filter(script => {
            const src = script.getAttribute('src');
            return src && !src.startsWith(window.location.origin) && !src.startsWith('/');
        });

        if (thirdPartyScripts.length > 0) {
            issues.push({
                type: 'Privacy',
                severity: 'medium',
                message: 'Third-party scripts detected',
                count: thirdPartyScripts.length,
                scripts: thirdPartyScripts.slice(0, 5).map(s => s.src)
            });
        }

        return {
            totalIssues: issues.length,
            issues,
            timestamp: Date.now()
        };
    }
}

// Create global instance
window.WEG = new WebExecutionGate();

// Auto-initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.WEG.init();
    });
} else {
    window.WEG.init();
}

export default WebExecutionGate;
