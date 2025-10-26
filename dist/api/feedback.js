"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitFeedback = submitFeedback;
const db_1 = require("./db");
/**
 * POST /api/feedback
 *
 * Submit private feedback from a user.
 * This feedback is stored separately from Google Reviews.
 *
 * Request body:
 * {
 *   tenantId: string;
 *   siteId: string;
 *   locationId: string;
 *   rating?: number;
 *   message: string;
 *   contactEmail?: string;
 *   contactPhone?: string;
 *   timestamp: string;
 *   sessionId?: string;
 * }
 */
async function submitFeedback(req, res) {
    try {
        const { tenantId, siteId, locationId, rating, message, contactEmail, contactPhone, sessionId } = req.body;
        // Validate required fields
        if (!tenantId || !siteId || !locationId || !message) {
            res.status(400).json({
                success: false,
                error: 'Missing required fields: tenantId, siteId, locationId, message'
            });
            return;
        }
        // Validate rating if provided
        if (rating !== undefined && (rating < 1 || rating > 5)) {
            res.status(400).json({
                success: false,
                error: 'Rating must be between 1 and 5'
            });
            return;
        }
        // Validate message length
        if (message.length > 5000) {
            res.status(400).json({
                success: false,
                error: 'Message must be less than 5000 characters'
            });
            return;
        }
        // Sanitise message (basic - strip HTML tags)
        const sanitisedMessage = message.replace(/<[^>]*>/g, '').trim();
        if (sanitisedMessage.length === 0) {
            res.status(400).json({
                success: false,
                error: 'Message cannot be empty'
            });
            return;
        }
        // Validate email format if provided
        if (contactEmail) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(contactEmail)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid email format'
                });
                return;
            }
        }
        // Insert feedback into database
        const sql = `
      INSERT INTO feedback (
        tenant_id,
        site_id,
        location_id,
        rating,
        message,
        contact_email,
        contact_phone,
        session_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at
    `;
        const result = await (0, db_1.query)(sql, [
            tenantId,
            siteId,
            locationId,
            rating || null,
            sanitisedMessage,
            contactEmail || null,
            contactPhone || null,
            sessionId || null
        ]);
        const feedback = result.rows[0];
        console.log('Feedback submitted:', {
            feedbackId: feedback.id,
            tenantId,
            siteId,
            locationId,
            rating
        });
        res.status(200).json({
            success: true,
            feedbackId: feedback.id,
            timestamp: feedback.created_at
        });
    }
    catch (error) {
        console.error('Error in submitFeedback:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}
