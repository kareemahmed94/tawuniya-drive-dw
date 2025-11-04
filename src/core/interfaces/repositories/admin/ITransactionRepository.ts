import type { Transaction, TransactionType, TransactionStatus } from '@prisma/client';
import type {
  TransactionFilters,
  PaginationParams,
  UpdateTransactionInput,
} from '@/core/types/admin.types';

/**
 * Admin Transaction Repository Interface
 * Extended interface for admin transaction operations
 */
export interface IAdminTransactionRepository {
  /**
   * Find transaction by ID
   */
  findById(id: string): Promise<Transaction | null>;

  /**
   * Find transaction by ID with relations (user, service)
   */
  findByIdWithRelations(id: string): Promise<(Transaction & {
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    service: {
      id: string;
      name: string;
      category: string;
    };
  }) | null>;

  /**
   * Get all transactions with pagination and filters
   */
  findAll(
    params: PaginationParams,
    filters?: TransactionFilters
  ): Promise<{
    data: (Transaction & {
      user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
      };
      service: {
        id: string;
        name: string;
      };
    })[];
    total: number;
  }>;

  /**
   * Get transactions by user ID
   */
  findByUserId(
    userId: string,
    params: PaginationParams
  ): Promise<{
    data: Transaction[];
    total: number;
  }>;

  /**
   * Get transactions by service ID
   */
  findByServiceId(
    serviceId: string,
    params: PaginationParams
  ): Promise<{
    data: Transaction[];
    total: number;
  }>;

  /**
   * Update transaction
   */
  update(id: string, data: UpdateTransactionInput): Promise<Transaction>;

  /**
   * Get transaction statistics
   */
  getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    serviceId?: string;
  }): Promise<{
    total: number;
    byType: Record<TransactionType, number>;
    byStatus: Record<TransactionStatus, number>;
    totalAmount: number;
    totalPoints: number;
  }>;

  /**
   * Get transaction trends
   */
  getTrends(
    period: 'day' | 'week' | 'month' | 'year',
    startDate: Date,
    endDate: Date
  ): Promise<{
    date: string;
    count: number;
    points: number;
    amount: number;
  }[]>;

  /**
   * Export transactions to CSV
   */
  exportTransactions(filters?: TransactionFilters): Promise<string>;
}

