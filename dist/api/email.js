"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFeedbackNotification = sendFeedbackNotification;
exports.sendTestEmail = sendTestEmail;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'notifications@hypeinsight.com';
const FROM_NAME = process.env.FROM_NAME || 'Hype Insight Reviews';
// Initialize SendGrid
if (SENDGRID_API_KEY) {
    mail_1.default.setApiKey(SENDGRID_API_KEY);
}
else {
    console.warn('⚠️  SendGrid API key not found. Email notifications will not be sent.');
}
/**
 * Send email notification when feedback is received
 */
async function sendFeedbackNotification(data) {
    if (!SENDGRID_API_KEY) {
        console.log('⚠️  Skipping email notification (SendGrid not configured)');
        return false;
    }
    try {
        const ratingStars = '★'.repeat(data.rating) + '☆'.repeat(5 - data.rating);
        const urgentBadge = data.isUrgent ? '<span style="background: #ff4444; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 16px;">🚨 URGENT</span>' : '';
        const contactInfo = data.contactEmail || data.contactPhone
            ? `
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-top: 16px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #666;">Contact Information</h3>
          ${data.contactEmail ? `<p style="margin: 4px 0;"><strong>Email:</strong> ${data.contactEmail}</p>` : ''}
          ${data.contactPhone ? `<p style="margin: 4px 0;"><strong>Phone:</strong> ${data.contactPhone}</p>` : ''}
        </div>
      `
            : '';
        const msg = {
            to: data.clientEmail,
            from: {
                email: FROM_EMAIL,
                name: FROM_NAME
            },
            subject: data.isUrgent
                ? `🚨 URGENT Feedback from ${data.locationName} - ${data.rating}★`
                : `New ${data.rating}★ Feedback from ${data.locationName}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 32px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="margin: 0; font-size: 24px; color: #1a1a1a;">New Customer Feedback</h1>
              <p style="color: #666; margin: 8px 0 0 0;">From ${data.locationName}</p>
            </div>

            ${urgentBadge}

            <!-- Rating -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 8px; text-align: center; color: white; margin-bottom: 24px;">
              <div style="font-size: 48px; margin-bottom: 8px;">${ratingStars}</div>
              <div style="font-size: 18px; font-weight: 600;">${data.rating} out of 5 stars</div>
            </div>

            <!-- Message -->
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid ${data.rating >= 4 ? '#4caf50' : data.rating === 3 ? '#ff9800' : '#f44336'}; margin-bottom: 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #333;">Customer Message:</h3>
              <p style="margin: 0; color: #444; line-height: 1.6; white-space: pre-wrap;">${data.message}</p>
            </div>

            ${contactInfo}

            <!-- Details -->
            <div style="padding-top: 24px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px;">
              <p style="margin: 4px 0;"><strong>Received:</strong> ${data.feedbackDate.toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' })}</p>
              <p style="margin: 4px 0;"><strong>Client:</strong> ${data.clientName}</p>
            </div>

            <!-- Action Button -->
            <div style="text-align: center; margin-top: 32px;">
              <a href="https://reviews.hypeawareness.com/admin/dashboard.html" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                View in Dashboard
              </a>
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #999; font-size: 12px;">
              <p style="margin: 0;">This is an automated notification from Hype Insight Reviews</p>
              <p style="margin: 8px 0 0 0;">
                <a href="https://hypeinsight.com" style="color: #667eea; text-decoration: none;">Hype Insight</a> • 
                Review Management System
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
            text: `
New ${data.rating}★ Feedback from ${data.locationName}
${data.isUrgent ? '🚨 MARKED AS URGENT' : ''}

Rating: ${ratingStars} (${data.rating}/5)

Message:
${data.message}

${data.contactEmail ? `Email: ${data.contactEmail}\n` : ''}${data.contactPhone ? `Phone: ${data.contactPhone}\n` : ''}

Received: ${data.feedbackDate.toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' })}
Client: ${data.clientName}

View full details: https://reviews.hypeawareness.com/admin/dashboard.html

---
Hype Insight Reviews - Automated Notification
      `.trim()
        };
        await mail_1.default.send(msg);
        console.log(`✅ Email notification sent to ${data.clientEmail}`);
        return true;
    }
    catch (error) {
        console.error('❌ Failed to send email notification:');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Response body:', JSON.stringify(error.response?.body, null, 2));
        return false;
    }
}
/**
 * Send test email to verify configuration
 */
async function sendTestEmail(toEmail) {
    if (!SENDGRID_API_KEY) {
        throw new Error('SendGrid API key not configured');
    }
    try {
        const msg = {
            to: toEmail,
            from: {
                email: FROM_EMAIL,
                name: FROM_NAME
            },
            subject: 'Test Email from Hype Insight Reviews',
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Configuration Test</h2>
          <p>If you're seeing this, your SendGrid configuration is working correctly!</p>
          <p style="color: #666; margin-top: 20px;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
            text: 'Email configuration test successful! Sent at: ' + new Date().toISOString()
        };
        await mail_1.default.send(msg);
        console.log(`✅ Test email sent to ${toEmail}`);
        return true;
    }
    catch (error) {
        console.error('❌ Failed to send test email:', error.response?.body || error.message);
        throw error;
    }
}
