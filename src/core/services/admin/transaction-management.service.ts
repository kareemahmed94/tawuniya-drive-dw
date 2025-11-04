import type { IAdminTransactionRepository } from '../../interfaces/repositories/admin/ITransactionRepository';
import type { ITransactionManagementService } from '../../interfaces/services/ITransactionManagementService';
import type {
  TransactionResponse,
  TransactionFilters,
  UpdateTransactionInput,
  PaginationParams,
  PaginatedResponse,
} from '../../types/admin.types';

/**
 * Transaction Management Service
 * Handles admin operations for transactions
 */
export class TransactionManagementService implements ITransactionManagementService {
  constructor(private transactionRepository: IAdminTransactionRepository) {}

  async getTransactionById(id: string): Promise<TransactionResponse> {
    const transaction = await this.transactionRepository.findByIdWithRelations(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return this.transformTransactionResponse(transaction);
  }

  async getAllTransactions(
    params: PaginationParams,
    filters?: TransactionFilters
  ): Promise<PaginatedResponse<TransactionResponse>> {
    const { data, total } = await this.transactionRepository.findAll(params, filters);

    const transformedData = data.map((tx) => this.transformTransactionResponse(tx));

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: transformedData,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
    };
  }

  async getTransactionsByUserId(
    userId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<TransactionResponse>> {
    const { data, total } = await this.transactionRepository.findByUserId(userId, params);

    const transformedData = data.map((tx) => this.transformTransactionResponse(tx));

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: transformedData,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
    };
  }

  async getTransactionsByServiceId(
    serviceId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<TransactionResponse>> {
    const { data, total } = await this.transactionRepository.findByServiceId(serviceId, params);

    const transformedData = data.map((tx) => this.transformTransactionResponse(tx));

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: transformedData,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
    };
  }

  async updateTransaction(id: string, data: UpdateTransactionInput): Promise<TransactionResponse> {
    const existing = await this.transactionRepository.findById(id);
    if (!existing) {
      throw new Error('Transaction not found');
    }

    const updated = await this.transactionRepository.update(id, data);
    const withRelations = await this.transactionRepository.findByIdWithRelations(updated.id);

    if (!withRelations) {
      throw new Error('Failed to fetch updated transaction');
    }

    return this.transformTransactionResponse(withRelations);
  }

  async getTransactionStatistics(filters?: {
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
  }> {
    return this.transactionRepository.getStatistics(filters);
  }

  async getTransactionTrends(
    period: 'day' | 'week' | 'month' | 'year',
    startDate: Date,
    endDate: Date
  ): Promise<{
    date: string;
    count: number;
    points: number;
    amount: number;
  }[]> {
    return this.transactionRepository.getTrends(period, startDate, endDate);
  }

  async exportTransactions(filters?: TransactionFilters): Promise<string> {
    // Use repository's export method
    return this.transactionRepository.exportTransactions(filters);
  }

  // Private helper methods

  private transformTransactionResponse(transaction: {
    id: string;
    userId: string;
    user?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    serviceId: string;
    service?: {
      id: string;
      name: string;
    };
    type: string;
    amount: unknown;
    points: unknown;
    balanceBefore: unknown;
    balanceAfter: unknown;
    description: string | null;
    metadata: unknown;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): TransactionResponse {
    return {
      id: transaction.id,
      userId: transaction.userId,
      userName: transaction.user
        ? `${transaction.user.first_name} ${transaction.user.last_name}`
        : undefined,
      userEmail: transaction.user?.email,
      serviceId: transaction.serviceId,
      serviceName: transaction.service?.name,
      type: transaction.type as 'EARN' | 'BURN' | 'EXPIRED',
      amount: Number(transaction.amount),
      points: Number(transaction.points),
      balanceBefore: Number(transaction.balanceBefore),
      balanceAfter: Number(transaction.balanceAfter),
      description: transaction.description,
      metadata: transaction.metadata as Record<string, unknown> | null,
      status: transaction.status as 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED',
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    };
  }
}

