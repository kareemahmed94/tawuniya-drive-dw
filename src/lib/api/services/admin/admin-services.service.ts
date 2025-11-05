import { adminRequest } from '../admin-request';
import type { Service, ServiceCategory, PaginatedResponse } from '@/lib/api/types';
import type { ApiResponse } from '@/lib/api/client';

/**
 * Admin Services Management Service
 */
export const adminServicesService = {
  /**
   * Get all services
   */
  async getServices(params?: {
    page?: number;
    limit?: number;
    category?: ServiceCategory;
    isActive?: boolean;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<Service>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return adminRequest<PaginatedResponse<Service>>(`/services${query ? `?${query}` : ''}`);
  },

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<ApiResponse<Service>> {
    return adminRequest<Service>(`/services/${id}`);
  },

  /**
   * Get service with details
   */
  async getServiceWithDetails(id: string): Promise<ApiResponse<Service & {
    configs: any[];
    stats: {
      totalTransactions: number;
      totalPointsEarned: number;
      totalPointsBurned: number;
      activeConfigs: number;
    };
  }>> {
    return adminRequest(`/services/${id}/details`);
  },

  /**
   * Create service
   */
  async createService(data: {
    name: string;
    description?: string | null;
    category: ServiceCategory;
    iconUrl?: string | null;
    isActive?: boolean;
  }): Promise<ApiResponse<Service>> {
    return adminRequest<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update service
   */
  async updateService(id: string, data: {
    name?: string;
    description?: string | null;
    category?: ServiceCategory;
    iconUrl?: string | null;
    isActive?: boolean;
  }): Promise<ApiResponse<Service>> {
    return adminRequest<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete service
   */
  async deleteService(id: string): Promise<ApiResponse<void>> {
    return adminRequest<void>(`/services/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle service status
   */
  async toggleServiceStatus(id: string, isActive: boolean): Promise<ApiResponse<Service>> {
    return adminRequest<Service>(`/services/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },
};

