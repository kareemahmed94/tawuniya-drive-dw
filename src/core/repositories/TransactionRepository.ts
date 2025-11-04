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
  async create(data: Prisma.TransactionCreateInput): Promise<Transaction> {
    return prisma.transaction.create({
      data,
    });
  }

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

  async findByWalletId(walletId: string): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: {
        user: {
          wallet: {
            id: walletId
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<Transaction> {
    return prisma.transaction.update({
      where: { id },
      data: { status },
    });
  }

  async countByUserId(
    userId: string,
    filters?: {
      type?: TransactionType;
      serviceId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<number> {
    return prisma.transaction.count({
      where: {
        userId,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.serviceId && { serviceId: filters.serviceId }),
        ...(filters?.startDate && {
          createdAt: {
            gte: filters.startDate,
          },
        }),
        ...(filters?.endDate && {
          createdAt: {
            ...{},
            lte: filters.endDate,
          },
        }),
      },
    });
  }

  async getTotalEarnedByUser(userId: string): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: {
        userId,
        type: { in: ['EARN'] },
        status: 'COMPLETED',
      },
      _sum: {
        points: true,
      },
    });
    return Number(result._sum.points || 0);
  }

  async getTotalBurnedByUser(userId: string): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'BURN',
        status: 'COMPLETED',
      },
      _sum: {
        points: true,
      },
    });
    return Number(result._sum.points || 0);
  }

  async getAggregateStats(): Promise<any> {
    const [totalTransactions, totalPoints, earnedPoints, burnedPoints] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        _sum: { points: true },
      }),
      prisma.transaction.aggregate({
        where: {
          type: { in: ['EARN'] },
          status: 'COMPLETED',
        },
        _sum: { points: true },
      }),
      prisma.transaction.aggregate({
        where: {
          type: 'BURN',
          status: 'COMPLETED',
        },
        _sum: { points: true },
      }),
    ]);

    return {
      totalTransactions,
      totalPoints: Number(totalPoints._sum.points || 0),
      earnedPoints: Number(earnedPoints._sum.points || 0),
      burnedPoints: Number(burnedPoints._sum.points || 0),
    };
  }
}

