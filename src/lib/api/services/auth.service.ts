import { LoginCredentials, RegisterData, AuthResponse, User } from '../types';
import { request } from './request';

/**
 * Authentication API Service
 */
export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data!;
  },

  /**
   * Get user profile
   */
  async getProfile(): Promise<User> {
    const response = await request<User>('/auth/profile', {
      method: 'GET',
    });
    return response.data!;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string | null;
    password?: string;
  }): Promise<User> {
    const response = await request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  /**
   * Save auth token to localStorage
   */
  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },

  /**
   * Save user data to localStorage
   */
  saveUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  /**
   * Get saved user from localStorage
   */
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  /**
   * Get saved token from localStorage
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  /**
   * Logout user
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

