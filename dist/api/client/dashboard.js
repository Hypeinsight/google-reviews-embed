"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
exports.getLocations = getLocations;
exports.getSettings = getSettings;
exports.updateSettings = updateSettings;
const db_1 = require("../db");
/**
 * GET /api/client/dashboard
 * Get dashboard overview stats for authenticated tenant
 */
async function getDashboardStats(req, res) {
    try {
        const user = req.user;
        // Get total feedback count
        const feedbackResult = await (0, db_1.query)('SELECT COUNT(*) as count FROM feedback WHERE tenant_id = $1', [user.tenantId]);
        const totalFeedback = parseInt(feedbackResult.rows[0].count);
        // Get feedback this month
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const monthFeedbackResult = await (0, db_1.query)('SELECT COUNT(*) as count FROM feedback WHERE tenant_id = $1 AND created_at >= $2', [user.tenantId, monthStart]);
        const monthFeedback = parseInt(monthFeedbackResult.rows[0].count);
        // Get locations count
        const locationsResult = await (0, db_1.query)('SELECT COUNT(*) as count FROM locations WHERE tenant_id = $1 AND active = TRUE', [user.tenantId]);
        const totalLocations = parseInt(locationsResult.rows[0].count);
        // Get average rating
        const ratingResult = await (0, db_1.query)('SELECT AVG(rating) as avg_rating FROM feedback WHERE tenant_id = $1 AND rating IS NOT NULL', [user.tenantId]);
        const avgRating = ratingResult.rows[0].avg_rating
            ? parseFloat(ratingResult.rows[0].avg_rating).toFixed(1)
            : null;
        // Get recent feedback (last 5)
        const recentFeedbackResult = await (0, db_1.query)(`SELECT 
        f.id,
        f.rating,
        f.message,
        f.created_at,
        l.name as location_name
      FROM feedback f
      JOIN locations l ON l.id = f.location_id
      WHERE f.tenant_id = $1
      ORDER BY f.created_at DESC
      LIMIT 5`, [user.tenantId]);
        res.json({
            success: true,
            stats: {
                totalFeedback,
                monthFeedback,
                totalLocations,
                avgRating,
            },
            recentFeedback: recentFeedbackResult.rows,
        });
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard stats',
        });
    }
}
/**
 * GET /api/client/locations
 * Get all locations for authenticated tenant
 */
async function getLocations(req, res) {
    try {
        const user = req.user;
        const result = await (0, db_1.query)(`SELECT 
        l.id,
        l.name,
        l.place_id,
        l.active,
        l.created_at,
        COUNT(f.id) as feedback_count
      FROM locations l
      LEFT JOIN feedback f ON f.location_id = l.id
      WHERE l.tenant_id = $1
      GROUP BY l.id
      ORDER BY l.created_at DESC`, [user.tenantId]);
        res.json({
            success: true,
            locations: result.rows,
        });
    }
    catch (error) {
        console.error('Get locations error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch locations',
        });
    }
}
/**
 * GET /api/client/settings
 * Get tenant settings
 */
async function getSettings(req, res) {
    try {
        const user = req.user;
        const result = await (0, db_1.query)(`SELECT 
        t.id,
        t.name,
        t.settings,
        s.domain,
        s.settings as site_settings
      FROM tenants t
      LEFT JOIN sites s ON s.tenant_id = t.id
      WHERE t.id = $1
      LIMIT 1`, [user.tenantId]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'Tenant not found',
            });
            return;
        }
        const tenant = result.rows[0];
        res.json({
            success: true,
            settings: {
                tenantName: tenant.name,
                domain: tenant.domain,
                notificationEmail: tenant.settings?.notificationEmail,
                buttonText: tenant.site_settings?.buttonText,
                buttonColor: tenant.site_settings?.buttonColor,
                whiteLabel: tenant.site_settings?.whiteLabel,
            },
        });
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch settings',
        });
    }
}
/**
 * PUT /api/client/settings
 * Update tenant settings
 */
async function updateSettings(req, res) {
    try {
        const user = req.user;
        const { notificationEmail, buttonText, buttonColor } = req.body;
        // Update tenant settings
        if (notificationEmail !== undefined) {
            await (0, db_1.query)('UPDATE tenants SET settings = jsonb_set(COALESCE(settings, \'{}\'::jsonb), \'{notificationEmail}\', $1::jsonb) WHERE id = $2', [JSON.stringify(notificationEmail), user.tenantId]);
        }
        // Update site settings
        if (buttonText !== undefined || buttonColor !== undefined) {
            const siteUpdates = {};
            if (buttonText !== undefined)
                siteUpdates.buttonText = buttonText;
            if (buttonColor !== undefined)
                siteUpdates.buttonColor = buttonColor;
            await (0, db_1.query)('UPDATE sites SET settings = settings || $1::jsonb WHERE tenant_id = $2', [JSON.stringify(siteUpdates), user.tenantId]);
        }
        res.json({
            success: true,
            message: 'Settings updated successfully',
        });
    }
    catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update settings',
        });
    }
}
