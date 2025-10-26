"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const log_1 = require("./log");
const feedback_1 = require("./feedback");
const db_1 = require("./db");
const team_users_1 = require("./team-users");
const clients_1 = require("./clients");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
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
// API routes
app.get('/api/config', config_1.getConfig);
app.post('/api/log', log_1.logEvent);
app.post('/api/feedback', feedback_1.submitFeedback);
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
