import { SystemKPIs } from '../types';
import { request } from './request';

/**
 * Admin API Service
 */
export const adminService = {
  /**
   * Get system KPIs
   */
  async getSystemKPIs(): Promise<SystemKPIs> {
    const response = await request<SystemKPIs>(
      '/admin/stats',
      { method: 'GET' }
    );
    return response.data!;
  },

  /**
   * Get service analytics
   */
  async getServiceAnalytics(): Promise<any[]> {
    const response = await request<any[]>(
      '/admin/analytics/services',
      { method: 'GET' }
    );
    return response.data!;
  },

  /**
   * Get user engagement metrics
   */
  async getUserEngagement(): Promise<any> {
    const response = await request<any>(
      '/admin/analytics/engagement',
      { method: 'GET' }
    );
    return response.data!;
  },

  /**
   * Get expiry analytics
   */
  async getExpiryAnalytics(): Promise<any> {
    const response = await request<any>(
      '/admin/analytics/expiry',
      { method: 'GET' }
    );
    return response.data!;
  },

  /**
   * Get transaction trends
   */
  async getTransactionTrends(days: number = 30): Promise<any> {
    const response = await request<any>(
      `/admin/analytics/trends?days=${days}`,
      { method: 'GET' }
    );
    return response.data!;
  },
};

