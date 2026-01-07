"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripe = void 0;
exports.verifyWebhookSignature = verifyWebhookSignature;
exports.getOrCreateCustomer = getOrCreateCustomer;
exports.formatPrice = formatPrice;
exports.getSubscriptionStatusDisplay = getSubscriptionStatusDisplay;
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
/**
 * Stripe client instance
 * Initialized with secret key from environment
 */
exports.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover',
    typescript: true,
});
/**
 * Verify Stripe webhook signature
 */
function verifyWebhookSignature(payload, signature) {
    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('STRIPE_WEBHOOK_SECRET not configured');
            return null;
        }
        const event = exports.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        return event;
    }
    catch (error) {
        console.error('Webhook signature verification failed:', error);
        return null;
    }
}
/**
 * Create or retrieve Stripe customer for tenant
 */
async function getOrCreateCustomer(tenantId, email, name, existingCustomerId) {
    // If customer ID exists, retrieve it
    if (existingCustomerId) {
        try {
            return await exports.stripe.customers.retrieve(existingCustomerId);
        }
        catch (error) {
            console.error('Failed to retrieve existing customer:', error);
            // Fall through to create new customer
        }
    }
    // Create new customer
    return await exports.stripe.customers.create({
        email,
        name,
        metadata: {
            tenant_id: tenantId,
        },
    });
}
/**
 * Format price from cents to dollar string
 */
function formatPrice(cents, currency = 'usd') {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amount);
}
/**
 * Get subscription status display
 */
function getSubscriptionStatusDisplay(status) {
    const statusMap = {
        active: { label: 'Active', color: '#10b981' },
        trialing: { label: 'Trial', color: '#3b82f6' },
        past_due: { label: 'Past Due', color: '#f59e0b' },
        canceled: { label: 'Canceled', color: '#6b7280' },
        incomplete: { label: 'Incomplete', color: '#ef4444' },
        incomplete_expired: { label: 'Expired', color: '#ef4444' },
        unpaid: { label: 'Unpaid', color: '#ef4444' },
    };
    return statusMap[status] || { label: status, color: '#6b7280' };
}
