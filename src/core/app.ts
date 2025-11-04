import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/environment';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
// import routes from './routes'; // Routes are now handled by Next.js API routes
import logger from './utils/logger';

/**
 * Express Application Setup
 * Configures middleware, routes, and error handling
 */
export const createApp = (): Application => {
  const app = express();

  // ========================================
  // Security Middleware
  // ========================================
  
  // Helmet: Sets various HTTP headers for security
  app.use(helmet());

  // CORS: Configure allowed origins
  app.use(
    cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ========================================
  // Request Parsing Middleware
  // ========================================
  
  // Parse JSON payloads
  app.use(express.json({ limit: '10mb' }));
  
  // Parse URL-encoded payloads
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ========================================
  // Logging Middleware
  // ========================================
  
  if (config.isDevelopment) {
    // Detailed logging in development
    app.use(morgan('dev'));
  } else {
    // Structured logging in production
    app.use(
      morgan('combined', {
        stream: {
          write: (message) => logger.info(message.trim()),
        },
      })
    );
  }

  // ========================================
  // Rate Limiting
  // ========================================
  
  // Apply rate limiting to all API routes
  app.use('/api', apiLimiter);

  // ========================================
  // API Routes
  // ========================================
  
  // Mount all API routes under /api prefix
  // Routes are now handled by Next.js API routes
  // app.use('/api', routes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Tawuniya Digital Wallet API',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/api/health',
    });
  });

  // ========================================
  // Error Handling
  // ========================================
  
  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

