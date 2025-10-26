import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { getConfig } from './config';
import { logEvent } from './log';
import { submitFeedback } from './feedback';
import { testConnection } from './db';
import { getTeamUsers, createTeamUser, updateTeamUser, deleteTeamUser, resetPassword } from './team-users';
import { getClients, createClient, updateClient, deleteClient } from './clients';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// Serve static files (path is relative to dist/api when compiled)
const publicPath = path.join(__dirname, '..', '..', 'public');
app.use('/embed', express.static(publicPath));
app.use('/admin', express.static(path.join(publicPath, 'admin')));
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

// API routes
app.get('/api/config', getConfig);
app.post('/api/log', logEvent);
app.post('/api/feedback', submitFeedback);

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
