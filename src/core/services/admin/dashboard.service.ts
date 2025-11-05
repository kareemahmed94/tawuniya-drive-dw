import { injectable } from 'inversify';
import { prisma } from '@/core/config/database';
import { IDashboardService } from '@/core/interfaces/services/admin/IDashboardService';

/**
 * Dashboard Service
 * Provides analytics, reporting, and KPIs for administrators
 * Follows SOLID principles: SRP, DIP, OCP
 */
@injectable()
export class DashboardService implements IDashboardService {
  /**
   * Get system-wide KPIs
   */
  async getSystemKPIs() {
    const [users, wallets, transactions] = await Promise.all([
      prisma.user.aggregate({
        _count: { id: true },
        where: { isActive: true, deletedAt: null },
      }),
      prisma.wallet.aggregate({
        _count: { id: true },
        _sum: { balance: true, totalEarned: true, totalBurned: true, totalExpired: true },
        _avg: { balance: true },
      }),
      prisma.transaction.aggregate({
        _count: { id: true },
        where: { deletedAt: null },
        _sum: { points: true },
      }),
    ]);

    const totalUsers = users._count.id;
    const activeUsers = users._count.id;
    const totalWallets = wallets._count.id;
    const totalPointsInCirculation = Number(wallets._sum.balance || 0);
    const totalPointsEarned = Number(wallets._sum.totalEarned || 0);
    const totalPointsBurned = Number(wallets._sum.totalBurned || 0);
    const totalTransactions = transactions._count.id;
    const avgPointsPerUser = Number(wallets._avg.balance || 0);

    return {
      totalUsers,
      activeUsers,
      totalWallets,
      totalPointsInCirculation,
      totalPointsEarned,
      totalPointsBurned,
      totalTransactions,
      avgPointsPerUser,
    };
  }

  /**
   * Get service analytics
   */
  async getServiceAnalytics() {
    const services = await prisma.service.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
        transactions: {
          where: { deletedAt: null },
          select: {
            type: true,
            points: true,
            amount: true,
          },
        },
      },
    });

    return services.map((service) => {
      const earnTransactions = service.transactions.filter((t) => t.type === 'EARN');
      const burnTransactions = service.transactions.filter((t) => t.type === 'BURN');

      const totalPointsEarned = earnTransactions.reduce(
        (sum, t) => sum + Number(t.points),
        0
      );
      const totalPointsBurned = burnTransactions.reduce(
        (sum, t) => sum + Number(t.points),
        0
      );
      const totalAmount = earnTransactions.reduce(
        (sum, t) => sum + (t.amount ? Number(t.amount) : 0),
        0
      );

      return {
        id: service.id,
        name: service.name,
        category: service.category,
        isActive: service.isActive,
        totalTransactions: service._count.transactions,
        earnTransactions: earnTransactions.length,
        burnTransactions: burnTransactions.length,
        totalPointsEarned,
        totalPointsBurned,
        totalAmount,
        avgPointsPerTransaction:
          service._count.transactions > 0
            ? (totalPointsEarned + totalPointsBurned) / service._count.transactions
            : 0,
      };
    });
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagementMetrics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalUsers, activeUsersLast30Days, newUsersLast30Days, usersWithTransactions] =
      await Promise.all([
        prisma.user.count({ where: { deletedAt: null } }),
        prisma.wallet.count({
          where: {
            lastActivity: {
              gte: thirtyDaysAgo,
            },
          },
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: thirtyDaysAgo,
            },
            deletedAt: null,
          },
        }),
        prisma.user.count({
          where: {
            deletedAt: null,
            transactions: {
              some: {
                deletedAt: null,
              },
            },
          },
        }),
      ]);

    // Get top users by points
    const topUsers = await prisma.wallet.findMany({
      orderBy: {
        balance: 'desc',
      },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        _count: {
          select: {
            pointBalances: true,
          },
        },
      },
    });

    const avgTransactionsPerUser =
      totalUsers > 0
        ? (await prisma.transaction.count({ where: { deletedAt: null } })) / totalUsers
        : 0;

    return {
      totalUsers,
      activeUsersLast30Days,
      newUsersLast30Days,
      usersWithTransactions,
      avgTransactionsPerUser,
      topUsers: topUsers.map((w) => ({
        userId: w.user.id,
        userName: `${w.user.first_name} ${w.user.last_name}`,
        userEmail: w.user.email,
        balance: Number(w.balance),
        totalEarned: Number(w.totalEarned),
        totalBurned: Number(w.totalBurned),
        activeBalances: w._count.pointBalances,
      })),
    };
  }

  /**
   * Get expiry analytics
   */
  async getExpiryAnalytics() {
    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      pointsExpiring7Days,
      pointsExpiring30Days,
      pointsExpiredLast30Days,
      totalExpiredPoints,
      affectedUsers,
    ] = await Promise.all([
      prisma.pointBalance.aggregate({
        where: {
          expiresAt: {
            gte: now,
            lte: next7Days,
          },
          points: { gt: 0 },
          isExpired: false,
        },
        _sum: { points: true },
      }),
      prisma.pointBalance.aggregate({
        where: {
          expiresAt: {
            gte: now,
            lte: next30Days,
          },
          points: { gt: 0 },
          isExpired: false,
        },
        _sum: { points: true },
      }),
      prisma.transaction.aggregate({
        where: {
          type: 'EXPIRED',
          createdAt: {
            gte: thirtyDaysAgo,
          },
          deletedAt: null,
        },
        _sum: { points: true },
      }),
      prisma.wallet.aggregate({
        _sum: { totalExpired: true },
      }),
      prisma.wallet.count({
        where: {
          totalExpired: { gt: 0 },
        },
      }),
    ]);

    return {
      pointsExpiringNext7Days: Number(pointsExpiring7Days._sum.points || 0),
      pointsExpiringNext30Days: Number(pointsExpiring30Days._sum.points || 0),
      pointsExpiredLast30Days: Number(pointsExpiredLast30Days._sum.points || 0),
      totalExpiredPoints: Number(totalExpiredPoints._sum.totalExpired || 0),
      affectedUsers,
    };
  }

  /**
   * Get transaction trends
   */
  async getTransactionTrends(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        deletedAt: null,
      },
      select: {
        type: true,
        points: true,
        amount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date
    const trendsByDate = transactions.reduce((acc: any, t) => {
      const date = t.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          earnTransactions: 0,
          burnTransactions: 0,
          pointsEarned: 0,
          pointsBurned: 0,
          totalAmount: 0,
        };
      }

      if (t.type === 'EARN') {
        acc[date].earnTransactions += 1;
        acc[date].pointsEarned += Number(t.points || 0);
        acc[date].totalAmount += Number(t.amount || 0);
      } else if (t.type === 'BURN') {
        acc[date].burnTransactions += 1;
        acc[date].pointsBurned += Number(t.points || 0);
      }

      return acc;
    }, {});

    return Object.values(trendsByDate);
  }
}
