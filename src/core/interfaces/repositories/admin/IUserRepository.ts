import type { User, Prisma } from '@prisma/client';
import type { PaginationParams } from '@/core/types/admin.types';

export interface UserFilters {
  search?: string;
  isActive?: boolean;
}

/**
 * Admin User Repository Interface
 * Handles data access for User entity in admin scope
 */
export interface IAdminUserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find all users with pagination and filters
   */
  findAll(params: PaginationParams, filters?: UserFilters): Promise<{ data: User[]; total: number }>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by phone
   */
  findByPhone(phone: string): Promise<User | null>;

  /**
   * Check if email exists
   */
  emailExists(email: string, excludeId?: string): Promise<boolean>;

  /**
   * Check if phone exists
   */
  phoneExists(phone: string, excludeId?: string): Promise<boolean>;

  /**
   * Create user
   */
  create(data: Prisma.UserUncheckedCreateInput): Promise<User>;

  /**
   * Update user
   */
  update(id: string, data: Partial<User>): Promise<User>;

  /**
   * Soft delete user
   */
  remove(id: string): Promise<void>;

  /**
   * Check if user is active
   */
  isActive(id: string): Promise<boolean>;

  /**
   * Find user with wallet
   */
  findByIdWithWallet(id: string): Promise<Prisma.UserGetPayload<{ include: { wallet: true } }> | null>;

  /**
   * Count users by status
   */
  countByStatus(isActive?: boolean): Promise<number>;
}

