import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend/.env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import logging configuration first
import logger, { closeLogger } from './config/logger';

// Import middleware
import { corsMiddleware, securityHeaders } from './middleware/cors';
import { 
  generalLimiter, 
  authLimiter, 
  contactLimiter, 
  bookingLimiter,
  uploadLimiter,
  adminLimiter 
} from './middleware/rateLimiting';
import { 
  requestId, 
  devLogger, 
  prodLogger, 
  performanceLogger, 
  analyticsLogger,
  errorLogger 
} from './middleware/logging';
import { 
  errorHandler, 
  notFoundHandler, 
  handleUncaughtException, 
  handleUnhandledRejection 
} from './middleware/errorHandler';

// Import services
import { loggingServiceMiddleware } from './services/loggingService';
import { monitoringMiddleware, monitoringService } from './services/monitoringService';

// Import configuration
import { setupSwagger } from './config/swagger';

// Import routes
import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import monitoringRoutes from './routes/monitoring';
import serviceRoutes from './routes/services';
import serviceCategoryRoutes from './routes/serviceCategories';

const app = express();
const PORT = process.env['PORT'] || 5000;

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', handleUncaughtException);
process.on('unhandledRejection', handleUnhandledRejection);

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Request ID middleware (must be first)
app.use(requestId);

// Logging service middleware
app.use(loggingServiceMiddleware);

// Monitoring middleware
app.use(monitoringMiddleware);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // We handle this in securityHeaders
  crossOriginEmbedderPolicy: false, // Allow embedding for Swagger UI
}));
app.use(securityHeaders);

// CORS middleware
app.use(corsMiddleware);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(performanceLogger);
app.use(process.env['NODE_ENV'] === 'production' ? prodLogger : devLogger);
app.use(analyticsLogger);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, _res, buf) => {
    // Store raw body for webhook verification if needed
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting middleware
app.use('/api', generalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/contact', contactLimiter);
app.use('/api/bookings', bookingLimiter);
app.use('/api/upload', uploadLimiter);
app.use('/api/admin', adminLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development',
    version: '1.0.0',
    requestId: req.headers['x-request-id'],
    monitoring: monitoringService.getHealthStatus(),
  };

  // Log health check
  logger.info('Health check requested', {
    requestId: req.headers['x-request-id'] as string,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(200).json(healthData);
});

// Setup API documentation
setupSwagger(app);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);

// API root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Derji Productions API',
    version: '1.0.0',
    environment: process.env['NODE_ENV'] || 'development',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      files: '/api/files',
      services: '/api/services',
      serviceCategories: '/api/service-categories',
      docs: '/api-docs',
    },
    requestId: req.headers['x-request-id'],
  });
});

// Error logging middleware (before error handler)
app.use(errorLogger);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server only if not in test environment
if (process.env['NODE_ENV'] !== 'test') {
  const server = app.listen(PORT, () => {
    logger.info('Server started successfully', {
      port: PORT,
      environment: process.env['NODE_ENV'] || 'development',
      nodeVersion: process.version,
      pid: process.pid,
    });

    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info('Graceful shutdown initiated', { signal });
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    server.close(async (err) => {
      if (err) {
        logger.error('Error during server shutdown', { error: err.message, signal });
        console.error('Error during server shutdown:', err);
        process.exit(1);
      }
      
      try {
        // Shutdown monitoring service
        monitoringService.shutdown();
        
        // Close logger
        await closeLogger();
        
        logger.info('Graceful shutdown completed', { signal });
        console.log('Server closed successfully');
        process.exit(0);
      } catch (shutdownError) {
        logger.error('Error during graceful shutdown', { 
          error: shutdownError instanceof Error ? shutdownError.message : 'Unknown error',
          signal 
        });
        console.error('Error during graceful shutdown:', shutdownError);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout', { signal, timeout: '30s' });
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;