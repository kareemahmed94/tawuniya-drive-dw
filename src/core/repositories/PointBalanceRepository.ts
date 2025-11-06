import { injectable } from 'inversify';
import { PointBalance, Prisma } from '@prisma/client';
import { IPointBalanceRepository } from '../interfaces/repositories/IPointBalanceRepository';
import { prisma } from '../config/database';

/**
 * Point Balance Repository Implementation
 * Handles data access for PointBalance entity using Prisma
 */
@injectable()
export class PointBalanceRepository implements IPointBalanceRepository {
  async create(data: Prisma.PointBalanceCreateInput): Promise<PointBalance> {
    return prisma.pointBalance.create({
      data,
    });
  }

  async findActiveByWalletId(walletId: string): Promise<PointBalance[]> {
    return prisma.pointBalance.findMany({
      where: {
        walletId,
        points: { gt: 0 },
        expiresAt: { gte: new Date() },
        isExpired: false,
      },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async findExpiring(walletId: string, days: number): Promise<PointBalance[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return prisma.pointBalance.findMany({
      where: {
        walletId,
        points: { gt: 0 },
        isExpired: false,
        expiresAt: {
          gte: new Date(),
          lte: expiryDate,
        },
      },
      orderBy: { expiresAt: 'asc' },
      include: {
        transaction: {
          select: {
            serviceId: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async updateBalance(id: string, newBalance: number): Promise<PointBalance> {
    return prisma.pointBalance.update({
      where: { id },
      data: { points: newBalance },
    });
  }

  async deductPoints(
    walletId: string,
    pointsToDeduct: number
  ): Promise<{
    deducted: number;
    remaining: number;
    updatedBalances: PointBalance[];
  }> {
    // Get active balances ordered by expiry (FIFO)
    const balances = await this.findActiveByWalletId(walletId);

    let remainingToDeduct = pointsToDeduct;
    const updatedBalances: PointBalance[] = [];

    for (const balance of balances) {
      if (remainingToDeduct <= 0) break;

      const currentBalance = Number(balance.points);
      const deductFromThis = Math.min(currentBalance, remainingToDeduct);
      const newBalance = currentBalance - deductFromThis;

      const updated = await this.updateBalance(balance.id, newBalance);
      updatedBalances.push(updated);

      remainingToDeduct -= deductFromThis;
    }

    return {
      deducted: pointsToDeduct - remainingToDeduct,
      remaining: remainingToDeduct,
      updatedBalances,
    };
  }

  async markAsExpired(ids: string[]): Promise<number> {
    const result = await prisma.pointBalance.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        points: 0,
        isExpired: true,
      },
    });
    return result.count;
  }

  async findExpiredBalances(): Promise<PointBalance[]> {
    return prisma.pointBalance.findMany({
      where: {
        points: { gt: 0 },
        expiresAt: { lt: new Date() },
        isExpired: false,
      },
    });
  }

  async getTotalActivePoints(walletId: string): Promise<number> {
    const result = await prisma.pointBalance.aggregate({
      where: {
        walletId,
        points: { gt: 0 },
        expiresAt: { gte: new Date() },
        isExpired: false,
      },
      _sum: {
        points: true,
      },
    });
    return Number(result._sum.points || 0);
  }
}

