/**
 * API Type Definitions
 * Mirrors backend types for type safety
 */

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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
