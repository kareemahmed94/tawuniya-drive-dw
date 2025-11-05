import { adminRequest } from '../admin-request';
import type { AdminUserExtended, PaginatedResponse } from '@/lib/api/types';
import type { ApiResponse } from '@/lib/api/client';

/**
 * Admin Users Management Service
 */
export const adminUsersService = {
  /**
   * Get all users
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<AdminUserExtended>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const query = queryParams.toString();
    return adminRequest<PaginatedResponse<AdminUserExtended>>(`/users${query ? `?${query}` : ''}`);
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<ApiResponse<AdminUserExtended>> {
    return adminRequest<AdminUserExtended>(`/users/${id}`);
  },

  /**
   * Create user
   */
  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<AdminUserExtended>> {
    return adminRequest<AdminUserExtended>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update user
   */
  async updateUser(id: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<AdminUserExtended>> {
    return adminRequest<AdminUserExtended>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return adminRequest<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle user status
   */
  async toggleUserStatus(id: string, isActive: boolean): Promise<ApiResponse<AdminUserExtended>> {
    return adminRequest<AdminUserExtended>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
  }>> {
    return adminRequest('/users/statistics');
  },
};

