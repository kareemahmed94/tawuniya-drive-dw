/**
 * Admin API Client
 * Type-safe API client for admin operations
 */

import type { AdminRole, ServiceCategory } from '@prisma/client';

// ==================== Types ====================

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuthResponse {
  admin: AdminUser;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  isActive: boolean;
  iconUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  serviceId: string;
  serviceName?: string;
  type: 'EARN' | 'BURN' | 'EXPIRED' | 'ADJUSTMENT';
  amount: number;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  metadata: Record<string, unknown> | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  username: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  wallet?: {
    id: string;
    balance: number;
    totalEarned: number;
    totalBurned: number;
  } | null;
}

export interface GlobalConfig {
  id: string;
  key: string;
  value: string;
  type: 'SYSTEM' | 'BUSINESS' | 'FEATURE';
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceConfig {
  id: string;
  serviceId: string;
  serviceName?: string;
  ruleType: 'EARN' | 'BURN';
  pointsPerUnit: number;
  unitAmount: number;
  minAmount?: number | null;
  maxPoints?: number | null;
  expiryDays?: number | null;
  isActive: boolean;
  validFrom: string;
  validUntil?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==================== Auth API ====================

export class AdminApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl = '/api/admin') {
    this.baseUrl = baseUrl;

    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('admin_token', token);
      } else {
        localStorage.removeItem('admin_token');
      }
    }
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Make authenticated request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
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

  // ==================== Authentication ====================

  /**
   * Login admin
   */
  async login(email: string, password: string): Promise<ApiResponse<AdminAuthResponse>> {
    const response = await this.request<AdminAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

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
    const response = await this.request<AdminAuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      this.setToken(response.data.token);
    }

    return response;
  }

  /**
   * Get admin profile
   */
  async getProfile(): Promise<ApiResponse<AdminUser>> {
    return this.request<AdminUser>('/auth/profile');
  }

  /**
   * Logout admin
   */
  logout() {
    this.setToken(null);
  }

  // ==================== Admin Management ====================

  /**
   * Get all admins
   */
  async getAdmins(params?: {
    page?: number;
    limit?: number;
    role?: AdminRole;
    search?: string;
  }): Promise<ApiResponse<{
    data: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.request(`/admins${query ? `?${query}` : ''}`);
  }

  /**
   * Get admin by ID
   */
  async getAdminById(id: string): Promise<ApiResponse<AdminUser>> {
    return this.request<AdminUser>(`/admins/${id}`);
  }

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
    return this.request<AdminUser>('/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

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
    return this.request<AdminUser>(`/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete admin
   */
  async deleteAdmin(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/admins/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Service Management ====================

  /**
   * Get all services
   */
  async getServices(params?: {
    page?: number;
    limit?: number;
    category?: ServiceCategory;
    isActive?: boolean;
    search?: string;
  }): Promise<ApiResponse<{
    data: Service[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.request(`/services${query ? `?${query}` : ''}`);
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: string): Promise<ApiResponse<Service>> {
    return this.request<Service>(`/services/${id}`);
  }

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
    return this.request(`/services/${id}/details`);
  }

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
    return this.request<Service>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

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
    return this.request<Service>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete service
   */
  async deleteService(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/services/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Toggle service status
   */
  async toggleServiceStatus(id: string, isActive: boolean): Promise<ApiResponse<Service>> {
    return this.request<Service>(`/services/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  // ==================== Transaction Management ====================

  /**
   * Get all transactions
   */
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    serviceId?: string;
    type?: 'EARN' | 'BURN' | 'EXPIRED' | 'ADJUSTMENT';
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    minPoints?: number;
    maxPoints?: number;
  }): Promise<ApiResponse<{
    data: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.minAmount) queryParams.append('minAmount', params.minAmount.toString());
    if (params?.maxAmount) queryParams.append('maxAmount', params.maxAmount.toString());
    if (params?.minPoints) queryParams.append('minPoints', params.minPoints.toString());
    if (params?.maxPoints) queryParams.append('maxPoints', params.maxPoints.toString());

    const query = queryParams.toString();
    return this.request(`/transactions${query ? `?${query}` : ''}`);
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>(`/transactions/${id}`);
  }

  /**
   * Update transaction
   */
  async updateTransaction(id: string, data: {
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
    description?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStatistics(params?: {
    startDate?: string;
    endDate?: string;
    serviceId?: string;
  }): Promise<ApiResponse<{
    total: number;
    byType: {
      EARN: number;
      BURN: number;
      EXPIRED: number;
      ADJUSTMENT: number;
    };
    byStatus: {
      PENDING: number;
      COMPLETED: number;
      FAILED: number;
      REVERSED: number;
    };
    totalAmount: number;
    totalPoints: number;
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId);

    const query = queryParams.toString();
    return this.request(`/transactions/statistics${query ? `?${query}` : ''}`);
  }

  /**
   * Get transaction trends
   */
  async getTransactionTrends(params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    date: string;
    count: number;
    points: number;
    amount: number;
  }[]>> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.request(`/transactions/trends${query ? `?${query}` : ''}`);
  }

  /**
   * Export transactions to CSV
   */
  async exportTransactions(params?: {
    userId?: string;
    serviceId?: string;
    type?: 'EARN' | 'BURN' | 'EXPIRED' | 'ADJUSTMENT';
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
    startDate?: string;
    endDate?: string;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    const response = await fetch(`${this.baseUrl}/transactions/export${query ? `?${query}` : ''}`, {
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export transactions');
    }

    return response.blob();
  }

  // ==================== User Management ====================

  /**
   * Get all users
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{
    data: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const query = queryParams.toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`);
  }

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
  }): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Toggle user status
   */
  async toggleUserStatus(id: string, isActive: boolean): Promise<ApiResponse<User>> {
    return this.request<User>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
  }>> {
    return this.request('/users/statistics');
  }

  // ==================== Dashboard ====================

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<{
    totalUsers: number;
    totalTransactions: number;
    totalRevenue: number;
    activeServices: number;
    pendingTransactions: number;
    monthlyGrowth: number;
  }>> {
    return this.request('/dashboard/stats');
  }

  // ==================== GlobalConfig Management ====================

  /**
   * Get all global configs
   */
  async getGlobalConfigs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'SYSTEM' | 'BUSINESS' | 'FEATURE';
    isActive?: boolean;
  }): Promise<ApiResponse<{
    data: GlobalConfig[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const query = queryParams.toString();
    return this.request(`/global-configs${query ? `?${query}` : ''}`);
  }

  /**
   * Get global config by ID
   */
  async getGlobalConfigById(id: string): Promise<ApiResponse<GlobalConfig>> {
    return this.request<GlobalConfig>(`/global-configs/${id}`);
  }

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
    return this.request<GlobalConfig>('/global-configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

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
    return this.request<GlobalConfig>(`/global-configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete global config
   */
  async deleteGlobalConfig(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/global-configs/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Toggle global config status
   */
  async toggleGlobalConfigStatus(id: string, isActive: boolean): Promise<ApiResponse<GlobalConfig>> {
    return this.request<GlobalConfig>(`/global-configs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  // ==================== ServiceConfig Management ====================

  /**
   * Get all service configs
   */
  async getServiceConfigs(params?: {
    page?: number;
    limit?: number;
    serviceId?: string;
    ruleType?: 'EARN' | 'BURN';
    isActive?: boolean;
  }): Promise<ApiResponse<{
    data: ServiceConfig[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.serviceId) queryParams.append('serviceId', params.serviceId);
    if (params?.ruleType) queryParams.append('ruleType', params.ruleType);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

    const query = queryParams.toString();
    return this.request(`/service-configs${query ? `?${query}` : ''}`);
  }

  /**
   * Get service config by ID
   */
  async getServiceConfigById(id: string): Promise<ApiResponse<ServiceConfig>> {
    return this.request<ServiceConfig>(`/service-configs/${id}`);
  }

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
  }): Promise<ApiResponse<ServiceConfig>> {
    return this.request<ServiceConfig>('/service-configs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

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
  }): Promise<ApiResponse<ServiceConfig>> {
    return this.request<ServiceConfig>(`/service-configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete service config
   */
  async deleteServiceConfig(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/service-configs/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Toggle service config status
   */
  async toggleServiceConfigStatus(id: string, isActive: boolean): Promise<ApiResponse<ServiceConfig>> {
    return this.request<ServiceConfig>(`/service-configs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  // ==================== Analytics ====================

  /**
   * Get service analytics
   */
  async getServiceAnalytics(): Promise<ApiResponse<ServiceAnalytics[]>> {
    return this.request<ServiceAnalytics[]>('/analytics/services');
  }

  /**
   * Get user engagement metrics
   */
  async getUserEngagementMetrics(): Promise<ApiResponse<UserEngagementMetrics>> {
    return this.request<UserEngagementMetrics>('/analytics/engagement');
  }

  /**
   * Get expiry analytics
   */
  async getExpiryAnalytics(): Promise<ApiResponse<ExpiryAnalytics>> {
    return this.request<ExpiryAnalytics>('/analytics/expiry');
  }

  /**
   * Get transaction trends
   */
  async getTransactionTrends(days?: number): Promise<ApiResponse<TransactionTrend[]>> {
    const query = days ? `?days=${days}` : '';
    return this.request<TransactionTrend[]>(`/analytics/trends${query}`);
  }
}

// Analytics Types
export interface ServiceAnalytics {
  id: string;
  name: string;
  category: string;
  isActive: boolean;
  totalTransactions: number;
  earnTransactions: number;
  burnTransactions: number;
  totalPointsEarned: number;
  totalPointsBurned: number;
  totalAmount: number;
  avgPointsPerTransaction: number;
}

export interface UserEngagementMetrics {
  totalUsers: number;
  activeUsersLast30Days: number;
  newUsersLast30Days: number;
  usersWithTransactions: number;
  avgTransactionsPerUser: number;
  topUsers: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    balance: number;
    totalEarned: number;
    totalBurned: number;
    activeBalances: number;
  }>;
}

export interface ExpiryAnalytics {
  pointsExpiringNext7Days: number;
  pointsExpiringNext30Days: number;
  pointsExpiredLast30Days: number;
  totalExpiredPoints: number;
  affectedUsers: number;
}

export interface TransactionTrend {
  date: string;
  earnTransactions: number;
  burnTransactions: number;
  pointsEarned: number;
  pointsBurned: number;
  totalAmount: number;
}

// Singleton instance
export const adminApi = new AdminApiClient();

