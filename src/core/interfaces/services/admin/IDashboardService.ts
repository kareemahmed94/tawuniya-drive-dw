/**
 * Admin Service Interface
 * Defines business logic operations for admin analytics and reporting
 */
export interface IDashboardService {
  /**
   * Get system-wide KPIs
   */
  getSystemKPIs(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalWallets: number;
    totalPointsInCirculation: number;
    totalPointsEarned: number;
    totalPointsBurned: number;
    totalTransactions: number;
    avgPointsPerUser: number;
  }>;

  /**
   * Get service analytics
   */
  getServiceAnalytics(): Promise<any[]>;

  /**
   * Get user engagement metrics
   */
  getUserEngagementMetrics(): Promise<{
    totalUsers: number;
    activeUsersLast30Days: number;
    newUsersLast30Days: number;
    usersWithTransactions: number;
    avgTransactionsPerUser: number;
    topUsers: any[];
  }>;

  /**
   * Get expiry analytics
   */
  getExpiryAnalytics(): Promise<{
    pointsExpiringNext7Days: number;
    pointsExpiringNext30Days: number;
    pointsExpiredLast30Days: number;
    totalExpiredPoints: number;
    affectedUsers: number;
  }>;

  /**
   * Get transaction trends
   */
  getTransactionTrends(days?: number): Promise<any[]>;
}

