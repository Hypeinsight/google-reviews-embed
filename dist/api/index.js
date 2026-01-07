"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = require("./config");
const log_1 = require("./log");
const feedback_1 = require("./feedback");
const db_1 = require("./db");
const team_users_1 = require("./team-users");
const clients_1 = require("./clients");
const landing_page_1 = require("./landing-page");
const email_1 = require("./email");
// Auth imports
const login_1 = require("./auth/login");
const middleware_1 = require("./auth/middleware");
// Billing imports
const subscriptions_1 = require("./billing/subscriptions");
const webhooks_1 = require("./billing/webhooks");
const pricing_1 = require("./billing/pricing");
const usage_1 = require("./billing/usage");
// Client dashboard imports
const dashboard_1 = require("./client/dashboard");
// Admin migration (TEMPORARY - remove after migration)
const migrate_1 = require("./admin/migrate");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cookie_parser_1.default)());
// Webhook route needs raw body for signature verification
app.post('/api/billing/webhook', express_1.default.raw({ type: 'application/json' }), webhooks_1.handleWebhook);
// All other routes use JSON parser
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// CORS configuration - allow same-origin requests
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
// Serve static files (path is relative to dist/api when compiled)
const publicPath = path_1.default.join(__dirname, '..', '..', 'public');
app.use('/embed', express_1.default.static(publicPath));
app.use('/admin', express_1.default.static(path_1.default.join(publicPath, 'admin')));
app.use('/client', express_1.default.static(path_1.default.join(publicPath, 'client')));
app.use(express_1.default.static(publicPath));
// Health check endpoint
app.get('/health', async (req, res) => {
    const dbHealthy = await (0, db_1.testConnection)();
    res.status(dbHealthy ? 200 : 503).json({
        status: dbHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'google-reviews-embed',
        database: dbHealthy ? 'connected' : 'disconnected'
    });
});
// API routes (public)
app.get('/api/config', config_1.getConfig);
app.post('/api/log', log_1.logEvent);
app.post('/api/feedback', feedback_1.submitFeedback); // Public for embed
app.get('/api/landing-page', landing_page_1.getLandingPageData);
// Auth routes
app.post('/api/auth/login', login_1.login);
app.post('/api/auth/logout', login_1.logout);
app.get('/api/auth/me', middleware_1.authenticateToken, login_1.getCurrentUser);
// Billing routes (public)
app.get('/api/billing/pricing', pricing_1.getPricingTiers);
// Billing routes (authenticated)
app.post('/api/billing/create-checkout', middleware_1.authenticateToken, subscriptions_1.createCheckoutSession);
app.post('/api/billing/create-portal', middleware_1.authenticateToken, subscriptions_1.createPortalSession);
app.get('/api/billing/subscription', middleware_1.authenticateToken, subscriptions_1.getSubscription);
app.post('/api/billing/cancel-subscription', middleware_1.authenticateToken, subscriptions_1.cancelSubscription);
app.get('/api/billing/usage', middleware_1.authenticateToken, usage_1.getUsage);
app.get('/api/billing/invoices', middleware_1.authenticateToken, pricing_1.getInvoices);
// Client dashboard routes (authenticated)
app.get('/api/feedback', middleware_1.authenticateToken, feedback_1.getFeedback); // Need auth for dashboard viewing
app.get('/api/client/dashboard', middleware_1.authenticateToken, dashboard_1.getDashboardStats);
app.get('/api/client/locations', middleware_1.authenticateToken, dashboard_1.getLocations);
app.get('/api/client/settings', middleware_1.authenticateToken, dashboard_1.getSettings);
app.put('/api/client/settings', middleware_1.authenticateToken, dashboard_1.updateSettings);
// TEMPORARY: Migration endpoint (remove after running once)
app.post('/api/admin/migrate', migrate_1.runMigration);
// Team user management routes
app.get('/api/team-users', team_users_1.getTeamUsers);
app.post('/api/team-users', team_users_1.createTeamUser);
app.put('/api/team-users/:id', team_users_1.updateTeamUser);
app.delete('/api/team-users/:id', team_users_1.deleteTeamUser);
app.post('/api/team-users/:id/reset-password', team_users_1.resetPassword);
// Client management routes
app.get('/api/clients', clients_1.getClients);
app.post('/api/clients', clients_1.createClient);
app.put('/api/clients/:tenantId', clients_1.updateClient);
app.delete('/api/clients/:tenantId', clients_1.deleteClient);
// Email test endpoint
app.post('/api/test-email', async (req, res) => {
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
            await (0, email_1.sendFeedbackNotification)({
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
        }
        else {
            // Send basic test email
            await (0, email_1.sendTestEmail)(email);
        }
        res.json({
            success: true,
            message: `Test email sent to ${email}`
        });
    }
    catch (error) {
        console.error('Test email failed:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send test email'
        });
    }
});
// Root endpoint - redirect to admin
app.get('/', (req, res) => {
    res.redirect('/admin/');
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path
    });
});
// Error handler
app.use((err, req, res, next) => {
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
    const dbConnected = await (0, db_1.testConnection)();
    if (!dbConnected) {
        console.warn('⚠️  Database connection failed - check your .env configuration');
    }
    else {
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
