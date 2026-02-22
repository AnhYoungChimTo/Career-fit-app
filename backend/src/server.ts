import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config, validateConfig } from './config';
import authRoutes from './routes/auth.routes';
import interviewRoutes from './routes/interview.routes';
import resultsRoutes from './routes/results.routes';
import careersRoutes from './routes/careers.routes';
import profileRoutes from './routes/profile.routes';

// Validate configuration
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration error:', error);
  process.exit(1);
}

// Initialize Express app
const app: Express = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
if (config.isDevelopment) {
  app.use((req: Request, res: Response, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Career Fit API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/profile', profileRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('❌ Error:', err);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: config.isDevelopment ? err.message : 'An unexpected error occurred',
      ...(config.isDevelopment && { stack: err.stack }),
    },
  });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  console.log('\n🚀 Career Fit API Server');
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 CORS enabled for: ${config.corsOrigin}`);
  console.log('\n✨ Ready to accept requests!\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});
