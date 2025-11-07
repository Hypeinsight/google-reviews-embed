import { Request, Response } from 'express';
import { query } from './db';

interface LandingPageData {
  tenantId: string;
  tenantName: string;
  locationName?: string;
  locationAddress?: string;
  logo?: string;
  stats: {
    reviewsCollected: number;
    feedbackSubmitted: number;
    totalInteractions: number;
  };
  testimonial?: {
    rating: number;
    message: string;
    date: string;
  };
}

/**
 * GET /api/landing-page
 * 
 * Retrieve landing page data for a specific tenant/location
 * Used by the embeddable landing page script on hypeinsight.com
 * 
 * Query parameters:
 * - tenantId: Required - Tenant identifier
 * - locationId: Optional - Specific location (if not provided, shows tenant-level data)
 */
export async function getLandingPageData(req: Request, res: Response): Promise<void> {
  try {
    const { tenantId, locationId } = req.query;

    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameter: tenantId'
      });
      return;
    }

    // Fetch tenant and location info
    let infoQuery = '';
    let infoParams: any[] = [];

    if (locationId) {
      infoQuery = `
        SELECT 
          t.id as tenant_id,
          t.name as tenant_name,
          t.settings as tenant_settings,
          l.name as location_name,
          l.address as location_address,
          l.settings as location_settings
        FROM tenants t
        LEFT JOIN locations l ON l.tenant_id = t.id AND l.id = $2
        WHERE t.id = $1 AND t.active = true
      `;
      infoParams = [tenantId, locationId];
    } else {
      infoQuery = `
        SELECT 
          t.id as tenant_id,
          t.name as tenant_name,
          t.settings as tenant_settings
        FROM tenants t
        WHERE t.id = $1 AND t.active = true
      `;
      infoParams = [tenantId];
    }

    const infoResult = await query(infoQuery, infoParams);

    if (infoResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'Tenant not found or inactive'
      });
      return;
    }

    const info = infoResult.rows[0];

    // Fetch statistics
    let statsQuery = '';
    let statsParams: any[] = [];

    if (locationId) {
      statsQuery = `
        SELECT 
          COUNT(DISTINCT CASE WHEN event_type = 'google_redirect' THEN session_id END) as reviews_collected,
          COUNT(DISTINCT f.id) as feedback_submitted,
          COUNT(DISTINCT e.session_id) as total_interactions
        FROM events e
        LEFT JOIN feedback f ON f.tenant_id = e.tenant_id AND f.location_id = e.location_id
        WHERE e.tenant_id = $1 AND e.location_id = $2
      `;
      statsParams = [tenantId, locationId];
    } else {
      statsQuery = `
        SELECT 
          COUNT(DISTINCT CASE WHEN event_type = 'google_redirect' THEN session_id END) as reviews_collected,
          COUNT(DISTINCT f.id) as feedback_submitted,
          COUNT(DISTINCT e.session_id) as total_interactions
        FROM events e
        LEFT JOIN feedback f ON f.tenant_id = e.tenant_id
        WHERE e.tenant_id = $1
      `;
      statsParams = [tenantId];
    }

    const statsResult = await query(statsQuery, statsParams);
    const stats = statsResult.rows[0] || {
      reviews_collected: 0,
      feedback_submitted: 0,
      total_interactions: 0
    };

    // Fetch a sample positive feedback as testimonial (5 star rating)
    let testimonialQuery = '';
    let testimonialParams: any[] = [];

    if (locationId) {
      testimonialQuery = `
        SELECT rating, message, created_at
        FROM feedback
        WHERE tenant_id = $1 AND location_id = $2 AND rating = 5
        ORDER BY created_at DESC
        LIMIT 1
      `;
      testimonialParams = [tenantId, locationId];
    } else {
      testimonialQuery = `
        SELECT rating, message, created_at
        FROM feedback
        WHERE tenant_id = $1 AND rating = 5
        ORDER BY created_at DESC
        LIMIT 1
      `;
      testimonialParams = [tenantId];
    }

    const testimonialResult = await query(testimonialQuery, testimonialParams);

    // Build response
    const landingPageData: LandingPageData = {
      tenantId: info.tenant_id,
      tenantName: info.tenant_name,
      locationName: info.location_name || undefined,
      locationAddress: info.location_address || undefined,
      logo: info.tenant_settings?.logo || info.location_settings?.logo || undefined,
      stats: {
        reviewsCollected: parseInt(stats.reviews_collected) || 0,
        feedbackSubmitted: parseInt(stats.feedback_submitted) || 0,
        totalInteractions: parseInt(stats.total_interactions) || 0
      },
      testimonial: testimonialResult.rows.length > 0 ? {
        rating: testimonialResult.rows[0].rating,
        message: testimonialResult.rows[0].message,
        date: new Date(testimonialResult.rows[0].created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } : undefined
    };

    res.status(200).json({
      success: true,
      data: landingPageData
    });

  } catch (error) {
    console.error('Error in getLandingPageData:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
