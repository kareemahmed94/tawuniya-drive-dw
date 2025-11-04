/**
 * Wallet Service Interface
 * Defines business logic operations for wallet management
 */
export interface IWalletService {
  /**
   * Get wallet by user ID
   */
  getWalletByUserId(userId: string): Promise<any>;

  /**
   * Get wallet balance
   */
  getBalance(userId: string): Promise<number>;

  /**
   * Get wallet statistics
   */
  getWalletStatistics(userId: string): Promise<any>;

  /**
   * Get active point balances breakdown
   */
  getActivePointBalances(userId: string): Promise<any[]>;

  /**
   * Get points expiring within days
   */
  getExpiringPoints(userId: string, days: number): Promise<any[]>;
}

