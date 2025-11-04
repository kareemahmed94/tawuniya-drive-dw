import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

/**
 * Singleton Prisma Client instance
 * Ensures only one connection pool is created
 */
class DatabaseClient {
  private static instance: PrismaClient | null = null;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new PrismaClient({
        // log: process.env.NODE_ENV === 'development'
        //   ? ['query', 'error', 'warn']
        //   : ['error'],
      });

      logger.info('✅ Prisma Client initialized');
    }

    return DatabaseClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseClient.instance) {
      await DatabaseClient.instance.$disconnect();
      DatabaseClient.instance = null;
      logger.info('🔌 Database disconnected');
    }
  }
}

export const prisma = DatabaseClient.getInstance();

// Graceful shutdown
process.on('beforeExit', async () => {
  await DatabaseClient.disconnect();
});

