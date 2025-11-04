import { TransactionType } from '@prisma/client';
import { EarnPointsInput, BurnPointsInput } from '../../validators/transaction.validator';

/**
 * Transaction Service Interface
 * Defines business logic operations for point transactions
 */
export interface ITransactionService {
  /**
   * Earn points from a service
   */
  earnPoints(data: EarnPointsInput): Promise<any>;

  /**
   * Burn points for a service
   */
  burnPoints(data: BurnPointsInput): Promise<any>;

  /**
   * Get transaction history
   */
  getTransactions(
    userId: string,
    filters: {
      page?: number;
      limit?: number;
      type?: TransactionType;
      serviceId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{
    transactions: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;

  /**
   * Get transaction by ID
   */
  getTransactionById(transactionId: string, userId: string): Promise<any>;
}

