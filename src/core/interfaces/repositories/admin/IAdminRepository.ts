import { Prisma, Admin, AdminRole } from '@prisma/client';
import type { PaginationParams, AdminFilters } from '@/core/types/admin.types';

/**
 * Admin Repository Interface
 * Defines data access methods for Admin entity
 * Follows Repository Pattern for admin scope
 */
export interface IAdminRepository {
  /**
   * Find admin by ID
   */
  findById(id: string): Promise<Admin | null>;

  /**
   * Find admin by email
   */
  findByEmail(email: string): Promise<Admin | null>;

  /**
   * Find admin by phone
   */
  findByPhone(phone: string): Promise<Admin | null>;

  /**
   * Find admin by email or phone
   */
  findByEmailOrPhone(email: string, phone?: string): Promise<Admin | null>;

  /**
   * Check if email exists (optionally excluding an ID)
   */
  emailExists(email: string, excludeId?: string): Promise<boolean>;

  /**
   * Check if phone exists (optionally excluding an ID)
   */
  phoneExists(phone: string, excludeId?: string): Promise<boolean>;

  /**
   * Create new admin
   */
  create(data: Prisma.AdminUncheckedCreateInput): Promise<Admin>;

  /**
   * Update admin
   */
  update(id: string, data: Partial<Admin>): Promise<Admin>;

  /**
   * Soft delete admin (sets deletedAt)
   */
  remove(id: string): Promise<void>;

  /**
   * Find all admins with pagination and filters
   */
  findAll(
    params: PaginationParams,
    filters?: AdminFilters
  ): Promise<{ data: Admin[]; total: number }>;

  /**
   * Count admins by role (or total if no role specified)
   */
  countByRole(role?: AdminRole): Promise<number>;
}
