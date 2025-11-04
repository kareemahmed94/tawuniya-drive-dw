import { RegisterInput, LoginInput, UpdateProfileInput } from '@/core/validators/auth.validator';

/**
 * Authentication Service Interface
 * Defines business logic operations for user authentication
 */
export interface IAuthService {
  /**
   * Register a new user
   */
  register(data: RegisterInput): Promise<{
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      isActive: boolean;
      createdAt: string | null;
      updatedAt: string | null;
    };
    token: string;
  }>;

  /**
   * Login user with credentials
   */
  login(data: LoginInput): Promise<{
    user: {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      isActive: boolean;
      createdAt: string | null;
      updatedAt: string | null;
    };
    token: string;
  }>;

  /**
   * Get user profile
   */
  getProfile(userId: string): Promise<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    isActive: boolean;
    createdAt: string | null;
    updatedAt: string | null;
    wallet: {
      id: string;
      balance: number;
      totalEarned: number;
      totalBurned: number;
      totalExpired: number;
      lastActivity: string | null;
    } | null;
  }>;

  /**
   * Update user profile
   */
  updateProfile(userId: string, data: UpdateProfileInput): Promise<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    isActive: boolean;
    createdAt: string | null;
    updatedAt: string | null;
  }>;
}

