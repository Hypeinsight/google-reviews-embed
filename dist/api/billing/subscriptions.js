"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = createCheckoutSession;
exports.createPortalSession = createPortalSession;
exports.getSubscription = getSubscription;
exports.cancelSubscription = cancelSubscription;
const db_1 = require("../db");
const stripe_1 = require("./stripe");
/**
 * POST /api/billing/create-checkout
 * Create Stripe Checkout session for new subscription
 */
async function createCheckoutSession(req, res) {
    try {
        const { priceId } = req.body;
        const user = req.user;
        if (!priceId) {
            res.status(400).json({
                success: false,
                error: 'priceId is required',
            });
            return;
        }
        // Get tenant info
        const tenantResult = await (0, db_1.query)('SELECT id, name, stripe_customer_id FROM tenants WHERE id = $1', [user.tenantId]);
        if (tenantResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Tenant not found',
            });
            return;
        }
        const tenant = tenantResult.rows[0];
        // Get or create Stripe customer
        const customer = await (0, stripe_1.getOrCreateCustomer)(tenant.id, user.email, tenant.name, tenant.stripe_customer_id);
        // Update tenant with customer ID if new
        if (!tenant.stripe_customer_id) {
            await (0, db_1.query)('UPDATE tenants SET stripe_customer_id = $1 WHERE id = $2', [customer.id, tenant.id]);
        }
        // Create Checkout session
        const session = await stripe_1.stripe.checkout.sessions.create({
            customer: customer.id,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${process.env.API_BASE_URL || 'http://localhost:3000'}/client/dashboard.html?success=true`,
            cancel_url: `${process.env.API_BASE_URL || 'http://localhost:3000'}/client/dashboard.html?canceled=true`,
            metadata: {
                tenant_id: tenant.id,
            },
        });
        res.json({
            success: true,
            sessionId: session.id,
            url: session.url,
        });
    }
    catch (error) {
        console.error('Create checkout session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create checkout session',
        });
    }
}
/**
 * POST /api/billing/create-portal
 * Create Stripe Customer Portal session for managing subscription
 */
async function createPortalSession(req, res) {
    try {
        const user = req.user;
        // Get tenant's Stripe customer ID
        const tenantResult = await (0, db_1.query)('SELECT stripe_customer_id FROM tenants WHERE id = $1', [user.tenantId]);
        if (tenantResult.rows.length === 0 || !tenantResult.rows[0].stripe_customer_id) {
            res.status(404).json({
                success: false,
                error: 'No subscription found',
            });
            return;
        }
        const customerId = tenantResult.rows[0].stripe_customer_id;
        // Create portal session
        const session = await stripe_1.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.API_BASE_URL || 'http://localhost:3000'}/client/dashboard.html`,
        });
        res.json({
            success: true,
            url: session.url,
        });
    }
    catch (error) {
        console.error('Create portal session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create portal session',
        });
    }
}
/**
 * GET /api/billing/subscription
 * Get current subscription details for authenticated tenant
 */
async function getSubscription(req, res) {
    try {
        const user = req.user;
        // Get subscription from database
        const result = await (0, db_1.query)(`SELECT 
        s.*,
        pt.name as plan_name,
        pt.monthly_price,
        pt.feedback_limit,
        pt.locations_limit,
        pt.features,
        t.subscription_status,
        t.trial_ends_at
      FROM subscriptions s
      JOIN pricing_tiers pt ON pt.id = s.plan_tier
      JOIN tenants t ON t.id = s.tenant_id
      WHERE s.tenant_id = $1
      ORDER BY s.created_at DESC
      LIMIT 1`, [user.tenantId]);
        if (result.rows.length === 0) {
            // Check if trial
            const trialResult = await (0, db_1.query)('SELECT subscription_status, trial_ends_at FROM tenants WHERE id = $1', [user.tenantId]);
            if (trialResult.rows.length > 0) {
                const tenant = trialResult.rows[0];
                res.json({
                    success: true,
                    subscription: null,
                    trial: {
                        status: tenant.subscription_status,
                        endsAt: tenant.trial_ends_at,
                    },
                });
                return;
            }
            res.status(404).json({
                success: false,
                error: 'No subscription found',
            });
            return;
        }
        const subscription = result.rows[0];
        res.json({
            success: true,
            subscription: {
                id: subscription.id,
                status: subscription.status,
                planTier: subscription.plan_tier,
                planName: subscription.plan_name,
                monthlyPrice: subscription.monthly_price,
                feedbackLimit: subscription.feedback_limit,
                locationsLimit: subscription.locations_limit,
                features: subscription.features,
                currentPeriodStart: subscription.current_period_start,
                currentPeriodEnd: subscription.current_period_end,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                canceledAt: subscription.canceled_at,
            },
        });
    }
    catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subscription',
        });
    }
}
/**
 * POST /api/billing/cancel-subscription
 * Cancel subscription at end of billing period
 */
async function cancelSubscription(req, res) {
    try {
        const user = req.user;
        // Get subscription
        const result = await (0, db_1.query)('SELECT stripe_subscription_id FROM subscriptions WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 1', [user.tenantId]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'No subscription found',
            });
            return;
        }
        const stripeSubscriptionId = result.rows[0].stripe_subscription_id;
        // Cancel at period end (via Stripe)
        await stripe_1.stripe.subscriptions.update(stripeSubscriptionId, {
            cancel_at_period_end: true,
        });
        // Update database
        await (0, db_1.query)('UPDATE subscriptions SET cancel_at_period_end = TRUE WHERE stripe_subscription_id = $1', [stripeSubscriptionId]);
        res.json({
            success: true,
            message: 'Subscription will be canceled at the end of the billing period',
        });
    }
    catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel subscription',
        });
    }
}
