import { injectable, inject } from 'inversify';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TYPES } from '@/core/di/types';
import type { IAuthService } from '@/core/interfaces/services/IAuthService';
import type { IUserRepository } from '@/core/interfaces/repositories/IUserRepository';
import type { IWalletRepository } from '@/core/interfaces/repositories/IWalletRepository';
import { config } from '@/core/config/environment';
import { AppError } from '@/core/middleware/errorHandler';
import { RegisterInput, LoginInput, UpdateProfileInput } from '@/core/validators/auth.validator';
import { JwtPayload } from '@/core/types';
import logger from '@/core/utils/logger';
import { prisma } from '@/core/config/database';
import { AuthUserResource } from '@/core/resources';

/**
 * Authentication Service Implementation
 * Handles user registration, login, and token generation
 * Uses Dependency Injection for repositories
 * Follows SOLID principles: SRP, DIP, OCP
 */
@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.WalletRepository) private walletRepository: IWalletRepository
  ) {}

  /**
   * Register a new user
   * Creates user account and wallet in a transaction
   */
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmailOrPhone(
      data.email,
      data.phone
    );

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new AppError('Email already registered', 409);
      }
      if (existingUser.phone === data.phone) {
        throw new AppError('Phone number already registered', 409);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user and wallet in transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          username: `${data.first_name}_${data.last_name}`,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Create wallet
      await tx.wallet.create({
        data: {
          userId: newUser.id,
          balance: 0,
        },
      });

      return newUser;
    });

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info(`User registered successfully: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: 'CUSTOMER' as const, // New users are always CUSTOMER
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      token,
    };
  }

  /**
   * Login user
   * Validates credentials and returns JWT token
   */
  async login(data: LoginInput) {
    // Find user by email
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
    });

    logger.info(`User logged in successfully: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: 'CUSTOMER' as const, // Users are always customers (no role in User model)
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      token,
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const user = await this.userRepository.findByIdWithWallet(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Transform user data with wallet using Resource
    return new AuthUserResource(user).toArray();
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileInput) {
    const existingUser = await this.userRepository.findById(userId);

    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    if (!existingUser.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(data.email);
      if (emailExists) {
        throw new AppError('User with this email already exists', 409);
      }
    }

    // Check if phone is being changed and if it already exists
    if (data.phone !== undefined && data.phone !== existingUser.phone) {
      if (data.phone) {
        const phoneExists = await this.userRepository.findByPhone(data.phone);
        if (phoneExists) {
          throw new AppError('User with this phone number already exists', 409);
        }
      }
    }

    // Prepare update data
    const updateData: Partial<typeof existingUser> = {};
    if (data.first_name !== undefined) updateData.first_name = data.first_name;
    if (data.last_name !== undefined) updateData.last_name = data.last_name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;

    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Update user
    const updatedUser = await this.userRepository.update(userId, updateData);

    logger.info(`User profile updated: ${updatedUser.email}`);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: `${updatedUser.first_name} ${updatedUser.last_name}`,
      phone: updatedUser.phone,
      isActive: updatedUser.isActive,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    };
  }

  /**
   * Generate JWT token
   * @private
   */
  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as object);
  }
}

// Export is now handled by serviceLocator.ts

