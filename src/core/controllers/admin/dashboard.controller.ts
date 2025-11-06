import { injectable, inject } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { TYPES } from '@/core/di/types';
import type { IDashboardService } from '@/core/interfaces/services/admin/IDashboardService';
import { verifyAdminToken } from '@/lib/api/middleware';
import { prisma } from '@/core/config/database';
import { BaseController } from '@/core/controllers/base.controller';

/**
 * Dashboard Controller
 * Handles HTTP layer for dashboard statistics and analytics
 */
@injectable()
export class DashboardController extends BaseController {
  constructor(
    @inject(TYPES.DashboardService) private dashboardService: IDashboardService
  ) {
    super();
  }
  /**
   * Get dashboard statistics
   * GET /api/admin/dashboard/stats
   */
  async getDashboardStats(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Get all statistics in parallel
      const [
        totalUsers,
        activeUsers,
        totalTransactions,
        pendingTransactions,
        activeServices,
        totalRevenue,
        monthlyGrowth,
      ] = await Promise.all([
        // Total users
        prisma.user.count({
          where: { deletedAt: null },
        }),
        // Active users
        prisma.user.count({
          where: { deletedAt: null, isActive: true },
        }),
        // Total transactions
        prisma.transaction.count({
          where: { deletedAt: null },
        }),
        // Pending transactions
        prisma.transaction.count({
          where: { deletedAt: null, status: 'PENDING' },
        }),
        // Active services
        prisma.service.count({
          where: { deletedAt: null, isActive: true },
        }),
        // Total revenue (sum of all transaction amounts)
        prisma.transaction.aggregate({
          where: { deletedAt: null, status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        // Monthly growth (users created this month vs last month)
        (async () => {
          const now = new Date();
          const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

          const [thisMonth, lastMonth] = await Promise.all([
            prisma.user.count({
              where: {
                deletedAt: null,
                createdAt: { gte: startOfThisMonth },
              },
            }),
            prisma.user.count({
              where: {
                deletedAt: null,
                createdAt: { gte: startOfLastMonth, lt: startOfThisMonth },
              },
            }),
          ]);

          if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
          return ((thisMonth - lastMonth) / lastMonth) * 100;
        })(),
      ]);

      const stats = {
        totalUsers,
        totalTransactions,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        activeServices,
        pendingTransactions,
        monthlyGrowth: Math.round(monthlyGrowth * 10) / 10, // Round to 1 decimal
      };

      return NextResponse.json(
        {
          success: true,
          data: stats,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get system-wide KPIs
   * GET /api/admin/stats
   */
  async getSystemKPIs(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const stats = await this.dashboardService.getSystemKPIs();

      return NextResponse.json(
        {
          success: true,
          data: stats,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get service analytics
   * GET /api/admin/analytics/services
   */
  async getServiceAnalytics(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const analytics = await this.dashboardService.getServiceAnalytics();

      return NextResponse.json(
        {
          success: true,
          data: analytics,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user engagement metrics
   * GET /api/admin/analytics/engagement
   */
  async getUserEngagementMetrics(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const engagement = await this.dashboardService.getUserEngagementMetrics();

      return NextResponse.json(
        {
          success: true,
          data: engagement,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get expiry analytics
   * GET /api/admin/analytics/expiry
   */
  async getExpiryAnalytics(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const analytics = await this.dashboardService.getExpiryAnalytics();

      return NextResponse.json(
        {
          success: true,
          data: analytics,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get transaction trends
   * GET /api/admin/analytics/trends
   */
  async getTransactionTrends(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Get days parameter from query string
      const { searchParams } = new URL(request.url);
      const daysParam = searchParams.get('days');
      const days = daysParam ? parseInt(daysParam, 10) : 30;

      const trends = await this.dashboardService.getTransactionTrends(days);

      return NextResponse.json(
        {
          success: true,
          data: trends,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

}

// Controller instances are exported from @/core/di/adminControllerFactory

