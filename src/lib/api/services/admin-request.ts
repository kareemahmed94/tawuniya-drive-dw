import type { ApiResponse } from '../client';

/**
 * Admin API Base URL
 */
const ADMIN_API_BASE_URL = '/api/admin';

/**
 * Make authenticated admin request
 */
export async function adminRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Get admin token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 - Unauthorized
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
          if (!window.location.pathname.startsWith('/admin/login')) {
            window.location.href = '/admin/login';
          }
        }
      }

      return {
        success: false,
        error: data.error || 'Request failed',
        errors: data.errors,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

