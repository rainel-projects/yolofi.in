/**
 * PhonePe Payment Integration for WEG
 * Handles upgrade payments and monthly settlements
 */

class PhonePePayment {
    constructor() {
        this.merchantUPI = '9035333300-2@ybl';
        this.merchantName = 'Yolofi';
        this.currency = 'INR';
    }

    /**
     * Generate PhonePe payment link
     */
    generatePaymentLink(amount, orderId, description) {
        // PhonePe UPI deep link format
        const upiString = `upi://pay?pa=${this.merchantUPI}&pn=${encodeURIComponent(this.merchantName)}&am=${amount}&cu=${this.currency}&tn=${encodeURIComponent(description)}&tr=${orderId}`;

        return upiString;
    }

    /**
     * Initiate payment for tier upgrade
     */
    async initiateUpgrade(tier, billingCycle = 'monthly') {
        const pricing = {
            pro: { monthly: 49, yearly: 490 },
            enterprise: { monthly: 499, yearly: 4990 }
        };

        const amount = pricing[tier][billingCycle];
        const orderId = 'WEG_' + Date.now();
        const description = `WEG ${tier.toUpperCase()} - ${billingCycle} subscription`;

        // Generate payment link
        const paymentLink = this.generatePaymentLink(amount, orderId, description);

        // Store pending payment
        const payment = {
            orderId,
            tier,
            amount,
            billingCycle,
            status: 'pending',
            timestamp: Date.now(),
            paymentLink
        };

        localStorage.setItem('weg_pending_payment', JSON.stringify(payment));

        return payment;
    }

    /**
     * Initiate payment for overage charges
     */
    async initiateOveragePayment(overageAmount) {
        const orderId = 'WEG_OVERAGE_' + Date.now();
        const description = `WEG Overage Charges`;

        const paymentLink = this.generatePaymentLink(overageAmount, orderId, description);

        const payment = {
            orderId,
            type: 'overage',
            amount: overageAmount,
            status: 'pending',
            timestamp: Date.now(),
            paymentLink
        };

        localStorage.setItem('weg_pending_payment', JSON.stringify(payment));

        return payment;
    }

    /**
     * Open PhonePe payment
     */
    openPayment(paymentLink) {
        // Try to open PhonePe app
        window.location.href = paymentLink;

        // Fallback: Show QR code or manual UPI details
        setTimeout(() => {
            this.showPaymentFallback(paymentLink);
        }, 2000);
    }

    /**
     * Show payment fallback UI
     */
    showPaymentFallback(paymentLink) {
        const modal = document.createElement('div');
        modal.className = 'payment-modal';
        modal.innerHTML = `
            <div class="payment-modal-content">
                <div class="payment-modal-header">
                    <h3>Complete Payment</h3>
                    <button class="close-modal" onclick="this.closest('.payment-modal').remove()">×</button>
                </div>
                <div class="payment-modal-body">
                    <p>Pay using any UPI app:</p>
                    <div class="upi-details">
                        <div class="upi-field">
                            <label>UPI ID:</label>
                            <div class="upi-value">
                                <code>${this.merchantUPI}</code>
                                <button onclick="navigator.clipboard.writeText('${this.merchantUPI}')">Copy</button>
                            </div>
                        </div>
                        <div class="upi-field">
                            <label>Merchant:</label>
                            <div class="upi-value">${this.merchantName}</div>
                        </div>
                    </div>
                    <div class="payment-actions">
                        <button class="btn-primary" onclick="window.location.href='${paymentLink}'">
                            Open PhonePe
                        </button>
                        <button class="btn-secondary" onclick="this.closest('.payment-modal').remove()">
                            Cancel
                        </button>
                    </div>
                    <p class="payment-note">After payment, your account will be upgraded automatically.</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Verify payment (manual verification for now)
     */
    async verifyPayment(orderId) {
        // In production, this would call PhonePe API to verify
        // For now, we'll use manual confirmation
        const confirmed = confirm('Have you completed the payment?');

        if (confirmed) {
            const payment = JSON.parse(localStorage.getItem('weg_pending_payment') || '{}');
            if (payment.orderId === orderId) {
                payment.status = 'completed';
                payment.completedAt = Date.now();
                localStorage.setItem('weg_payment_history', JSON.stringify([
                    ...(JSON.parse(localStorage.getItem('weg_payment_history') || '[]')),
                    payment
                ]));
                localStorage.removeItem('weg_pending_payment');

                // Upgrade account if it's a tier upgrade
                if (payment.tier) {
                    const account = JSON.parse(localStorage.getItem('weg_account') || '{}');
                    account.tier = payment.tier;
                    account.billingEnabled = true;
                    account.billingCycle = payment.billingCycle;
                    account.lastPayment = payment.completedAt;
                    localStorage.setItem('weg_account', JSON.stringify(account));
                }

                return { success: true, payment };
            }
        }

        return { success: false, message: 'Payment not confirmed' };
    }

    /**
     * Get payment history
     */
    getPaymentHistory() {
        return JSON.parse(localStorage.getItem('weg_payment_history') || '[]');
    }
}

// Create global instance
window.PhonePePayment = new PhonePePayment();

export default PhonePePayment;
