import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { mockConfig, mockLogEvent, mockSubmitFeedback } from './mock-db';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors({ origin: '*' }));

// Serve all static files from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/embed', express.static(path.join(__dirname, '..', 'public')));

// Root endpoint
app.get('/', (req: Request, res: Response) => {
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
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    mode: 'demo',
    database: 'mock',
    timestamp: new Date().toISOString()
  });
});

// Config endpoint - returns mock data
app.get('/api/config', (req: Request, res: Response) => {
  console.log('🔧 Config requested for:', req.query);
  res.json(mockConfig);
});

// Log endpoint - simulates logging
app.post('/api/log', (req: Request, res: Response) => {
  const result = mockLogEvent(req.body);
  res.json(result);
});

// Feedback endpoint - simulates feedback storage
app.post('/api/feedback', (req: Request, res: Response) => {
  const result = mockSubmitFeedback(req.body);
  res.json(result);
});

// 404 handler
app.use((req: Request, res: Response) => {
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
