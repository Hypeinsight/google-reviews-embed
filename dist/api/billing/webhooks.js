"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = handleWebhook;
const db_1 = require("../db");
const stripe_1 = require("./stripe");
/**
 * POST /api/billing/webhook
 * Handle Stripe webhook events
 *
 * This endpoint should be called by Stripe webhooks
 * Important: Must use raw body, not JSON parsed body
 */
async function handleWebhook(req, res) {
    try {
        const signature = req.headers['stripe-signature'];
        if (!signature || typeof signature !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Missing stripe-signature header',
            });
            return;
        }
        // Verify webhook signature
        const event = (0, stripe_1.verifyWebhookSignature)(req.body, signature);
        if (!event) {
            res.status(400).json({
                success: false,
                error: 'Invalid signature',
            });
            return;
        }
        console.log(`Webhook received: ${event.type}`);
        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object);
                break;
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            error: 'Webhook processing failed',
        });
    }
}
/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session) {
    console.log('Checkout completed:', session.id);
    const tenantId = session.metadata?.tenant_id;
    if (!tenantId) {
        console.error('No tenant_id in session metadata');
        return;
    }
    // Subscription will be handled by subscription.created event
    // Just log here
    console.log(`Checkout completed for tenant ${tenantId}`);
}
/**
 * Handle subscription created/updated
 */
async function handleSubscriptionUpdated(subscription) {
    console.log('Subscription updated:', subscription.id);
    const customerId = subscription.customer;
    const tenantId = subscription.metadata?.tenant_id;
    // Get tenant ID from customer if not in metadata
    let finalTenantId = tenantId;
    if (!finalTenantId) {
        const tenantResult = await (0, db_1.query)('SELECT id FROM tenants WHERE stripe_customer_id = $1', [customerId]);
        if (tenantResult.rows.length > 0) {
            finalTenantId = tenantResult.rows[0].id;
        }
    }
    if (!finalTenantId) {
        console.error('Could not find tenant for subscription:', subscription.id);
        return;
    }
    // Get price ID to determine plan tier
    const priceId = subscription.items.data[0]?.price.id;
    const tierResult = await (0, db_1.query)('SELECT id FROM pricing_tiers WHERE stripe_price_id = $1', [priceId]);
    if (tierResult.rows.length === 0) {
        console.error('No pricing tier found for price:', priceId);
        return;
    }
    const planTier = tierResult.rows[0].id;
    // Check if subscription exists
    const existingResult = await (0, db_1.query)('SELECT id FROM subscriptions WHERE stripe_subscription_id = $1', [subscription.id]);
    if (existingResult.rows.length > 0) {
        // Update existing
        await (0, db_1.query)(`UPDATE subscriptions SET
        status = $1,
        plan_tier = $2,
        current_period_start = $3,
        current_period_end = $4,
        cancel_at_period_end = $5,
        canceled_at = $6,
        updated_at = NOW()
      WHERE stripe_subscription_id = $7`, [
            subscription.status,
            planTier,
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
            subscription.cancel_at_period_end,
            subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
            subscription.id,
        ]);
    }
    else {
        // Create new
        await (0, db_1.query)(`INSERT INTO subscriptions (
        tenant_id,
        stripe_subscription_id,
        stripe_customer_id,
        plan_tier,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
            finalTenantId,
            subscription.id,
            customerId,
            planTier,
            subscription.status,
            new Date(subscription.current_period_start * 1000),
            new Date(subscription.current_period_end * 1000),
            subscription.cancel_at_period_end,
        ]);
    }
    // Update tenant subscription status
    await (0, db_1.query)('UPDATE tenants SET subscription_status = $1, stripe_customer_id = $2 WHERE id = $3', [subscription.status, customerId, finalTenantId]);
    console.log(`Subscription ${subscription.id} synced for tenant ${finalTenantId}`);
}
/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription) {
    console.log('Subscription deleted:', subscription.id);
    // Update subscription status
    await (0, db_1.query)(`UPDATE subscriptions SET
      status = $1,
      canceled_at = NOW(),
      updated_at = NOW()
    WHERE stripe_subscription_id = $2`, ['canceled', subscription.id]);
    // Update tenant status
    const tenantResult = await (0, db_1.query)('SELECT tenant_id FROM subscriptions WHERE stripe_subscription_id = $1', [subscription.id]);
    if (tenantResult.rows.length > 0) {
        const tenantId = tenantResult.rows[0].tenant_id;
        await (0, db_1.query)('UPDATE tenants SET subscription_status = $1 WHERE id = $2', ['canceled', tenantId]);
        console.log(`Tenant ${tenantId} subscription marked as canceled`);
    }
}
/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(invoice) {
    console.log('Invoice payment succeeded:', invoice.id);
    const customerId = invoice.customer;
    // Get tenant ID
    const tenantResult = await (0, db_1.query)('SELECT id FROM tenants WHERE stripe_customer_id = $1', [customerId]);
    if (tenantResult.rows.length === 0) {
        console.error('No tenant found for customer:', customerId);
        return;
    }
    const tenantId = tenantResult.rows[0].id;
    // Store invoice record
    await (0, db_1.query)(`INSERT INTO invoices (
      tenant_id,
      stripe_invoice_id,
      amount,
      currency,
      status,
      period_start,
      period_end,
      paid_at,
      invoice_pdf,
      hosted_invoice_url
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (stripe_invoice_id) DO UPDATE SET
      status = $5,
      paid_at = $8`, [
        tenantId,
        invoice.id,
        invoice.amount_paid,
        invoice.currency,
        invoice.status,
        new Date(invoice.period_start * 1000),
        new Date(invoice.period_end * 1000),
        invoice.status_transitions.paid_at
            ? new Date(invoice.status_transitions.paid_at * 1000)
            : null,
        invoice.invoice_pdf,
        invoice.hosted_invoice_url,
    ]);
    console.log(`Invoice ${invoice.id} recorded for tenant ${tenantId}`);
}
/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice) {
    console.log('Invoice payment failed:', invoice.id);
    const customerId = invoice.customer;
    // Get tenant ID
    const tenantResult = await (0, db_1.query)('SELECT id FROM tenants WHERE stripe_customer_id = $1', [customerId]);
    if (tenantResult.rows.length === 0) {
        console.error('No tenant found for customer:', customerId);
        return;
    }
    const tenantId = tenantResult.rows[0].id;
    // Update tenant status to past_due
    await (0, db_1.query)('UPDATE tenants SET subscription_status = $1 WHERE id = $2', ['past_due', tenantId]);
    // TODO: Send email notification about failed payment
    console.log(`Payment failed for tenant ${tenantId}, marked as past_due`);
}
