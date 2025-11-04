import { injectable } from 'inversify';
import { Service, ServiceCategory, Prisma } from '@prisma/client';
import { prisma } from '@/core/config/database';
import { IAdminServiceRepository } from '@/core/interfaces/repositories/admin/IServiceRepository';
import type { PaginationParams, ServiceFilters } from '@/core/types/admin.types';

/**
 * Admin Service Repository Implementation
 * Handles data access for Service entity with admin-specific operations
 * Includes pagination, filtering, and soft delete support
 */
@injectable()
export class AdminServiceRepository implements IAdminServiceRepository {
  /**
   * Find all services with pagination and filters
   * Excludes soft-deleted services
   */
  async findAll(
    params: PaginationParams,
    filters?: ServiceFilters
  ): Promise<{ data: Service[]; total: number }> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    // Build where clause
    const where: Prisma.ServiceWhereInput = {
      deletedAt: null,
      ...(filters?.category && { category: filters.category }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters?.search && {
        name: {
          contains: filters.search,
          mode: 'insensitive',
        },
      }),
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.service.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Find service by ID (excluding soft-deleted)
   */
  async findById(id: string): Promise<Service | null> {
    return prisma.service.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Find service by ID with relations
   */
  async findByIdWithRelations(id: string): Promise<(Service & {
    _count?: {
      transactions: number;
    };
  }) | null> {
    return prisma.service.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
  }

  /**
   * Find service by name (excluding soft-deleted)
   */
  async findByName(name: string): Promise<Service | null> {
    return prisma.service.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
  }

  /**
   * Create new service
   */
  async create(data: Prisma.ServiceCreateInput): Promise<Service> {
    return prisma.service.create({
      data,
    });
  }

  /**
   * Update service
   */
  async update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft delete service (sets deletedAt)
   */
  async remove(id: string): Promise<void> {
    await prisma.service.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Check if service is active
   */
  async isActive(id: string): Promise<boolean> {
    const service = await prisma.service.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: { isActive: true },
    });
    return service?.isActive ?? false;
  }
}

