import { TransactionType, Transaction } from '@prisma/client';
import type { TransactionResponse, TransactionPaginationResponse } from '../../types';
import { EarnPointsInput, BurnPointsInput } from '../../validators/transaction.validator';

/**
 * Transaction Service Interface
 * Defines business logic operations for point transactions
 */
export interface ITransactionService {
  /**
   * Earn points from a service
   */
  earnPoints(data: EarnPointsInput): Promise<Transaction>;

  /**
   * Burn points for a service
   */
  burnPoints(data: BurnPointsInput): Promise<Transaction>;

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
  ): Promise<TransactionPaginationResponse>;

  /**
   * Get transaction by ID
   */
  getTransactionById(transactionId: string, userId: string): Promise<TransactionResponse>;
}

