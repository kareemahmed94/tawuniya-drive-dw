import { BaseResource } from './BaseResource';

/**
 * System KPIs Resource
 * For admin dashboard statistics
 */
export class SystemKPIsResource extends BaseResource<{
  totalUsers: number;
  activeUsers: number;
  totalWallets: number;
  totalPointsInCirculation: number;
  totalPointsEarned: number;
  totalPointsBurned: number;
  totalTransactions: number;
  avgPointsPerUser: number;
}> {
  toArray() {
    return {
      totalUsers: this.data.totalUsers,
      activeUsers: this.data.activeUsers,
      totalWallets: this.data.totalWallets,
      totalPointsInCirculation: this.data.totalPointsInCirculation,
      totalPointsEarned: this.data.totalPointsEarned,
      totalPointsBurned: this.data.totalPointsBurned,
      totalTransactions: this.data.totalTransactions,
      avgPointsPerUser: Math.round(this.data.avgPointsPerUser * 100) / 100, // Round to 2 decimals
    };
  }
}

/**
 * Service Analytics Resource
 */
export class ServiceAnalyticsResource extends BaseResource<
  Array<{
    id: string;
    name: string;
    category: string;
    isActive: boolean;
    totalTransactions: number;
    earnTransactions: number;
    burnTransactions: number;
    totalPointsEarned: number;
    totalPointsBurned: number;
    totalAmount: number;
    avgPointsPerTransaction: number;
  }>
> {
  toArray() {
    return this.data.map(service => ({
      id: service.id,
      name: service.name,
      category: service.category,
      isActive: service.isActive,
      totalTransactions: service.totalTransactions,
      earnTransactions: service.earnTransactions,
      burnTransactions: service.burnTransactions,
      totalPointsEarned: service.totalPointsEarned,
      totalPointsBurned: service.totalPointsBurned,
      totalAmount: Math.round(service.totalAmount * 100) / 100,
      avgPointsPerTransaction: Math.round(service.avgPointsPerTransaction * 100) / 100,
    }));
  }
}

/**
 * User Engagement Metrics Resource
 */
export class UserEngagementResource extends BaseResource<{
  totalUsers: number;
  activeUsersLast30Days: number;
  newUsersLast30Days: number;
  usersWithTransactions: number;
  avgTransactionsPerUser: number;
  topUsers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    balance: number;
    totalEarned: number;
    totalBurned: number;
    activeBalances: number;
  }>;
}> {
  toArray() {
    return {
      totalUsers: this.data.totalUsers,
      activeUsersLast30Days: this.data.activeUsersLast30Days,
      newUsersLast30Days: this.data.newUsersLast30Days,
      usersWithTransactions: this.data.usersWithTransactions,
      avgTransactionsPerUser: Math.round(this.data.avgTransactionsPerUser * 100) / 100,
      topUsers: this.data.topUsers,
    };
  }
}

/**
 * Expiry Analytics Resource
 */
export class ExpiryAnalyticsResource extends BaseResource<{
  pointsExpiringNext7Days: number;
  pointsExpiringNext30Days: number;
  pointsExpiredLast30Days: number;
  totalExpiredPoints: number;
  affectedUsers: number;
}> {
  toArray() {
    return {
      pointsExpiringNext7Days: this.data.pointsExpiringNext7Days,
      pointsExpiringNext30Days: this.data.pointsExpiringNext30Days,
      pointsExpiredLast30Days: this.data.pointsExpiredLast30Days,
      totalExpiredPoints: this.data.totalExpiredPoints,
      affectedUsers: this.data.affectedUsers,
    };
  }
}

