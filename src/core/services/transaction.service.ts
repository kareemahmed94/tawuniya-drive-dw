import { injectable, inject } from 'inversify';
import { TransactionType, TransactionStatus, Transaction } from '@prisma/client';
import { TYPES } from '../di/types';
import type { ITransactionService } from '../interfaces/services/ITransactionService';
import type { ITransactionRepository } from '../interfaces/repositories/ITransactionRepository';
import type { IWalletRepository } from '../interfaces/repositories/IWalletRepository';
import type { IServiceRepository } from '../interfaces/repositories/IServiceRepository';
import type { IPointBalanceRepository } from '../interfaces/repositories/IPointBalanceRepository';
import type { IServiceConfigRepository } from '../interfaces/repositories/IServiceConfigRepository';
import type { TransactionResponse, TransactionPaginationResponse } from '../types';
import { AppError } from '../middleware/errorHandler';
import { EarnPointsInput, BurnPointsInput } from '../validators/transaction.validator';
import { PointCalculation } from '../types';
import logger from '../utils/logger';
import { prisma } from '../config/database';

/**
 * Transaction Service Implementation
 * Handles point earning, burning, and transaction history using DI
 * Implements core business logic for the wallet system
 * Follows SOLID principles: SRP, DIP, OCP
 */
@injectable()
export class TransactionService implements ITransactionService {
  constructor(
    @inject(TYPES.TransactionRepository) private transactionRepository: ITransactionRepository,
    @inject(TYPES.WalletRepository) private walletRepository: IWalletRepository,
    @inject(TYPES.ServiceRepository) private serviceRepository: IServiceRepository,
    @inject(TYPES.PointBalanceRepository) private pointBalanceRepository: IPointBalanceRepository,
    @inject(TYPES.ServiceConfigRepository) private serviceConfigRepository: IServiceConfigRepository
  ) {}

