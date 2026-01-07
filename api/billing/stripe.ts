import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Stripe client instance
 * Initialized with secret key from environment
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover' as any,
  typescript: true,
});

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return null;
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Create or retrieve Stripe customer for tenant
 */
export async function getOrCreateCustomer(
  tenantId: string,
  email: string,
  name: string,
  existingCustomerId?: string
): Promise<Stripe.Customer> {
  // If customer ID exists, retrieve it
  if (existingCustomerId) {
    try {
      return await stripe.customers.retrieve(existingCustomerId) as Stripe.Customer;
    } catch (error) {
      console.error('Failed to retrieve existing customer:', error);
      // Fall through to create new customer
    }
  }

  // Create new customer
  return await stripe.customers.create({
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
export function formatPrice(cents: number, currency: string = 'usd'): string {
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Get subscription status display
 */
export function getSubscriptionStatusDisplay(status: string): {
  label: string;
  color: string;
} {
  const statusMap: Record<string, { label: string; color: string }> = {
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
