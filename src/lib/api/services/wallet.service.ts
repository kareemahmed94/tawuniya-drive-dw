import { Wallet, WalletStatistics, PointBalance } from '../types';
import { request } from './request';

/**
 * Wallet API Service
 */
export const walletService = {
  /**
   * Get wallet details
   */
  async getWallet(userId: string): Promise<Wallet> {
    const response = await request<Wallet>(
      `/wallet/${userId}`,
      { method: 'GET' }
    );
    return response.data!;
  },

  /**
   * Get wallet balance
   */
  async getBalance(userId: string): Promise<number> {
    const response = await request<{ balance: number }>(
      `/wallet/${userId}/balance`,
      { method: 'GET' }
    );
    return response.data!.balance;
  },

  /**
   * Get wallet statistics
   */
  async getStatistics(userId: string): Promise<WalletStatistics> {
    const response = await request<WalletStatistics>(
      `/wallet/${userId}/statistics`,
      { method: 'GET' }
    );
    return response.data!;
  },

  /**
   * Get active point balances
   */
  async getPointBalances(userId: string): Promise<PointBalance[]> {
    const response = await request<PointBalance[]>(
      `/wallet/${userId}/point-balances`,
      { method: 'GET' }
    );
    return response.data!;
  },

  /**
   * Get expiring points
   */
  async getExpiringPoints(
    userId: string,
    days: number = 30
  ): Promise<{ expiringPoints: PointBalance[]; within: string }> {
    const response = await request<{ expiringPoints: PointBalance[]; within: string }>(
      `/wallet/${userId}/expiring?days=${days}`,
      { method: 'GET' }
    );
    return response.data!;
  },
};

