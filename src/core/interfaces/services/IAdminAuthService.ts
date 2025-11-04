import type {
  AdminLoginInput,
  AdminRegisterInput,
  AdminAuthResponse,
  AdminResponse,
} from '../../types/admin.types';

/**
 * Admin Authentication Service Interface
 * Handles admin authentication and authorization
 */
export interface IAdminAuthService {
  /**
   * Register a new admin
   */
  register(data: AdminRegisterInput): Promise<AdminAuthResponse>;

  /**
   * Login admin with credentials
   */
  login(data: AdminLoginInput): Promise<AdminAuthResponse>;

  /**
   * Get admin profile
   */
  getProfile(adminId: string): Promise<AdminResponse>;

  /**
   * Verify admin token
   */
  verifyToken(token: string): Promise<{ adminId: string; email: string; role: string }>;

  /**
   * Refresh admin token
   */
  refreshToken(adminId: string): Promise<{ token: string }>;
}

