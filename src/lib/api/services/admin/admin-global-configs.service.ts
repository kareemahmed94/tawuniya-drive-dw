import { adminRequest } from '../admin-request';
import type { GlobalConfig, PaginatedResponse } from '@/lib/api/types';
import type { ApiResponse } from '@/lib/api/client';

/**
 * Admin Global Configs Management Service
 */
export const adminGlobalConfigsService = {
  /**
   * Get all global configs
   */
  async getGlobalConfigs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'SYSTEM' | 'BUSINESS' | 'FEATURE';
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<GlobalConfig>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const query = queryParams.toString();
    return adminRequest<PaginatedResponse<GlobalConfig>>(`/global-configs${query ? `?${query}` : ''}`);
  },

  /**
   * Get global config by ID
   */
  async getGlobalConfigById(id: string): Promise<ApiResponse<GlobalConfig>> {
    return adminRequest<GlobalConfig>(`/global-configs/${id}`);
  },

  /**
   * Create global config
   */
  async createGlobalConfig(data: {
    key: string;
    value: string;
    type: 'SYSTEM' | 'BUSINESS' | 'FEATURE';
    description?: string | null;
    isActive?: boolean;
  }): Promise<ApiResponse<GlobalConfig>> {
    return adminRequest<GlobalConfig>('/global-configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update global config
   */
  async updateGlobalConfig(id: string, data: {
    key?: string;
    value?: string;
    type?: 'SYSTEM' | 'BUSINESS' | 'FEATURE';
    description?: string | null;
    isActive?: boolean;
  }): Promise<ApiResponse<GlobalConfig>> {
    return adminRequest<GlobalConfig>(`/global-configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete global config
   */
  async deleteGlobalConfig(id: string): Promise<ApiResponse<void>> {
    return adminRequest<void>(`/global-configs/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle global config status
   */
  async toggleGlobalConfigStatus(id: string, isActive: boolean): Promise<ApiResponse<GlobalConfig>> {
    return adminRequest<GlobalConfig>(`/global-configs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },
};

