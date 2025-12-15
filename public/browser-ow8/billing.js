/**
 * WEG Billing Engine
 * Zero-friction opt-in with automatic usage-based billing
 * Tracks verifications and generates invoices automatically
 */

class WEGBilling {
    constructor() {
        this.apiKey = null;
        this.accountId = null;
        this.tier = 'free'; // free, pro, enterprise
        this.usage = {
            verifications: 0,
            blocked: 0,
            scans: 0,
            lastReset: Date.now()
        };
        this.limits = {
            free: 10000,      // 10K verifications/month
            pro: 1000000,     // 1M verifications/month
            enterprise: -1    // Unlimited
        };
        this.pricing = {
            free: 0,
            pro: 49,          // $49/month
            enterprise: 499   // $499/month
        };
        this.overage = 0.001; // $0.001 per verification over limit

        this.loadUsage();
    }

    /**
     * Zero-friction opt-in
     * User starts with free tier, auto-upgrades when needed
     */
    async optIn(email = null) {
        // Check if already opted in
        const existing = localStorage.getItem('weg_account');
        if (existing) {
            const account = JSON.parse(existing);
            this.accountId = account.id;
            this.tier = account.tier;
            this.apiKey = account.apiKey;
            return { success: true, accountId: this.accountId, tier: this.tier };
        }

        // Create new account - zero friction, no payment required
        this.accountId = this.generateAccountId();
        this.tier = 'free';
        this.apiKey = this.generateApiKey();

        const account = {
            id: this.accountId,
            tier: this.tier,
            apiKey: this.apiKey,
            email: email,
            createdAt: Date.now(),
            billingEnabled: false
        };

        localStorage.setItem('weg_account', JSON.stringify(account));

        console.log('[WEG Billing] Account created:', this.accountId, '- Free tier');

        return {
            success: true,
            accountId: this.accountId,
            tier: this.tier,
            message: 'Started with free tier - 10,000 verifications/month'
        };
    }

    /**
     * Track verification usage
     */
    trackVerification(blocked = false) {
        this.usage.verifications++;
        if (blocked) this.usage.blocked++;

        // Check if approaching limit
        const limit = this.limits[this.tier];
        if (limit > 0 && this.usage.verifications >= limit * 0.8) {
            this.notifyApproachingLimit();
        }

        // Auto-upgrade if over limit and billing enabled
        if (limit > 0 && this.usage.verifications > limit) {
            this.handleOverage();
        }

        this.saveUsage();
    }

    /**
     * Track page scan usage
     */
    trackScan() {
        this.usage.scans++;
        this.saveUsage();
    }

    /**
     * Handle usage overage
     */
    handleOverage() {
        const account = JSON.parse(localStorage.getItem('weg_account'));

        if (!account.billingEnabled) {
            // Show upgrade prompt
            this.showUpgradePrompt();
        } else {
            // Calculate overage charges
            const limit = this.limits[this.tier];
            const overage = this.usage.verifications - limit;
            const overageCharge = overage * this.overage;

            console.log(`[WEG Billing] Overage: ${overage} verifications = $${overageCharge.toFixed(2)}`);

            // Queue for next invoice
            this.queueOverageCharge(overageCharge);
        }
    }

    /**
     * Notify user approaching limit
     */
    notifyApproachingLimit() {
        const limit = this.limits[this.tier];
        const percentage = Math.round((this.usage.verifications / limit) * 100);

        // Only notify at 80%, 90%, 95%, 100%
        const milestones = [80, 90, 95, 100];
        const milestone = milestones.find(m => percentage >= m && percentage < m + 5);

        if (milestone) {
            window.dispatchEvent(new CustomEvent('weg:usage-alert', {
                detail: {
                    tier: this.tier,
                    usage: this.usage.verifications,
                    limit: limit,
                    percentage: percentage
                }
            }));
        }
    }

    /**
     * Show upgrade prompt
     */
    showUpgradePrompt() {
        window.dispatchEvent(new CustomEvent('weg:upgrade-required', {
            detail: {
                currentTier: this.tier,
                usage: this.usage.verifications,
                limit: this.limits[this.tier]
            }
        }));
    }

