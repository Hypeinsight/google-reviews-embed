import { Request, Response } from 'express';
import { query } from './db';
import { sendFeedbackNotification } from './email';

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
/**
 * GET /api/feedback
 * 
 * Get feedback for a specific tenant/client
 */
export async function getFeedback(req: Request, res: Response): Promise<void> {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: 'tenantId is required'
      });
      return;
    }

    const sql = `
      SELECT 
        f.id,
        f.rating,
        f.message,
        f.contact_email,
        f.contact_phone,
        f.created_at,
        l.name as location_name
      FROM feedback f
      JOIN locations l ON f.location_id = l.id
      WHERE f.tenant_id = $1
      ORDER BY f.created_at DESC
      LIMIT 100
    `;

    const result = await query(sql, [tenantId]);

    res.status(200).json({
      success: true,
      feedback: result.rows
    });
  } catch (error) {
    console.error('Error in getFeedback:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

export async function submitFeedback(req: Request, res: Response): Promise<void> {
  try {
    const {
      tenantId,
      siteId,
      locationId,
      rating,
      message,
      contactEmail,
      contactPhone,
      sessionId
    } = req.body;

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

    const result = await query(sql, [
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

    // Send email notification (async, don't wait)
    try {
      // Get client details for email notification
      const clientQuery = `
        SELECT 
          t.name as client_name,
          t.settings->>'notificationEmail' as notification_email,
          s.settings->>'buttonColor' as button_color,
          l.name as location_name
        FROM tenants t
        JOIN locations l ON l.tenant_id = t.id
        JOIN sites s ON s.tenant_id = t.id
        WHERE t.id = $1 AND l.id = $2 AND s.id = $3
      `;
      const clientResult = await query(clientQuery, [tenantId, locationId, siteId]);
      
      if (clientResult.rows.length > 0) {
        const clientInfo = clientResult.rows[0];
        const notificationEmail = clientInfo.notification_email;
        
        if (notificationEmail) {
          // Send notification asynchronously (don't block response)
          sendFeedbackNotification({
            clientName: clientInfo.client_name,
            clientEmail: notificationEmail,
            locationName: clientInfo.location_name,
            rating: rating || 0,
            message: sanitisedMessage,
            contactEmail: contactEmail || undefined,
            contactPhone: contactPhone || undefined,
            isUrgent: req.body.isUrgent || false,
            feedbackDate: feedback.created_at,
            brandColor: clientInfo.button_color || '#667eea'
          }).catch(err => {
            console.error('Failed to send email notification:', err);
          });
        }
      }
    } catch (emailError) {
      // Log but don't fail the request if email fails
      console.error('Error preparing email notification:', emailError);
    }

    res.status(200).json({
      success: true,
      feedbackId: feedback.id,
      timestamp: feedback.created_at
    });
  } catch (error) {
    console.error('Error in submitFeedback:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
