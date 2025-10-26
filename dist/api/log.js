"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logEvent = logEvent;
const db_1 = require("./db");
/**
 * POST /api/log
 *
 * Log user interaction events (widget load, button click, review completion, etc.)
 *
 * Request body:
 * {
 *   tenantId: string;
 *   siteId: string;
 *   locationId: string;
 *   eventType: string;
 *   eventData: object;
 *   timestamp: string;
 *   sessionId?: string;
 * }
 */
async function logEvent(req, res) {
    try {
        const { tenantId, siteId, locationId, eventType, eventData, sessionId } = req.body;
        // Validate required fields
        if (!tenantId || !siteId || !locationId || !eventType) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: tenantId, siteId, locationId, eventType'
            });
            return;
        }
        // Validate event type
        const validEventTypes = [
            'widget_loaded',
            'button_clicked',
            'review_started',
            'review_completed',
            'feedback_opened',
            'feedback_submitted',
            'widget_closed'
        ];
        if (!validEventTypes.includes(eventType)) {
            res.status(400).json({
                success: false,
                error: `Invalid eventType. Must be one of: ${validEventTypes.join(', ')}`
            });
            return;
        }
        // Extract user agent and IP
        const userAgent = req.headers['user-agent'] || null;
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] ||
            req.socket.remoteAddress ||
            null;
        // Insert event into database
        const sql = `
      INSERT INTO events (
        tenant_id,
        site_id,
        location_id,
        event_type,
        event_data,
        session_id,
        user_agent,
        ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at
    `;
        const result = await (0, db_1.query)(sql, [
            tenantId,
            siteId,
            locationId,
            eventType,
            JSON.stringify(eventData || {}),
            sessionId || null,
            userAgent,
            ipAddress
        ]);
        const event = result.rows[0];
        res.status(200).json({
            success: true,
            eventId: event.id,
            timestamp: event.created_at
        });
    }
    catch (error) {
        console.error('Error in logEvent:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
