import { createApp } from './app';
import { config } from './config/environment';
import { prisma } from './config/database';
import logger from './utils/logger';

/**
 * Start the Express server
 */
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on http://localhost:${config.port}`);
      logger.info(`📊 Environment: ${config.env}`);
      logger.info(`🔐 CORS enabled for: ${config.cors.origins.join(', ')}`);
      
      if (config.isDevelopment) {
        logger.info(`\n📍 API Endpoints:`);
        logger.info(`   - Health:        http://localhost:${config.port}/api/health`);
        logger.info(`   - Auth:          http://localhost:${config.port}/api/auth/*`);
        logger.info(`   - Wallet:        http://localhost:${config.port}/api/wallet/*`);
        logger.info(`   - Transactions:  http://localhost:${config.port}/api/transactions/*`);
        logger.info(`   - Services:      http://localhost:${config.port}/api/services/*`);
        logger.info(`   - Admin:         http://localhost:${config.port}/api/admin/*`);
      }
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connection
        await prisma.$disconnect();
        logger.info('Database disconnected');

        logger.info('✅ Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

