import { adminRequest } from '../admin-request';
import type { TransactionExtended, PaginatedResponse } from '@/lib/api/types';
import type { ApiResponse } from '@/lib/api/client';

/**
 * Admin Transactions Management Service
 */
export const adminTransactionsService = {
  /**
   * Get all transactions
   */
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    serviceId?: string;
    type?: 'EARN' | 'BURN' | 'EXPIRED' | 'ADJUSTMENT';
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    minPoints?: number;
    maxPoints?: number;
  }): Promise<ApiResponse<PaginatedResponse<TransactionExtended>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.minAmount) queryParams.append('minAmount', params.minAmount.toString());
    if (params?.maxAmount) queryParams.append('maxAmount', params.maxAmount.toString());
    if (params?.minPoints) queryParams.append('minPoints', params.minPoints.toString());
    if (params?.maxPoints) queryParams.append('maxPoints', params.maxPoints.toString());

    const query = queryParams.toString();
    return adminRequest<PaginatedResponse<TransactionExtended>>(`/transactions${query ? `?${query}` : ''}`);
  },

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<ApiResponse<TransactionExtended>> {
    return adminRequest<TransactionExtended>(`/transactions/${id}`);
  },

  /**
   * Update transaction
   */
  async updateTransaction(id: string, data: {
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
    description?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<ApiResponse<TransactionExtended>> {
    return adminRequest<TransactionExtended>(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get transaction statistics
   */
  async getTransactionStatistics(params?: {
    startDate?: string;
    endDate?: string;
    serviceId?: string;
  }): Promise<ApiResponse<{
    total: number;
    byType: {
      EARN: number;
      BURN: number;
      EXPIRED: number;
      ADJUSTMENT: number;
    };
    byStatus: {
      PENDING: number;
      COMPLETED: number;
      FAILED: number;
      REVERSED: number;
    };
    totalAmount: number;
    totalPoints: number;
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId);

    const query = queryParams.toString();
    return adminRequest(`/transactions/statistics${query ? `?${query}` : ''}`);
  },

  /**
   * Export transactions to CSV
   */
  async exportTransactions(params?: {
    userId?: string;
    serviceId?: string;
    type?: 'EARN' | 'BURN' | 'EXPIRED' | 'ADJUSTMENT';
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    
    const response = await fetch(`/api/admin/transactions/export${query ? `?${query}` : ''}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export transactions');
    }

    return response.blob();
  },
};

