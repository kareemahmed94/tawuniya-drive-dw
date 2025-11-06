import { injectable } from 'inversify';
import { Transaction, TransactionType, TransactionStatus, Prisma } from '@prisma/client';
import { prisma } from '@/core/config/database';
import { IAdminTransactionRepository } from '@/core/interfaces/repositories/admin/ITransactionRepository';
import type {
  TransactionFilters,
  PaginationParams,
  UpdateTransactionInput,
} from '@/core/types/admin.types';

/**
 * Admin Transaction Repository Implementation
 * Handles data access for Transaction entity with admin-specific operations
 * Includes pagination, filtering, statistics, trends, and export
 */
@injectable()
export class AdminTransactionRepository implements IAdminTransactionRepository {
  /**
   * Find transaction by ID
   */
  async findById(id: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({
      where: { id },
    });
  }

  /**
   * Find transaction by ID with relations (user, service)
   */
  async findByIdWithRelations(id: string): Promise<(Transaction & {
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
  }) | null> {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });
  }

  /**
   * Get all transactions with pagination and filters
   */
  async findAll(
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
  }> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = this.buildWhereClause(filters);

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Get transactions by user ID
   */
  async findByUserId(
    userId: string,
    params: PaginationParams
  ): Promise<{
    data: Transaction[];
    total: number;
  }> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    return { data, total };
  }

  /**
   * Get transactions by service ID
   */
  async findByServiceId(
    serviceId: string,
    params: PaginationParams
  ): Promise<{
    data: Transaction[];
    total: number;
  }> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { serviceId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.transaction.count({ where: { serviceId } }),
    ]);

    return { data, total };
  }

  /**
   * Update transaction
   */
  async update(id: string, data: UpdateTransactionInput): Promise<Transaction> {
    // Cast metadata to proper Prisma JSON type
    const updateData = {
      ...data,
      metadata: data.metadata as any,
    };

    return prisma.transaction.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Get transaction statistics
   */
  async getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
    serviceId?: string;
  }): Promise<{
    total: number;
    byType: Record<TransactionType, number>;
    byStatus: Record<TransactionStatus, number>;
    totalAmount: number;
    totalPoints: number;
  }> {
    const where: Prisma.TransactionWhereInput = {};

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.serviceId) {
      where.serviceId = filters.serviceId;
    }

    const [total, byType, byStatus, aggregates] = await Promise.all([
      prisma.transaction.count({ where }),

      prisma.transaction.groupBy({
        by: ['type'],
        where,
        _count: true,
      }),

      prisma.transaction.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),

      prisma.transaction.aggregate({
        where,
        _sum: {
          amount: true,
          points: true,
        },
      }),
    ]);

    const typeRecord: Record<TransactionType, number> = {
      EARN: 0,
      BURN: 0,
      EXPIRED: 0,
      ADJUSTMENT: 0,
    } as Record<TransactionType, number>;
    byType.forEach((item) => {
      typeRecord[item.type] = item._count;
    });

    const statusRecord: Record<TransactionStatus, number> = {
      PENDING: 0,
      COMPLETED: 0,
      FAILED: 0,
      REVERSED: 0,
    } as Record<TransactionStatus, number>;
    byStatus.forEach((item) => {
      statusRecord[item.status] = item._count;
    });

    return {
      total,
      byType: typeRecord,
      byStatus: statusRecord,
      totalAmount: Number(aggregates._sum.amount || 0),
      totalPoints: Number(aggregates._sum.points || 0),
    };
  }

  /**
   * Get transaction trends
   */
  async getTrends(
    period: 'day' | 'week' | 'month' | 'year',
    startDate: Date,
    endDate: Date
  ): Promise<{
    date: string;
    count: number;
    points: number;
    amount: number;
  }[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
        points: true,
        amount: true,
      },
    });

    // Group by date based on period
    const grouped = new Map<string, { count: number; points: number; amount: number }>();

    transactions.forEach((tx) => {
      const dateKey = this.formatDateByPeriod(tx.createdAt, period);
      const existing = grouped.get(dateKey) || { count: 0, points: 0, amount: 0 };

      grouped.set(dateKey, {
        count: existing.count + 1,
        points: existing.points + Number(tx.points),
        amount: existing.amount + Number(tx.amount),
      });
    });

    return Array.from(grouped.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  /**
   * Export transactions to CSV
   */
  async exportTransactions(filters?: TransactionFilters): Promise<string> {
    const where = this.buildWhereClause(filters);

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            first_name: true,
            last_name: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // CSV header
    const headers = [
      'ID',
      'Date',
      'User Email',
      'User Name',
      'Service',
      'Type',
      'Status',
      'Amount (SAR)',
      'Points',
      'Description',
    ];

    // CSV rows
    const rows = transactions.map((tx) => [
      tx.id,
      tx.createdAt.toISOString(),
      tx.user.email,
      `${tx.user.first_name} ${tx.user.last_name}`,
      tx.service.name,
      tx.type,
      tx.status,
      Number(tx.amount).toFixed(2),
      Number(tx.points).toFixed(2),
      tx.description || '',
    ]);

    // Combine header and rows
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Helper methods

  private buildWhereClause(filters?: TransactionFilters): Prisma.TransactionWhereInput {
    const where: Prisma.TransactionWhereInput = {};

    if (!filters) return where;

    if (filters.userId) where.userId = filters.userId;
    if (filters.serviceId) where.serviceId = filters.serviceId;
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      where.amount = {};
      if (filters.minAmount !== undefined) where.amount.gte = filters.minAmount;
      if (filters.maxAmount !== undefined) where.amount.lte = filters.maxAmount;
    }

    if (filters.minPoints !== undefined || filters.maxPoints !== undefined) {
      where.points = {};
      if (filters.minPoints !== undefined) where.points.gte = filters.minPoints;
      if (filters.maxPoints !== undefined) where.points.lte = filters.maxPoints;
    }

    return where;
  }

  private formatDateByPeriod(date: Date, period: 'day' | 'week' | 'month' | 'year'): string {
    const d = new Date(date);

    switch (period) {
      case 'day':
        return d.toISOString().split('T')[0];
      case 'week':
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'month':
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      case 'year':
        return String(d.getFullYear());
      default:
        return d.toISOString().split('T')[0];
    }
  }
}

