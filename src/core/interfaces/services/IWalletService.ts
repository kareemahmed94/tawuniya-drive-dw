import type { WalletResponse, WalletStatistics, PointBalanceResponse } from '@/core/types';

/**
 * Wallet Service Interface
 * Defines business logic operations for wallet management
 */
export interface IWalletService {
  /**
   * Get wallet by user ID
   */
  getWalletByUserId(userId: string): Promise<WalletResponse>;

  /**
   * Get wallet balance
   */
  getBalance(userId: string): Promise<number>;

  /**
   * Get wallet statistics
   */
  getWalletStatistics(userId: string): Promise<WalletStatistics>;

  /**
   * Get active point balances breakdown
   */
  getActivePointBalances(userId: string): Promise<PointBalanceResponse[]>;

  /**
   * Get points expiring within days
   */
  getExpiringPoints(userId: string, days: number): Promise<PointBalanceResponse[]>;
}

