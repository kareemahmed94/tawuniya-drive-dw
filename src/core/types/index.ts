import { Request } from 'express';

/**
 * Extended Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

/**
 * Standard API response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  stack?: string;
}

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Point calculation result
 */
export interface PointCalculation {
  points: number;
  expiresAt: Date | null;
  rule: {
    pointsPerUnit: number;
    unitAmount: number;
    expiryDays: number | null;
  };
}

/**
 * Wallet Statistics Response
 */
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

/**
 * Wallet Response
 */
export interface WalletResponse {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalBurned: number;
  totalExpired: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Point Balance Response
 */
export interface PointBalanceResponse {
  id: string;
  points: number;
  earnedAt: Date;
  expiresAt: Date | null;
  daysUntilExpiry: number | null;
}

/**
 * Transaction Aggregate Statistics
 */
export interface TransactionAggregateStats {
  totalTransactions: number;
  totalPoints: number;
  earnedPoints: number;
  burnedPoints: number;
}

/**
 * Service Config Response
 */
export interface ServiceConfigResponse {
  id: string;
  serviceId: string;
  ruleType: string;
  pointsPerUnit: number;
  unitAmount: number;
  minAmount: number | null;
  maxPoints: number | null;
  expiryDays: number | null;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service with Configs Response
 */
export interface ServiceWithConfigsResponse {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isActive: boolean;
  iconUrl: string | null;
  configs: ServiceConfigResponse[];
}

/**
 * Transaction with Service Response
 */
export interface TransactionWithServiceResponse {
  id: string;
  userId: string;
  serviceId: string;
  type: string;
  amount: number;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  metadata: Record<string, unknown> | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  service: {
    id: string;
    name: string;
    category: string;
    iconUrl: string | null;
  };
}

/**
 * Transaction Response (simplified)
 */
export interface TransactionResponse {
  id: string;
  userId: string;
  serviceId: string;
  type: string;
  amount: number | null;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string | null;
  metadata: Record<string, unknown> | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  service?: {
    id: string;
    name: string;
    category: string;
    iconUrl: string | null;
  };
}

/**
 * Transaction Pagination Response
 */
export interface TransactionPaginationResponse {
  transactions: TransactionResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Wallet with Stats Response (includes point balances)
 */
export interface WalletWithStatsResponse {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalBurned: number;
  totalExpired: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
  pointBalances: Array<{
    id: string;
    points: number;
    earnedAt: Date;
    expiresAt: Date | null;
  }>;
}


/**
 * Service with Transaction Count Response
 */
export interface ServiceWithTransactionCountResponse {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isActive: boolean;
  iconUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    transactions: number;
  };
}

// Re-export admin types for convenience
export * from './admin.types';

