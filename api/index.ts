import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import { getConfig } from './config';
import { logEvent } from './log';
import { getFeedback, submitFeedback } from './feedback';
import { testConnection } from './db';
import { getTeamUsers, createTeamUser, updateTeamUser, deleteTeamUser, resetPassword } from './team-users';
import { getClients, createClient, updateClient, deleteClient } from './clients';
import { getLandingPageData } from './landing-page';
import { sendTestEmail, sendFeedbackNotification } from './email';

// Auth imports
import { login, logout, getCurrentUser } from './auth/login';
import { authenticateToken } from './auth/middleware';

// Billing imports
import { createCheckoutSession, createPortalSession, getSubscription, cancelSubscription } from './billing/subscriptions';
import { handleWebhook } from './billing/webhooks';
import { getPricingTiers, getInvoices } from './billing/pricing';
import { getUsage } from './billing/usage';

// Client dashboard imports
import { getDashboardStats, getLocations, getSettings, updateSettings } from './client/dashboard';

// Admin migration (TEMPORARY - remove after migration)
import { runMigration } from './admin/migrate';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());

// Webhook route needs raw body for signature verification
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// All other routes use JSON parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - allow same-origin requests
app.use(cors({
  origin: true,
  credentials: true
}));

// Serve static files (path is relative to dist/api when compiled)
const publicPath = path.join(__dirname, '..', '..', 'public');
app.use('/embed', express.static(publicPath));
app.use('/admin', express.static(path.join(publicPath, 'admin')));
app.use('/client', express.static(path.join(publicPath, 'client')));
app.use(express.static(publicPath));

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const dbHealthy = await testConnection();
  
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    service: 'google-reviews-embed',
    database: dbHealthy ? 'connected' : 'disconnected'
  });
});

// API routes (public)
app.get('/api/config', getConfig);
app.post('/api/log', logEvent);
app.post('/api/feedback', submitFeedback); // Public for embed
app.get('/api/landing-page', getLandingPageData);

// Auth routes
app.post('/api/auth/login', login);
app.post('/api/auth/logout', logout);
app.get('/api/auth/me', authenticateToken, getCurrentUser);

// Billing routes (public)
app.get('/api/billing/pricing', getPricingTiers);

// Billing routes (authenticated)
app.post('/api/billing/create-checkout', authenticateToken, createCheckoutSession);
app.post('/api/billing/create-portal', authenticateToken, createPortalSession);
app.get('/api/billing/subscription', authenticateToken, getSubscription);
app.post('/api/billing/cancel-subscription', authenticateToken, cancelSubscription);
app.get('/api/billing/usage', authenticateToken, getUsage);
app.get('/api/billing/invoices', authenticateToken, getInvoices);

// Client dashboard routes (authenticated)
app.get('/api/feedback', authenticateToken, getFeedback); // Need auth for dashboard viewing
app.get('/api/client/dashboard', authenticateToken, getDashboardStats);
app.get('/api/client/locations', authenticateToken, getLocations);
app.get('/api/client/settings', authenticateToken, getSettings);
app.put('/api/client/settings', authenticateToken, updateSettings);

// TEMPORARY: Migration endpoint (remove after running once)
app.post('/api/admin/migrate', runMigration);

// Team user management routes
app.get('/api/team-users', getTeamUsers);
app.post('/api/team-users', createTeamUser);
app.put('/api/team-users/:id', updateTeamUser);
app.delete('/api/team-users/:id', deleteTeamUser);
app.post('/api/team-users/:id/reset-password', resetPassword);

// Client management routes
app.get('/api/clients', getClients);
app.post('/api/clients', createClient);
app.put('/api/clients/:tenantId', updateClient);
app.delete('/api/clients/:tenantId', deleteClient);

// Email test endpoint
app.post('/api/test-email', async (req: Request, res: Response) => {
  try {
    const { email, type } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    if (type === 'feedback') {
      // Send a test feedback notification
      await sendFeedbackNotification({
        clientName: 'Test Client',
        clientEmail: email,
        locationName: 'Test Location',
        rating: 5,
        message: 'This is a test feedback message to verify the email notification system is working correctly.',
        contactEmail: 'customer@example.com',
        contactPhone: '+1 (555) 123-4567',
        isUrgent: false,
        feedbackDate: new Date()
      });
    } else {
      // Send basic test email
      await sendTestEmail(email);
    }

    res.json({
      success: true,
      message: `Test email sent to ${email}`
    });
  } catch (error: any) {
    console.error('Test email failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test email'
    });
  }
});

// Root endpoint - redirect to admin
app.get('/', (req: Request, res: Response) => {
  res.redirect('/admin/');
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Google Reviews Embed API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Embed script: http://localhost:${PORT}/embed/embed.js`);
  
  // Test database connection on startup
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('⚠️  Database connection failed - check your .env configuration');
  } else {
    console.log('✓ Database connected');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