    /**
     * Enable billing (upgrade to paid tier)
     */
    async enableBilling(tier = 'pro', paymentMethod = null) {
        if (tier === 'free') {
            return { success: false, error: 'Cannot enable billing on free tier' };
        }

        const account = JSON.parse(localStorage.getItem('weg_account'));
        account.tier = tier;
        account.billingEnabled = true;
        account.paymentMethod = paymentMethod;
        account.billingStartDate = Date.now();

        this.tier = tier;
        localStorage.setItem('weg_account', JSON.stringify(account));

        console.log(`[WEG Billing] Upgraded to ${tier} tier - $${this.pricing[tier]}/month`);

        return {
            success: true,
            tier: tier,
            price: this.pricing[tier],
            limit: this.limits[tier]
        };
    }

    /**
     * Get current usage stats
     */
    getUsage() {
        const limit = this.limits[this.tier];
        const percentage = limit > 0 ? (this.usage.verifications / limit) * 100 : 0;
        const remaining = limit > 0 ? Math.max(0, limit - this.usage.verifications) : -1;

        return {
            tier: this.tier,
            verifications: this.usage.verifications,
            blocked: this.usage.blocked,
            scans: this.usage.scans,
            limit: limit,
            remaining: remaining,
            percentage: percentage,
            monthlyPrice: this.pricing[this.tier],
            billingCycle: this.getBillingCycle()
        };
    }

    /**
     * Get billing cycle info
     */
    getBillingCycle() {
        const now = Date.now();
        const monthStart = new Date(now);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        monthEnd.setHours(23, 59, 59, 999);

        return {
            start: monthStart.getTime(),
            end: monthEnd.getTime(),
            daysRemaining: Math.ceil((monthEnd.getTime() - now) / (1000 * 60 * 60 * 24))
        };
    }

    /**
     * Calculate current month's bill
     */
    calculateBill() {
        const baseCost = this.pricing[this.tier];
        const limit = this.limits[this.tier];

        let overageCost = 0;
        if (limit > 0 && this.usage.verifications > limit) {
            const overage = this.usage.verifications - limit;
            overageCost = overage * this.overage;
        }

        return {
            base: baseCost,
            overage: overageCost,
            total: baseCost + overageCost,
            verifications: this.usage.verifications,
            limit: limit
        };
    }

    /**
     * Queue overage charge for next invoice
     */
    queueOverageCharge(amount) {
        const charges = JSON.parse(localStorage.getItem('weg_pending_charges') || '[]');
        charges.push({
            type: 'overage',
            amount: amount,
            timestamp: Date.now()
        });
        localStorage.setItem('weg_pending_charges', JSON.stringify(charges));
    }

    /**
     * Save usage to localStorage
     */
    saveUsage() {
        localStorage.setItem('weg_usage', JSON.stringify(this.usage));
    }

    /**
     * Load usage from localStorage
     */
    loadUsage() {
        const saved = localStorage.getItem('weg_usage');
        if (saved) {
            this.usage = JSON.parse(saved);

            // Reset if new month
            const lastReset = new Date(this.usage.lastReset);
            const now = new Date();
            if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
                this.resetMonthlyUsage();
            }
        }
    }

    /**
     * Reset monthly usage
     */
    resetMonthlyUsage() {
        console.log('[WEG Billing] Resetting monthly usage');
        this.usage = {
            verifications: 0,
            blocked: 0,
            scans: 0,
            lastReset: Date.now()
        };
        this.saveUsage();
    }

    /**
     * Generate account ID
     */
    generateAccountId() {
        return 'weg_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    /**
     * Generate API key
     */
    generateApiKey() {
        return 'sk_' + Math.random().toString(36).substr(2, 32);
    }
}

// Create global billing instance
window.WEGBilling = new WEGBilling();

// Auto opt-in on first use
window.WEGBilling.optIn();

export default WEGBilling;
