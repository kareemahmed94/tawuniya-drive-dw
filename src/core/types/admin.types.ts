import { AdminRole, ServiceCategory, RuleType, TransactionType, TransactionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Admin Types
 * Comprehensive type definitions for admin operations
 * NO 'any' types allowed!
 */

// ==================== Admin Entity Types ====================

export interface AdminEntity {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: AdminRole;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface AdminResponse {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuthResponse {
  admin: AdminResponse;
  token: string;
}

// ==================== Admin Input Types ====================

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  avatar?: string | null;
  role?: AdminRole;
}

export interface UpdateAdminInput {
  name?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  avatar?: string | null;
  role?: AdminRole;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminRegisterInput {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

// ==================== Service Types ====================

export interface ServiceEntity {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  isActive: boolean;
  iconUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ServiceResponse {
  id: string;
  name: string;
  description: string | null;
  category: ServiceCategory;
  isActive: boolean;
  iconUrl: string | null;
  createdAt: string;
  updatedAt: string;
  configsCount?: number;
  transactionsCount?: number;
}

export interface ServiceWithDetailsResponse extends ServiceResponse {
  configs: ServiceConfigResponse[];
  stats: {
    totalTransactions: number;
    totalPointsEarned: number;
    totalPointsBurned: number;
    activeConfigs: number;
  };
}

export interface CreateServiceInput {
  name: string;
  description?: string | null;
  category: ServiceCategory;
  iconUrl?: string | null;
  isActive?: boolean;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string | null;
  category?: ServiceCategory;
  iconUrl?: string | null;
  isActive?: boolean;
}

// ==================== Service Config Types ====================

export interface ServiceConfigEntity {
  id: string;
  serviceId: string;
  ruleType: RuleType;
  pointsPerUnit: Decimal;
  unitAmount: Decimal;
  minAmount: Decimal | null;
  maxPoints: Decimal | null;
  expiryDays: number | null;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ServiceConfigResponse {
  id: string;
  serviceId: string;
  serviceName?: string;
  ruleType: RuleType;
  pointsPerUnit: number;
  unitAmount: number;
  minAmount: number | null;
  maxPoints: number | null;
  expiryDays: number | null;
  isActive: boolean;
  validFrom: string;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceConfigInput {
  serviceId: string;
  ruleType: RuleType;
  pointsPerUnit: number;
  unitAmount: number;
  minAmount?: number | null;
  maxPoints?: number | null;
  expiryDays?: number | null;
  isActive?: boolean;
  validFrom?: Date;
  validUntil?: Date | null;
}

export interface UpdateServiceConfigInput {
  ruleType?: RuleType;
  pointsPerUnit?: number;
  unitAmount?: number;
  minAmount?: number | null;
  maxPoints?: number | null;
  expiryDays?: number | null;
  isActive?: boolean;
  validFrom?: Date;
  validUntil?: Date | null;
}

// ==================== Transaction Types ====================

export interface TransactionEntity {
  id: string;
  userId: string;
  serviceId: string;
  type: TransactionType;
  amount: Decimal;
  points: Decimal;
  balanceBefore: Decimal;
  balanceAfter: Decimal;
  description: string | null;
  metadata: Record<string, unknown> | null;
  status: TransactionStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TransactionResponse {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  serviceId: string;
  serviceName?: string;
  type: TransactionType;
  amount: number;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  metadata: Record<string, unknown> | null;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  userId?: string;
  serviceId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  minPoints?: number;
  maxPoints?: number;
}

export interface UpdateTransactionInput {
  status?: TransactionStatus;
  description?: string;
  metadata?: any;
}

// ==================== User Management Types (Admin View) ====================

export interface UserEntity {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  username: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  username: string;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithWalletResponse extends UserResponse {
  wallet: {
    id: string;
    balance: number;
    totalEarned: number;
    totalBurned: number;
    totalExpired: number;
    lastActivity: string;
  } | null;
}

export interface UpdateUserStatusInput {
  isActive: boolean;
}

// ==================== Dashboard & Analytics Types ====================

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
    growth: number; // percentage
  };
  transactions: {
    total: number;
    earned: number;
    burned: number;
    expired: number;
    pending: number;
    totalAmount: number;
    totalPoints: number;
  };
  services: {
    total: number;
    active: number;
    inactive: number;
    byCategory: Record<ServiceCategory, number>;
  };
  wallets: {
    totalBalance: number;
    totalEarned: number;
    totalBurned: number;
    totalExpired: number;
    averageBalance: number;
  };
}

export interface ServiceAnalytics {
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  stats: {
    totalTransactions: number;
    totalUsers: number;
    totalPointsEarned: number;
    totalPointsBurned: number;
    totalAmount: number;
    averageTransactionAmount: number;
    averagePointsPerTransaction: number;
  };
  trend: {
    period: string;
    transactions: number;
    points: number;
    amount: number;
  }[];
}

export interface UserEngagementMetrics {
  period: 'day' | 'week' | 'month' | 'year';
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  transactionsPerUser: number;
  pointsPerUser: number;
  engagementRate: number; // percentage
}

export interface ExpiryAnalytics {
  total: {
    expiredPoints: number;
    expiredAmount: number;
    expiringCount: number;
  };
  byPeriod: {
    next7Days: number;
    next30Days: number;
    next90Days: number;
  };
  byService: {
    serviceId: string;
    serviceName: string;
    expiredPoints: number;
    expiringPoints: number;
  }[];
}

// ==================== Pagination Types ====================

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==================== Filter Types ====================

export interface AdminFilters {
  role?: AdminRole;
  search?: string; // email or name
}

export interface ServiceFilters {
  category?: ServiceCategory;
  isActive?: boolean;
  search?: string; // name
}

export interface ServiceConfigFilters {
  serviceId?: string;
  ruleType?: RuleType;
  isActive?: boolean;
}

export interface UserFilters {
  isActive?: boolean;
  search?: string; // email, username, or name
  hasWallet?: boolean;
  minBalance?: number;
  maxBalance?: number;
}

// ==================== Bulk Operations ====================

export interface BulkUpdateResult {
  success: boolean;
  updated: number;
  failed: number;
  errors: string[];
}

export interface BulkDeleteResult {
  success: boolean;
  deleted: number;
  failed: number;
  errors: string[];
}

// ==================== Audit & Logging ====================

export interface AdminAction {
  adminId: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  timestamp: string;
}

// ==================== API Response Types ====================

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

