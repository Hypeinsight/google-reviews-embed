"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const mock_db_1 = require("./mock-db");
const app = (0, express_1.default)();
const PORT = 3000;
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({ origin: '*' }));
// Serve all static files from public directory
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
app.use('/embed', express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'Google Reviews Embed System - DEMO MODE',
        version: '1.0.0',
        mode: 'mock',
        message: 'Running without database - all data is simulated',
        endpoints: {
            health: '/health',
            config: 'GET /api/config',
            log: 'POST /api/log',
            feedback: 'POST /api/feedback',
            embed: '/embed/embed.js',
            test: '/embed/test.html'
        }
    });
});
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        mode: 'demo',
        database: 'mock',
        timestamp: new Date().toISOString()
    });
});
// Config endpoint - returns mock data
app.get('/api/config', (req, res) => {
    console.log('🔧 Config requested for:', req.query);
    res.json(mock_db_1.mockConfig);
});
// Log endpoint - simulates logging
app.post('/api/log', (req, res) => {
    const result = (0, mock_db_1.mockLogEvent)(req.body);
    res.json(result);
});
// Feedback endpoint - simulates feedback storage
app.post('/api/feedback', (req, res) => {
    const result = (0, mock_db_1.mockSubmitFeedback)(req.body);
    res.json(result);
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path
    });
});
// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🎨 ═══════════════════════════════════════════════════════════');
    console.log('   DEMO MODE - Running without database');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`🚀 Server running at: http://localhost:${PORT}`);
    console.log(`🧪 Test page: http://localhost:${PORT}/embed/test.html`);
    console.log(`📦 Widget: http://localhost:${PORT}/embed/embed.js`);
    console.log('');
    console.log('✅ All features work except data persistence');
    console.log('✅ Perfect for testing the UI and widget');
    console.log('');
    console.log('💡 To use real database: Set up PostgreSQL and run `npm run dev`');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
});
