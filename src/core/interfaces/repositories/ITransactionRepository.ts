import { Transaction, TransactionType, TransactionStatus } from '@prisma/client';
import type { TransactionFilters, PaginationParams, UpdateTransactionInput } from '../../types/admin.types';

/**
 * Transaction Repository Interface
 * Data access layer for Transaction operations
 */
export interface ITransactionRepository {
  /**
   * Find transaction by ID
   */
  findById(id: string): Promise<Transaction | null>;

  /**
   * Get transactions by user ID
   */
  findByUserId(
      userId: string,
      filters: {
        page?: number;
        limit?: number;
        type?: TransactionType;
        serviceId?: string;
        startDate?: Date;
        endDate?: Date;
      }
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
