import type {
  TransactionResponse,
  TransactionFilters,
  UpdateTransactionInput,
  PaginationParams,
  PaginatedResponse,
} from '@/core/types/admin.types';

/**
 * Transaction Management Service Interface
 * Handles admin operations for transactions
 */
export interface ITransactionManagementService {
  /**
   * Get transaction by ID
   */
  getTransactionById(id: string): Promise<TransactionResponse>;

  /**
   * Get all transactions with pagination and filters
   */
  getAllTransactions(
    params: PaginationParams,
    filters?: TransactionFilters
  ): Promise<PaginatedResponse<TransactionResponse>>;

  /**
   * Get transactions by user ID
   */
  getTransactionsByUserId(
    userId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<TransactionResponse>>;

  /**
   * Get transactions by service ID
   */
  getTransactionsByServiceId(
    serviceId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<TransactionResponse>>;

  /**
   * Update transaction (admin only - for corrections)
   */
  updateTransaction(id: string, data: UpdateTransactionInput): Promise<TransactionResponse>;

  /**
   * Get transaction statistics
   */
  getTransactionStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    serviceId?: string;
  }): Promise<{
    total: number;
    byType: {
      EARN: number;
      BURN: number;
      EXPIRED: number;
    };
    byStatus: {
      PENDING: number;
      COMPLETED: number;
      FAILED: number;
      REVERSED: number;
    };
    totalAmount: number;
    totalPoints: number;
  }>;

  /**
   * Get transaction trends
   */
  getTransactionTrends(
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

