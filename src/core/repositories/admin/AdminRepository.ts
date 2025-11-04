import { injectable } from 'inversify';
import { AdminRole, Prisma, Admin } from '@prisma/client';
import { prisma } from '@/core/config/database';
import { IAdminRepository } from '@/core/interfaces/repositories/admin/IAdminRepository';
import type { PaginationParams, AdminFilters } from '@/core/types/admin.types';

/**
 * Admin Repository Implementation
 * Handles data access for Admin entity using Prisma
 * Follows Repository Pattern with soft delete support
 */
@injectable()
export class AdminRepository implements IAdminRepository {
  /**
   * Find admin by ID (excluding soft-deleted)
   */
  async findById(id: string): Promise<Admin | null> {
    return prisma.admin.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Find admin by email (excluding soft-deleted)
   */
  async findByEmail(email: string): Promise<Admin | null> {
    return prisma.admin.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  /**
   * Find admin by phone (excluding soft-deleted)
   */
  async findByPhone(phone: string): Promise<Admin | null> {
    return prisma.admin.findFirst({
      where: {
        phone,
        deletedAt: null,
      },
    });
  }

  /**
   * Find admin by email or phone (excluding soft-deleted)
   */
  async findByEmailOrPhone(email: string, phone?: string): Promise<Admin | null> {
    return prisma.admin.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
        deletedAt: null,
      },
    });
  }

  /**
   * Check if email exists (optionally excluding an ID)
   * Only checks non-deleted admins
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const admin = await prisma.admin.findFirst({
      where: {
        email,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return admin !== null;
  }

  /**
   * Check if phone exists (optionally excluding an ID)
   * Only checks non-deleted admins
   */
  async phoneExists(phone: string, excludeId?: string): Promise<boolean> {
    const admin = await prisma.admin.findFirst({
      where: {
        phone,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return admin !== null;
  }

  /**
   * Create new admin
   */
  async create(data: Prisma.AdminUncheckedCreateInput): Promise<Admin> {
    return prisma.admin.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        avatar: data.avatar,
        phone: data.phone,
        role: data.role || AdminRole.ADMIN,
      },
    });
  }

  /**
   * Update admin
   */
  async update(id: string, data: Partial<Admin>): Promise<Admin> {
    return prisma.admin.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete admin (sets deletedAt timestamp)
   */
  async remove(id: string): Promise<void> {
    await prisma.admin.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Find all admins with pagination and filters
   * Excludes soft-deleted admins
   */
  async findAll(
    params: PaginationParams,
    filters?: AdminFilters
  ): Promise<{ data: Admin[]; total: number }> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    // Build where clause
    const where: Prisma.AdminWhereInput = {
      deletedAt: null,
      ...(filters?.role && { role: filters.role }),
      ...(filters?.search && {
        OR: [
          { email: { contains: filters.search, mode: 'insensitive' } },
          { name: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      prisma.admin.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.admin.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Count admins by role (or total if no role specified)
   * Excludes soft-deleted admins
   */
  async countByRole(role?: AdminRole): Promise<number> {
    return prisma.admin.count({
      where: {
        deletedAt: null,
        ...(role && { role }),
      },
    });
  }
}

