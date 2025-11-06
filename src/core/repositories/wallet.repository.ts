import { injectable } from 'inversify';
import { Wallet, Prisma } from '@prisma/client';
import { IWalletRepository } from '../interfaces/repositories/IWalletRepository';
import type { WalletWithStatsResponse } from '../types';
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

  async findByUserIdWithStats(userId: string): Promise<WalletWithStatsResponse | null> {
    const wallet = await prisma.wallet.findUnique({
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

    if (!wallet) return null;

    // Transform Decimal fields to numbers
    return {
      ...wallet,
      balance: Number(wallet.balance),
      totalEarned: Number(wallet.totalEarned),
      totalBurned: Number(wallet.totalBurned),
      totalExpired: Number(wallet.totalExpired),
      pointBalances: wallet.pointBalances.map(balance => ({
        ...balance,
        points: Number(balance.points),
      })),
    };
  }

  async findMany(where?: Prisma.WalletWhereInput): Promise<Wallet[]> {
    return prisma.wallet.findMany({ where });
  }
}

