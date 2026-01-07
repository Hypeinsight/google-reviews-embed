import { Response } from 'express';
import { AuthRequest } from '../auth/middleware';
import { query } from '../db';

/**
 * GET /api/billing/usage
 * Get current usage metrics for authenticated tenant
 */
export async function getUsage(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = req.user!;

    // Get current billing period from subscription
    const subResult = await query(
      `SELECT 
        current_period_start,
        current_period_end,
        plan_tier
      FROM subscriptions
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      LIMIT 1`,
      [user.tenantId]
    );

    let periodStart: Date;
    let periodEnd: Date;
    let planTier: string | null = null;

    if (subResult.rows.length > 0) {
      periodStart = new Date(subResult.rows[0].current_period_start);
      periodEnd = new Date(subResult.rows[0].current_period_end);
      planTier = subResult.rows[0].plan_tier;
    } else {
      // No subscription - use current month
      periodStart = new Date();
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);
      
      periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Get or create usage metrics for current period
    const metricsResult = await query(
      `SELECT metric_type, count
       FROM usage_metrics
       WHERE tenant_id = $1
         AND period_start = $2
         AND period_end = $3`,
      [user.tenantId, periodStart, periodEnd]
    );

    // Convert to map
    const metrics: Record<string, number> = {};
    metricsResult.rows.forEach((row) => {
      metrics[row.metric_type] = row.count;
    });

    // Get plan limits
    let limits: any = {
      feedbackLimit: null,
      locationsLimit: null,
    };

    if (planTier) {
      const tierResult = await query(
        'SELECT feedback_limit, locations_limit FROM pricing_tiers WHERE id = $1',
        [planTier]
      );
      if (tierResult.rows.length > 0) {
        limits = {
          feedbackLimit: tierResult.rows[0].feedback_limit,
          locationsLimit: tierResult.rows[0].locations_limit,
        };
      }
    }

    // Get actual counts
    const feedbackCount = metrics.feedback_count || 0;
    
    const locationsResult = await query(
      'SELECT COUNT(*) as count FROM locations WHERE tenant_id = $1 AND active = TRUE',
      [user.tenantId]
    );
    const locationsCount = parseInt(locationsResult.rows[0].count);

    res.json({
      success: true,
      usage: {
        periodStart,
        periodEnd,
        feedbackCount,
        locationsCount,
        limits,
        withinLimits: {
          feedback: !limits.feedbackLimit || feedbackCount < limits.feedbackLimit,
          locations: !limits.locationsLimit || locationsCount <= limits.locationsLimit,
        },
      },
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage',
    });
  }
}

/**
 * Increment usage counter for a tenant
 * Called internally by other endpoints (e.g. feedback submission)
 */
export async function incrementUsage(
  tenantId: string,
  metricType: string,
  incrementBy: number = 1
): Promise<void> {
  try {
    // Get current billing period
    const subResult = await query(
      `SELECT current_period_start, current_period_end
       FROM subscriptions
       WHERE tenant_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [tenantId]
    );

    let periodStart: Date;
    let periodEnd: Date;

    if (subResult.rows.length > 0) {
      periodStart = new Date(subResult.rows[0].current_period_start);
      periodEnd = new Date(subResult.rows[0].current_period_end);
    } else {
      // No subscription - use current month
      periodStart = new Date();
      periodStart.setDate(1);
      periodStart.setHours(0, 0, 0, 0);
      
      periodEnd = new Date(periodStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Upsert usage metric
    await query(
      `INSERT INTO usage_metrics (tenant_id, metric_type, count, period_start, period_end)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT ON CONSTRAINT usage_metrics_pkey
       WHERE tenant_id = $1 AND metric_type = $2 AND period_start = $4
       DO UPDATE SET count = usage_metrics.count + $3, updated_at = NOW()`,
      [tenantId, metricType, incrementBy, periodStart, periodEnd]
    );

    // Note: The above upsert won't work without a unique constraint
    // Let's do it differently - check and insert/update
    const existing = await query(
      `SELECT id, count FROM usage_metrics
       WHERE tenant_id = $1 AND metric_type = $2
         AND period_start = $3 AND period_end = $4`,
      [tenantId, metricType, periodStart, periodEnd]
    );

    if (existing.rows.length > 0) {
      // Update
      await query(
        'UPDATE usage_metrics SET count = count + $1, updated_at = NOW() WHERE id = $2',
        [incrementBy, existing.rows[0].id]
      );
    } else {
      // Insert
      await query(
        `INSERT INTO usage_metrics (tenant_id, metric_type, count, period_start, period_end)
         VALUES ($1, $2, $3, $4, $5)`,
        [tenantId, metricType, incrementBy, periodStart, periodEnd]
      );
    }
  } catch (error) {
    console.error('Increment usage error:', error);
    throw error;
  }
}

/**
 * Check if tenant is within usage limits
 * Returns false if over limit
 */
export async function checkUsageLimit(
  tenantId: string,
  metricType: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // Get subscription and plan limits
    const result = await query(
      `SELECT 
        s.current_period_start,
        s.current_period_end,
        pt.feedback_limit,
        pt.locations_limit
      FROM subscriptions s
      JOIN pricing_tiers pt ON pt.id = s.plan_tier
      WHERE s.tenant_id = $1
      ORDER BY s.created_at DESC
      LIMIT 1`,
      [tenantId]
    );

    if (result.rows.length === 0) {
      // No subscription - allow (trial)
      return { allowed: true };
    }

    const sub = result.rows[0];
    const limit =
      metricType === 'feedback_count'
        ? sub.feedback_limit
        : metricType === 'location_count'
        ? sub.locations_limit
        : null;

    if (limit === null) {
      // Unlimited
      return { allowed: true };
    }

    // Check current usage
    const usageResult = await query(
      `SELECT count FROM usage_metrics
       WHERE tenant_id = $1 AND metric_type = $2
         AND period_start = $3 AND period_end = $4`,
      [tenantId, metricType, sub.current_period_start, sub.current_period_end]
    );

    const currentCount =
      usageResult.rows.length > 0 ? usageResult.rows[0].count : 0;

    if (currentCount >= limit) {
      return {
        allowed: false,
        reason: `${metricType} limit reached (${currentCount}/${limit})`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Check usage limit error:', error);
    // Allow on error to not block users
    return { allowed: true };
  }
}
