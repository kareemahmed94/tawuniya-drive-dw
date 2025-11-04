import type {
  PaginationParams,
  PaginatedResponse,
} from '../types/admin.types';

export interface UserResponse {
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

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  isActive?: boolean;
}

/**
 * User Management Service Interface
 * Handles CRUD operations for users in admin scope
 */
export interface IUserManagementService {
  /**
   * Create a new user
   */
  createUser(data: CreateUserInput): Promise<UserResponse>;

  /**
   * Get user by ID
   */
  getUserById(id: string): Promise<UserResponse>;

  /**
   * Get all users with pagination and filters
   */
  getAllUsers(
    params: PaginationParams,
    filters?: UserFilters
  ): Promise<PaginatedResponse<UserResponse>>;

  /**
   * Update user
   */
  updateUser(id: string, data: UpdateUserInput): Promise<UserResponse>;

  /**
   * Delete user (soft delete)
   */
  deleteUser(id: string): Promise<{ success: boolean; message: string }>;

  /**
   * Toggle user active status
   */
  toggleUserStatus(id: string, isActive: boolean): Promise<UserResponse>;

  /**
   * Get user statistics
   */
  getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }>;
}

