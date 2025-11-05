/**
 * API Type Definitions
 * Mirrors backend types for type safety
 */

import type { AdminRole } from '@prisma/client';

export type { AdminRole };

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'CUSTOMER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalBurned: number;
  totalExpired: number;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  category: ServiceCategory;
  isActive: boolean;
  iconUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ServiceCategory = 
  | 'INSURANCE' 
  | 'CAR_WASH' 
  | 'TOWING' 
  | 'RENTAL' 
  | 'MAINTENANCE' 
  | 'OTHER';

export interface ServiceConfig {
  id: string;
  serviceId: string;
  ruleType: 'EARN' | 'BURN';
  pointsPerUnit: number;
  unitAmount: number;
  minAmount?: number;
  maxPoints?: number;
  expiryDays?: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  serviceId: string;
  type: TransactionType;
  amount: number;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  metadata?: any;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  service?: {
    id: string;
    name: string;
    category: ServiceCategory;
    iconUrl?: string;
  };
}

export type TransactionType = 'EARN' | 'BURN' | 'EXPIRED' | 'ADJUSTMENT';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

export interface PointBalance {
  id: string;
  walletId: string;
  points: number;
  earnedAt: string;
  expiresAt?: string;
  isExpired: boolean;
  transactionId: string;
  transaction?: {
    id: string;
    createdAt: string;
    service: {
      name: string;
      category: ServiceCategory;
    };
  };
}

export interface WalletStatistics {
  currentBalance: number;
  totalEarned: number;
  totalBurned: number;
  totalExpired: number;
  lastActivity: string;
  recentActivity: {
    earned: number;
    burned: number;
    period: string;
  };
  expiringSoon: {
    points: number;
    within: string;
  };
}

export interface SystemKPIs {
  users: {
    total: number;
  };
  wallets: {
    total: number;
    active: number;
    activePercentage: number;
  };
  points: {
    totalBalance: number;
    totalEarned: number;
    totalBurned: number;
    totalExpired: number;
    averageBalance: number;
  };
  transactions: {
    earned: {
      count: number;
      points: number;
    };
    burned: {
      count: number;
      points: number;
    };
    expired: {
      count: number;
      points: number;
    };
    recentActivity: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface EarnPointsRequest {
  userId: string;
  serviceId: string;
  amount: number;
  description?: string;
  metadata?: any;
}

export interface BurnPointsRequest {
  userId: string;
  serviceId: string;
  points: number;
  description?: string;
  metadata?: any;
}

// ==================== Admin Types ====================

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

export interface AdminUserExtended extends User {
  firstName: string;
  lastName: string;
  username: string;
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

export interface ServiceConfigExtended extends ServiceConfig {
  serviceName?: string;
}

export interface TransactionExtended extends Transaction {
  userName?: string;
  userEmail?: string;
  serviceName?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
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

export interface DashboardStats {
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  activeServices: number;
  pendingTransactions: number;
  monthlyGrowth: number;
}

