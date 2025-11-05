import { adminRequest } from '../admin-request';
import type { ServiceConfigExtended, PaginatedResponse } from '@/lib/api/types';
import type { ApiResponse } from '@/lib/api/client';

/**
 * Admin Service Configs Management Service
 */
export const adminServiceConfigsService = {
  /**
   * Get all service configs
   */
  async getServiceConfigs(params?: {
    page?: number;
    limit?: number;
    serviceId?: string;
    ruleType?: 'EARN' | 'BURN';
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<ServiceConfigExtended>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId);
    if (params?.ruleType) queryParams.append('ruleType', params.ruleType);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const query = queryParams.toString();
    return adminRequest<PaginatedResponse<ServiceConfigExtended>>(`/service-configs${query ? `?${query}` : ''}`);
  },

  /**
   * Get service config by ID
   */
  async getServiceConfigById(id: string): Promise<ApiResponse<ServiceConfigExtended>> {
    return adminRequest<ServiceConfigExtended>(`/service-configs/${id}`);
  },

  /**
   * Create service config
   */
  async createServiceConfig(data: {
    serviceId: string;
    ruleType: 'EARN' | 'BURN';
    pointsPerUnit: number;
    unitAmount: number;
    minAmount?: number | null;
    maxPoints?: number | null;
    expiryDays?: number | null;
    isActive?: boolean;
    validFrom?: string;
    validUntil?: string | null;
  }): Promise<ApiResponse<ServiceConfigExtended>> {
    return adminRequest<ServiceConfigExtended>('/service-configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update service config
   */
  async updateServiceConfig(id: string, data: {
    serviceId?: string;
    ruleType?: 'EARN' | 'BURN';
    pointsPerUnit?: number;
    unitAmount?: number;
    minAmount?: number | null;
    maxPoints?: number | null;
    expiryDays?: number | null;
    isActive?: boolean;
    validFrom?: string;
    validUntil?: string | null;
  }): Promise<ApiResponse<ServiceConfigExtended>> {
    return adminRequest<ServiceConfigExtended>(`/service-configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete service config
   */
  async deleteServiceConfig(id: string): Promise<ApiResponse<void>> {
    return adminRequest<void>(`/service-configs/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle service config status
   */
  async toggleServiceConfigStatus(id: string, isActive: boolean): Promise<ApiResponse<ServiceConfigExtended>> {
    return adminRequest<ServiceConfigExtended>(`/service-configs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },
};

