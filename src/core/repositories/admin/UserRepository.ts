import type { User, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import type { IAdminUserRepository } from '../../interfaces/repositories/admin/IUserRepository';
import type { PaginationParams } from '../../types/admin.types';

export interface UserFilters {
  search?: string;
  isActive?: boolean;
}

/**
 * Admin User Repository Implementation
 * Handles data access for User entity in admin scope
 */
export class AdminUserRepository implements IAdminUserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findAll(params: PaginationParams, filters?: UserFilters): Promise<{ data: User[]; total: number }> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { first_name: { contains: filters.search, mode: 'insensitive' } },
        { last_name: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        phone,
        deletedAt: null,
      },
    });
  }

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return !!user;
  }

  async phoneExists(phone: string, excludeId?: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        phone,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return !!user;
  }

  async create(data: Prisma.UserUncheckedCreateInput): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        username: data.username || `${data.first_name}_${data.last_name}`,
        password: data.password,
        phone: data.phone,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    // Soft delete
    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async isActive(id: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { isActive: true },
    });
    return user?.isActive ?? false;
  }

  async findByIdWithWallet(id: string): Promise<Prisma.UserGetPayload<{ include: { wallet: true } }> | null> {
    return prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        wallet: true,
      },
    });
  }

  async countByStatus(isActive?: boolean): Promise<number> {
    return prisma.user.count({
      where: {
        deletedAt: null,
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
  }
}

