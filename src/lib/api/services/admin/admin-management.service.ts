import { adminRequest } from '../admin-request';
import type { AdminUser, PaginatedResponse, AdminRole } from '@/lib/api/types';
import type { ApiResponse } from '@/lib/api/client';

/**
 * Admin Management Service
 */
export const adminManagementService = {
  /**
   * Get all admins
   */
  async getAdmins(params?: {
    page?: number;
    limit?: number;
    role?: AdminRole;
    search?: string;
  }): Promise<ApiResponse<PaginatedResponse<AdminUser>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return adminRequest<PaginatedResponse<AdminUser>>(`/admins${query ? `?${query}` : ''}`);
  },

  /**
   * Get admin by ID
   */
  async getAdminById(id: string): Promise<ApiResponse<AdminUser>> {
    return adminRequest<AdminUser>(`/admins/${id}`);
  },

  /**
   * Create admin
   */
  async createAdmin(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: AdminRole;
  }): Promise<ApiResponse<AdminUser>> {
    return adminRequest<AdminUser>('/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update admin
   */
  async updateAdmin(id: string, data: {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
    role?: AdminRole;
  }): Promise<ApiResponse<AdminUser>> {
    return adminRequest<AdminUser>(`/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete admin
   */
  async deleteAdmin(id: string): Promise<ApiResponse<void>> {
    return adminRequest<void>(`/admins/${id}`, {
      method: 'DELETE',
    });
  },
};

