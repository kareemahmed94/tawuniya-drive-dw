import { adminRequest } from '../admin-request';
import type {
  DashboardStats,
  ServiceAnalytics,
  UserEngagementMetrics,
  ExpiryAnalytics,
  TransactionTrend,
} from '@/lib/api/types';
import type { ApiResponse } from '@/lib/api/client';

/**
 * Admin Analytics Service
 */
export const adminAnalyticsService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return adminRequest<DashboardStats>('/dashboard/stats');
  },

  /**
   * Get service analytics
   */
  async getServiceAnalytics(): Promise<ApiResponse<ServiceAnalytics[]>> {
    return adminRequest<ServiceAnalytics[]>('/analytics/services');
  },

  /**
   * Get user engagement metrics
   */
  async getUserEngagementMetrics(): Promise<ApiResponse<UserEngagementMetrics>> {
    return adminRequest<UserEngagementMetrics>('/analytics/engagement');
  },

  /**
   * Get expiry analytics
   */
  async getExpiryAnalytics(): Promise<ApiResponse<ExpiryAnalytics>> {
    return adminRequest<ExpiryAnalytics>('/analytics/expiry');
  },

  /**
   * Get transaction trends
   */
  async getTransactionTrends(days?: number): Promise<ApiResponse<TransactionTrend[]>> {
    const query = days ? `?days=${days}` : '';
    return adminRequest<TransactionTrend[]>(`/analytics/trends${query}`);
  },
};