  /**
   * Earn points from a service transaction
   * Creates transaction, point balance, and updates wallet
   */
  async earnPoints(data: EarnPointsInput): Promise<Transaction> {
    // Validate user and wallet exist
    const wallet = await this.walletRepository.findByUserId(data.userId);

    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    // Validate service exists
    const service = await this.serviceRepository.findById(data.serviceId);

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    if (!service.isActive) {
      throw new AppError('Service is not active', 400);
    }

    // Calculate points based on earning rule
    const calculation = await this.calculateEarnPoints(
      data.serviceId,
      data.amount
    );

    if (calculation.points <= 0) {
      throw new AppError('No points earned for this amount', 400);
    }

    // Perform transaction using Prisma transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      const balanceBefore = wallet.balance;
      const balanceAfter = Number(balanceBefore) + calculation.points;

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: data.userId,
          serviceId: data.serviceId,
          type: TransactionType.EARN,
          points: calculation.points,
          amount: data.amount,
          balanceBefore,
          balanceAfter,
          status: TransactionStatus.COMPLETED,
          description: data.description || `Earned from ${service.name}`,
          metadata: data.metadata,
        },
      });

      // Create point balance for expiry tracking
      await tx.pointBalance.create({
        data: {
          walletId: wallet.id,
          points: calculation.points,
          earnedAt: new Date(),
          expiresAt: calculation.expiresAt,
          transactionId: transaction.id,
        },
      });

      // Update wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: calculation.points },
          totalEarned: { increment: calculation.points },
          lastActivity: new Date(),
        },
      });

      return transaction;
    });

    logger.info(
      `Points earned: ${calculation.points} points for user ${data.userId} from ${service.name}`
    );

    return result;
  }

  /**
   * Burn points for a service
   * Deducts from oldest point balances first (FIFO)
   */
  async burnPoints(data: BurnPointsInput): Promise<Transaction> {
    // Validate user and wallet exist
    const wallet = await this.walletRepository.findByUserId(data.userId);

    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    // Validate service exists
    const service = await this.serviceRepository.findById(data.serviceId);

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    if (!service.isActive) {
      throw new AppError('Service is not active', 400);
    }

    // Check if user has enough balance
    const currentBalance = Number(wallet.balance);
    if (currentBalance < data.points) {
      throw new AppError(
        `Insufficient balance. Current: ${currentBalance}, Required: ${data.points}`,
        400
      );
    }

    // Perform transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from point balances (FIFO)
      const activeBalances = await tx.pointBalance.findMany({
        where: {
          walletId: wallet.id,
          points: { gt: 0 },
          expiresAt: { gte: new Date() },
          isExpired: false,
        },
        orderBy: { expiresAt: 'asc' },
      });

      let remainingToDeduct = data.points;
      for (const balance of activeBalances) {
        if (remainingToDeduct <= 0) break;

        const currentPoints = Number(balance.points);
        const deductFromThis = Math.min(currentPoints, remainingToDeduct);
        const newBalance = currentPoints - deductFromThis;

        await tx.pointBalance.update({
          where: { id: balance.id },
          data: { points: newBalance },
        });

        remainingToDeduct -= deductFromThis;
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = Number(balanceBefore) - data.points;

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: data.userId,
          serviceId: data.serviceId,
          type: TransactionType.BURN,
          points: data.points,
          amount: 0, // For burn transactions, amount is typically 0 or calculated separately
          balanceBefore,
          balanceAfter,
          status: TransactionStatus.COMPLETED,
          description: data.description || `Redeemed for ${service.name}`,
          metadata: data.metadata,
        },
      });

      // Update wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: data.points },
          totalBurned: { increment: data.points },
          lastActivity: new Date(),
        },
      });

      return transaction;
    });

    logger.info(
      `Points burned: ${data.points} points for user ${data.userId} at ${service.name}`
    );

    return result;
  }

  /**
   * Get transaction history
   */
  async getTransactions(
    userId: string,
    filters: {
      page?: number;
      limit?: number;
      type?: TransactionType;
      serviceId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<TransactionPaginationResponse> {
    const result = await this.transactionRepository.findByUserId(userId, {
      ...filters,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });

    return {
      transactions: result.transactions.map((t) => ({
        ...t,
        points: Number(t.points),
        amount: t.amount ? Number(t.amount) : null,
        balanceBefore: Number(t.balanceBefore),
        balanceAfter: Number(t.balanceAfter),
        metadata: t.metadata as Record<string, unknown> | null,
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(transactionId: string, userId: string): Promise<TransactionResponse> {
    const transaction = await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return {
      ...transaction,
      points: Number(transaction.points),
      amount: transaction.amount ? Number(transaction.amount) : null,
      balanceBefore: Number(transaction.balanceBefore),
      balanceAfter: Number(transaction.balanceAfter),
      metadata: transaction.metadata as Record<string, unknown> | null,
    };
  }

  /**
   * Calculate points to earn based on earning rule
   * @private
   */
  private async calculateEarnPoints(
    serviceId: string,
    amount: number
  ): Promise<PointCalculation> {
    const config = await this.serviceConfigRepository.findActiveByServiceAndType(
      serviceId,
      'EARN'
    );

    if (!config) {
      throw new AppError('No active earning rule found for this service', 404);
    }

    // Validate minimum amount if specified
    if (config.minAmount && amount < Number(config.minAmount)) {
      return {
        points: 0,
        expiresAt: null,
        rule: {
          pointsPerUnit: Number(config.pointsPerUnit),
          unitAmount: Number(config.unitAmount),
          expiryDays: config.expiryDays,
        },
      };
    }

    // Calculate points
    const units = Math.floor(amount / Number(config.unitAmount));
    let points = units * Number(config.pointsPerUnit);

    // Apply max points limit if specified
    if (config.maxPoints && points > Number(config.maxPoints)) {
      points = Number(config.maxPoints);
    }

    // Calculate expiry date
    let expiresAt: Date | null = null;
    if (config.expiryDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + config.expiryDays);
    }

    return {
      points,
      expiresAt,
      rule: {
        pointsPerUnit: Number(config.pointsPerUnit),
        unitAmount: Number(config.unitAmount),
        expiryDays: config.expiryDays,
      },
    };
  }
}
