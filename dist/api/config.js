"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = getConfig;
const db_1 = require("./db");
/**
 * GET /api/config
 *
 * Retrieve configuration for a tenant/site/location combination.
 * Returns Place ID, branding settings, and widget configuration.
 *
 * Query parameters:
 * - tenantId: Tenant identifier
 * - siteId: Site identifier
 * - locationId: Location identifier
 */
async function getConfig(req, res) {
    try {
        const { tenantId, siteId, locationId } = req.query;
        // Validate parameters
        if (!tenantId || !siteId || !locationId) {
            res.status(400).json({
                success: false,
                error: 'Missing required parameters: tenantId, siteId, locationId'
            });
            return;
        }
        // Query database for configuration
        const sql = `
      SELECT 
        t.id as tenant_id,
        t.name as tenant_name,
        t.active as tenant_active,
        t.settings as tenant_settings,
        s.id as site_id,
        s.domain as site_domain,
        s.active as site_active,
        s.settings as site_settings,
        l.id as location_id,
        l.name as location_name,
        l.place_id,
        l.active as location_active,
        l.settings as location_settings
      FROM tenants t
      JOIN sites s ON s.tenant_id = t.id
      JOIN site_locations sl ON sl.site_id = s.id
      JOIN locations l ON l.id = sl.location_id
      WHERE t.id = $1
        AND s.id = $2
        AND l.id = $3
        AND t.active = true
        AND s.active = true
        AND l.active = true
    `;
        const result = await (0, db_1.query)(sql, [tenantId, siteId, locationId]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Configuration not found or inactive'
            });
            return;
        }
        const row = result.rows[0];
        // Merge settings with defaults
        const defaultSettings = {
            primaryColor: '#4285F4',
            buttonText: 'Leave a Google Review',
            collectFeedback: true,
            feedbackBeforeReview: false
        };
        const mergedSettings = {
            ...defaultSettings,
            ...row.tenant_settings,
            ...row.site_settings,
            ...row.location_settings
        };
        // Build Google Reviews URL
        const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${row.place_id}`;
        res.status(200).json({
            success: true,
            config: {
                tenantId: row.tenant_id,
                tenantName: row.tenant_name,
                siteId: row.site_id,
                siteDomain: row.site_domain,
                locationId: row.location_id,
                locationName: row.location_name,
                placeId: row.place_id,
                googleReviewUrl,
                branding: {
                    primaryColor: mergedSettings.primaryColor,
                    buttonText: mergedSettings.buttonText
                },
                settings: {
                    collectFeedback: mergedSettings.collectFeedback,
                    feedbackBeforeReview: mergedSettings.feedbackBeforeReview
                }
            }
        });
    }
    catch (error) {
        console.error('Error in getConfig:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
