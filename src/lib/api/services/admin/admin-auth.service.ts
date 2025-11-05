import { adminRequest } from '../admin-request';
import type { AdminUser, AdminAuthResponse } from '@/lib/api/types';
import type { AdminRole } from '@prisma/client';
import type { ApiResponse } from '@/lib/api/client';

/**
 * Admin Authentication Service
 */
export const adminAuthService = {
  /**
   * Login admin
   */
  async login(email: string, password: string): Promise<ApiResponse<AdminAuthResponse>> {
    const response = await adminRequest<AdminAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', response.data.token);
      }
    }

    return response;
  },

  /**
   * Register admin
   */
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: AdminRole;
  }): Promise<ApiResponse<AdminAuthResponse>> {
    const response = await adminRequest<AdminAuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_token', response.data.token);
      }
    }

    return response;
  },

  /**
   * Get admin profile
   */
  async getProfile(): Promise<ApiResponse<AdminUser>> {
    return adminRequest<AdminUser>('/auth/profile');
  },

  /**
   * Logout admin
   */
  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  },

  /**
   * Get admin token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token');
    }
    return null;
  },
};

