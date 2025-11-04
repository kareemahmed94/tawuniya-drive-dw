import bcrypt from 'bcrypt';
import type { IAdminUserRepository } from '../../interfaces/repositories/admin/IUserRepository';
import type { IUserManagementService, CreateUserInput, UpdateUserInput, UserResponse, UserFilters } from '../../interfaces/services/IUserManagementService';
import type { PaginationParams, PaginatedResponse } from '../../types/admin.types';
import { Prisma } from '@prisma/client';

/**
 * User Management Service
 * Handles CRUD operations for users in admin scope
 */
export class UserManagementService implements IUserManagementService {
  constructor(private userRepository: IAdminUserRepository) {}

  async createUser(data: CreateUserInput): Promise<UserResponse> {
    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(data.email);
    if (emailExists) {
      throw new Error('User with this email already exists');
    }

    // Check if phone already exists
    if (data.phone) {
      const phoneExists = await this.userRepository.phoneExists(data.phone);
      if (phoneExists) {
        throw new Error('User with this phone number already exists');
      }
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Prepare user data for creation
    const userData: Prisma.UserUncheckedCreateInput = {
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      username: `${data.firstName}_${data.lastName}`,
      password: hashedPassword,
      phone: data.phone || null,
      isActive: data.isActive ?? true,
    };

    const user = await this.userRepository.create(userData);

    return this.mapToResponse(user);
  }

  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findByIdWithWallet(id);
    if (!user) {
      throw new Error('User not found');
    }

    return this.mapToResponse(user, user.wallet);
  }

  async getAllUsers(params: PaginationParams, filters?: UserFilters): Promise<PaginatedResponse<UserResponse>> {
    const result = await this.userRepository.findAll(params, filters);

    const data = result.data.map((user) => this.mapToResponse(user));
    const totalPages = Math.ceil(result.total / params.limit);

    return {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: result.total,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
    };
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<UserResponse> {
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.userRepository.emailExists(data.email, id);
      if (emailExists) {
        throw new Error('User with this email already exists');
      }
    }

    // Check if phone is being changed and if it already exists
    if (data.phone && data.phone !== existingUser.phone) {
      const phoneExists = await this.userRepository.phoneExists(data.phone, id);
      if (phoneExists) {
        throw new Error('User with this phone number already exists');
      }
    }

    // Prepare update data
    const updateData: Partial<Prisma.UserUpdateInput> = {};
    if (data.firstName !== undefined) updateData.first_name = data.firstName;
    if (data.lastName !== undefined) updateData.last_name = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const user = await this.userRepository.update(id, updateData as any);

    return this.mapToResponse(user);
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.remove(id);

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await this.userRepository.update(id, { isActive });

    return this.mapToResponse(updatedUser);
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active, inactive] = await Promise.all([
      this.userRepository.countByStatus(),
      this.userRepository.countByStatus(true),
      this.userRepository.countByStatus(false),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }

  private mapToResponse(user: any, wallet?: any): UserResponse {
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      username: user.username,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      wallet: wallet
        ? {
            id: wallet.id,
            balance: Number(wallet.balance),
            totalEarned: Number(wallet.totalEarned),
            totalBurned: Number(wallet.totalBurned),
          }
        : null,
    };
  }
}

