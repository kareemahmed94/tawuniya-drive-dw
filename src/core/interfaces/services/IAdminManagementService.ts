import type {
  CreateAdminInput,
  UpdateAdminInput,
  AdminResponse,
  AdminFilters,
  PaginationParams,
  PaginatedResponse,
} from '@/core/types/admin.types';

/**
 * Admin Management Service Interface
 * Handles CRUD operations for admin users
 */
export interface IAdminManagementService {
  /**
   * Create a new admin
   */
  createAdmin(data: CreateAdminInput): Promise<AdminResponse>;

  /**
   * Get admin by ID
   */
  getAdminById(id: string): Promise<AdminResponse>;

  /**
   * Get all admins with pagination and filters
   */
  getAllAdmins(
    params: PaginationParams,
    filters?: AdminFilters
  ): Promise<PaginatedResponse<AdminResponse>>;

  /**
   * Update admin
   */
  updateAdmin(id: string, data: UpdateAdminInput): Promise<AdminResponse>;

  /**
   * Delete admin
   */
  deleteAdmin(id: string): Promise<{ success: boolean; message: string }>;

  /**
   * Get admin statistics
   */
  getAdminStats(): Promise<{
    total: number;
    byRole: {
      SUPER_ADMIN: number;
      ADMIN: number;
      STAFF: number;
    };
  }>;
}

