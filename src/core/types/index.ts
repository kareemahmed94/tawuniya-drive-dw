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

