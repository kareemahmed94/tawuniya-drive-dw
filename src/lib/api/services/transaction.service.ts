import {
  Transaction,
  EarnPointsRequest,
  BurnPointsRequest,
  TransactionType,
  PaginatedResponse,
} from '../types';
import { request } from './request';

/**
 * Transaction API Service
 */
export const transactionService = {
  /**
   * Earn points
   */
  async earnPoints(data: EarnPointsRequest): Promise<{
    transaction: Transaction;
    pointsEarned: number;
    expiresAt: string | null;
  }> {
    const response = await request<{
      transaction: Transaction;
      pointsEarned: number;
      expiresAt: string | null;
    }>('/transactions/earn', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  /**
   * Burn points
   */
  async burnPoints(data: BurnPointsRequest): Promise<{
    transaction: Transaction;
    pointsBurned: number;
    amountInSAR: number;
  }> {
    const response = await request<{
      transaction: Transaction;
      pointsBurned: number;
      amountInSAR: number;
    }>('/transactions/burn', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  /**
   * Get transaction history
   */
  async getTransactions(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      type?: TransactionType;
      serviceId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.type) params.append('type', options.type);
    if (options?.serviceId) params.append('serviceId', options.serviceId);
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const response = await request<{ transactions: Transaction[]; pagination: any }>(
      `/transactions/${userId}?${params.toString()}`,
      { method: 'GET' }
    );
    
    // Transform backend response { transactions, pagination } to { data, pagination }
    const backendData = response.data!;
    return {
      success: true,
      data: backendData.transactions,
      pagination: backendData.pagination,
    };
  },

  /**
   * Get specific transaction
   */
  async getTransaction(
    userId: string,
    transactionId: string
  ): Promise<Transaction> {
    const response = await request<Transaction>(
      `/transactions/${userId}/${transactionId}`,
      { method: 'GET' }
    );
    return response.data!;
  },
};

