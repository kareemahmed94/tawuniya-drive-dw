import { PointBalance, Prisma } from '@prisma/client';

/**
 * Point Balance Repository Interface
 * Defines data access operations for PointBalance entity
 */
export interface IPointBalanceRepository {
  /**
   * Create a new point balance
   */
  create(data: Prisma.PointBalanceCreateInput): Promise<PointBalance>;

  /**
   * Find active balances by wallet ID
   */
  findActiveByWalletId(walletId: string): Promise<PointBalance[]>;

  /**
   * Find expiring balances
   */
  findExpiring(walletId: string, days: number): Promise<PointBalance[]>;

  /**
   * Update balance amount
   */
  updateBalance(id: string, newBalance: number): Promise<PointBalance>;

  /**
   * Deduct from oldest balances (FIFO)
   */
  deductPoints(walletId: string, pointsToDeduct: number): Promise<{
    deducted: number;
    remaining: number;
    updatedBalances: PointBalance[];
  }>;

  /**
   * Mark balances as expired
   */
  markAsExpired(ids: string[]): Promise<number>;

  /**
   * Find expired balances
   */
  findExpiredBalances(): Promise<PointBalance[]>;

  /**
   * Get total active points for wallet
   */
  getTotalActivePoints(walletId: string): Promise<number>;
}

