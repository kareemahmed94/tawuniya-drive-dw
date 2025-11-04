import { Wallet } from '@prisma/client';
import { BaseResource } from './BaseResource';

/**
 * Wallet Resource
 * Transforms wallet data for API responses
 */
export class WalletResource extends BaseResource<
  Wallet & {
    user?: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    };
  }
> {
  toArray() {
    return {
      id: this.data.id,
      userId: this.data.userId,
      balance: this.toNumber(this.data.balance),
      totalEarned: this.toNumber(this.data.totalEarned),
      totalBurned: this.toNumber(this.data.totalBurned),
      totalExpired: this.toNumber(this.data.totalExpired),
      lastActivity: this.formatDate(this.data.lastActivity),
      createdAt: this.formatDate(this.data.createdAt),
      updatedAt: this.formatDate(this.data.updatedAt),
      user: this.whenNotNull(this.data.user),
    };
  }
}

/**
 * Wallet Balance Resource
 * Simple resource for balance-only responses
 */
export class WalletBalanceResource extends BaseResource<{ balance: any }> {
  toArray() {
    return {
      balance: this.toNumber(this.data.balance),
    };
  }
}

/**
 * Wallet Statistics Resource
 * For wallet statistics endpoint
 */
export class WalletStatisticsResource extends BaseResource<{
  totalEarned: number;
  totalBurned: number;
  totalExpired: number;
  currentBalance: number;
  activePoints: number;
  transactionCount: number;
}> {
  toArray() {
    return {
      totalEarned: this.data.totalEarned,
      totalBurned: this.data.totalBurned,
      totalExpired: this.data.totalExpired,
      currentBalance: this.data.currentBalance,
      activePoints: this.data.activePoints,
      transactionCount: this.data.transactionCount,
    };
  }
}

/**
 * Point Balance Resource
 * For active point balances
 */
export class PointBalanceResource extends BaseResource<{
  id: string;
  points: number;
  earnedAt: Date;
  expiresAt: Date | null;
  daysUntilExpiry: number | null;
}> {
  toArray() {
    return {
      id: this.data.id,
      points: this.data.points,
      earnedAt: this.formatDate(this.data.earnedAt),
      expiresAt: this.formatDate(this.data.expiresAt),
      daysUntilExpiry: this.data.daysUntilExpiry,
    };
  }
}

