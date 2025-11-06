import { injectable } from 'inversify';
import { Transaction, TransactionType, TransactionStatus, Prisma } from '@prisma/client';
import { ITransactionRepository } from '../interfaces/repositories/ITransactionRepository';
import { prisma } from '../config/database';

/**
 * Transaction Repository Implementation
 * Handles data access for Transaction entity using Prisma
 */
@injectable()
export class TransactionRepository implements ITransactionRepository {
  async findById(id: string, userId?: string): Promise<Transaction | null> {
    return prisma.transaction.findFirst({
      where: {
        id,
        ...(userId && { userId }),
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            category: true,
            iconUrl: true,
          },
        },
      },
    });
  }

  async findByUserId(
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
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(filters.type && { type: filters.type }),
      ...(filters.serviceId && { serviceId: filters.serviceId }),
      ...(filters.startDate && {
        createdAt: {
          gte: filters.startDate,
        },
      }),
      ...(filters.endDate && {
        createdAt: {
          ...{},
          lte: filters.endDate,
        },
      }),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              category: true,
              iconUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

