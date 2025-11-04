import { injectable } from 'inversify';
import { Wallet, Prisma } from '@prisma/client';
import { IWalletRepository } from '../interfaces/repositories/IWalletRepository';
import { prisma } from '../config/database';

/**
 * Wallet Repository Implementation
 * Handles data access for Wallet entity using Prisma
 */
@injectable()
export class WalletRepository implements IWalletRepository {
  async findByUserId(userId: string): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { userId },
    });
  }

  async findById(id: string): Promise<Wallet | null> {
    return prisma.wallet.findUnique({
      where: { id },
    });
  }

  async create(userId: string, initialBalance: number = 0): Promise<Wallet> {
    return prisma.wallet.create({
      data: {
        userId,
        balance: initialBalance,
      },
    });
  }

  async updateBalance(userId: string, newBalance: number): Promise<Wallet> {
    return prisma.wallet.update({
      where: { userId },
      data: { balance: newBalance },
    });
  }

  async incrementBalance(userId: string, amount: number): Promise<Wallet> {
    return prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  async decrementBalance(userId: string, amount: number): Promise<Wallet> {
    return prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });
  }

  async findByUserIdWithStats(userId: string): Promise<any> {
    return prisma.wallet.findUnique({
      where: { userId },
      include: {
        pointBalances: {
          where: {
            points: { gt: 0 },
            expiresAt: { gte: new Date() },
            isExpired: false,
          },
          orderBy: { expiresAt: 'asc' },
        },
      },
    });
  }

  async findMany(where?: Prisma.WalletWhereInput): Promise<Wallet[]> {
    return prisma.wallet.findMany({ where });
  }
}

