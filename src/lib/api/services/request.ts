import { ApiResponse } from '../client';

/**
 * API Base URL
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Make authenticated request
 */
export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Get token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies in requests
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 - Unauthorized
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          // Clear auth data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          
          // Only redirect if not already on login page
          // Middleware will handle redirect for protected pages
          if (!window.location.pathname.startsWith('/auth/')) {
            window.location.href = '/auth/login';
          }
        }
      }

      throw new Error(data.error || 'Request failed');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error');
  }
}

