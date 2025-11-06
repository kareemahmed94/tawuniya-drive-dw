import { injectable, inject } from 'inversify';
import { TYPES } from '@/core/di/types';
import type { IWalletService } from '@/core/interfaces/services/IWalletService';
import type { IWalletRepository } from '@/core/interfaces/repositories/IWalletRepository';
import type { ITransactionRepository } from '@/core/interfaces/repositories/ITransactionRepository';
import type { IPointBalanceRepository } from '@/core/interfaces/repositories/IPointBalanceRepository';
import type { WalletResponse, WalletStatistics, PointBalanceResponse } from '@/core/types';
import { AppError } from '@/core/middleware/errorHandler';
import { prisma } from '@/core/config/database';
import logger from '@/core/utils/logger';

/**
 * Wallet Service Implementation
 * Handles wallet-related operations using DI
 * Follows SOLID principles: SRP, DIP, OCP
 */
@injectable()
export class WalletService implements IWalletService {
  constructor(
    @inject(TYPES.WalletRepository) private walletRepository: IWalletRepository,
    @inject(TYPES.TransactionRepository) private transactionRepository: ITransactionRepository,
    @inject(TYPES.PointBalanceRepository) private pointBalanceRepository: IPointBalanceRepository
  ) {}

  /**
   * Get wallet by user ID
   * Returns wallet with balance and statistics
   */
  async getWalletByUserId(userId: string): Promise<WalletResponse> {
    const wallet = await this.walletRepository.findByUserIdWithStats(userId);

    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    return {
      ...wallet,
      balance: Number(wallet.balance),
      totalEarned: Number(wallet.totalEarned),
      totalBurned: Number(wallet.totalBurned),
      totalExpired: Number(wallet.totalExpired),
    };
  }

  /**
   * Get wallet balance
   * Returns only the current balance
   */
  async getBalance(userId: string): Promise<number> {
    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    return Number(wallet.balance);
  }

  /**
   * Get wallet statistics
   */
  async getWalletStatistics(userId: string): Promise<WalletStatistics> {
    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    // Calculate date for recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get recent activity points (last 30 days) - sum points earned and burned
    const [recentEarnedAgg, recentBurnedAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EARN',
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null,
        },
        _sum: { points: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'BURN',
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null,
        },
        _sum: { points: true },
      }),
    ]);

    // Get expiring points (next 30 days)
    const expiringBalances = await this.pointBalanceRepository.findExpiring(wallet.id, 30);
    const expiringPoints = expiringBalances.reduce((sum, pb) => sum + Number(pb.points), 0);

    // Get last activity date
    const lastActivity = wallet.lastActivity ? wallet.lastActivity.toISOString() : wallet.updatedAt.toISOString();

    return {
      currentBalance: Number(wallet.balance),
      totalEarned: Number(wallet.totalEarned),
      totalBurned: Number(wallet.totalBurned),
      totalExpired: Number(wallet.totalExpired),
      lastActivity,
      recentActivity: {
        earned: Number(recentEarnedAgg._sum.points || 0),
        burned: Number(recentBurnedAgg._sum.points || 0),
        period: '30 days',
      },
      expiringSoon: {
        points: expiringPoints,
        within: '30 days',
      },
    };
  }

  /**
   * Get active point balances (non-expired)
   * Shows breakdown of points by batch with expiry dates
   */
  async getActivePointBalances(userId: string): Promise<PointBalanceResponse[]> {
    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    const pointBalances = await this.pointBalanceRepository.findActiveByWalletId(wallet.id);

    return pointBalances.map((pb) => ({
      id: pb.id,
      points: Number(pb.points),
      earnedAt: pb.earnedAt,
      expiresAt: pb.expiresAt,
      daysUntilExpiry: pb.expiresAt
        ? Math.ceil(
            (pb.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
        : null,
    }));
  }

  /**
   * Get points expiring within specified days
   */
  async getExpiringPoints(userId: string, days: number = 30): Promise<PointBalanceResponse[]> {
    const wallet = await this.walletRepository.findByUserId(userId);

    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    const expiringBalances = await this.pointBalanceRepository.findExpiring(wallet.id, days);

    return expiringBalances.map((pb) => ({
      id: pb.id,
      points: Number(pb.points),
      earnedAt: pb.earnedAt,
      expiresAt: pb.expiresAt,
      daysUntilExpiry: pb.expiresAt
        ? Math.ceil(
            (pb.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          )
        : null,
    }));
  }
}
