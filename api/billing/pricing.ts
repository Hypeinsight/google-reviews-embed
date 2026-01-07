import { Request, Response } from 'express';
import { query } from '../db';
import { formatPrice } from './stripe';

/**
 * GET /api/billing/pricing
 * Get all available pricing tiers (public endpoint)
 */
export async function getPricingTiers(req: Request, res: Response): Promise<void> {
  try {
    const result = await query(
      `SELECT 
        id,
        name,
        stripe_price_id,
        monthly_price,
        feedback_limit,
        locations_limit,
        features
      FROM pricing_tiers
      WHERE active = TRUE
      ORDER BY monthly_price ASC`
    );

    const tiers = result.rows.map((tier) => ({
      id: tier.id,
      name: tier.name,
      stripePriceId: tier.stripe_price_id,
      monthlyPrice: tier.monthly_price,
      monthlyPriceFormatted: formatPrice(tier.monthly_price),
      feedbackLimit: tier.feedback_limit,
      locationsLimit: tier.locations_limit,
      features: tier.features,
    }));

    res.json({
      success: true,
      tiers,
    });
  } catch (error) {
    console.error('Get pricing tiers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing tiers',
    });
  }
}

/**
 * GET /api/billing/invoices
 * Get invoice history for authenticated tenant
 */
export async function getInvoices(req: Request, res: Response): Promise<void> {
  try {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const result = await query(
      `SELECT 
        id,
        stripe_invoice_id,
        amount,
        currency,
        status,
        period_start,
        period_end,
        paid_at,
        invoice_pdf,
        hosted_invoice_url,
        created_at
      FROM invoices
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT 50`,
      [user.tenantId]
    );

    const invoices = result.rows.map((inv) => ({
      id: inv.id,
      stripeInvoiceId: inv.stripe_invoice_id,
      amount: inv.amount,
      amountFormatted: formatPrice(inv.amount, inv.currency),
      currency: inv.currency,
      status: inv.status,
      periodStart: inv.period_start,
      periodEnd: inv.period_end,
      paidAt: inv.paid_at,
      invoicePdf: inv.invoice_pdf,
      hostedInvoiceUrl: inv.hosted_invoice_url,
      createdAt: inv.created_at,
    }));

    res.json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices',
    });
  }
}
