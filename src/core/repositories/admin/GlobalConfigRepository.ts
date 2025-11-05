import type { GlobalConfig, Prisma, ConfigType } from '@prisma/client';
import { prisma } from '../../config/database';
import type { IAdminGlobalConfigRepository } from '../../interfaces/repositories/admin/IGlobalConfigRepository';
import type { PaginationParams } from '@/core/types/admin.types';

export interface GlobalConfigFilters {
  search?: string;
  type?: ConfigType;
  isActive?: boolean;
}

/**
 * Admin GlobalConfig Repository Implementation
 * Handles data access for GlobalConfig entity in admin scope
 */
export class AdminGlobalConfigRepository implements IAdminGlobalConfigRepository {
  async findById(id: string): Promise<GlobalConfig | null> {
    return prisma.globalConfig.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async findByKey(key: string): Promise<GlobalConfig | null> {
    return prisma.globalConfig.findFirst({
      where: {
        key,
        deletedAt: null,
      },
    });
  }

  async findAll(params: PaginationParams, filters?: GlobalConfigFilters): Promise<{ data: GlobalConfig[]; total: number }> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    const where: Prisma.GlobalConfigWhereInput = {
      deletedAt: null,
    };

    if (filters?.search) {
      where.OR = [
        { key: { contains: filters.search, mode: 'insensitive' } },
        { value: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [data, total] = await Promise.all([
      prisma.globalConfig.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.globalConfig.count({ where }),
    ]);

    return { data, total };
  }

  async keyExists(key: string, excludeId?: string): Promise<boolean> {
    const config = await prisma.globalConfig.findFirst({
      where: {
        key,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return !!config;
  }

  async create(data: Prisma.GlobalConfigUncheckedCreateInput): Promise<GlobalConfig> {
    return prisma.globalConfig.create({
      data: {
        key: data.key,
        value: data.value,
        type: data.type,
        description: data.description || null,
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, data: Partial<GlobalConfig>): Promise<GlobalConfig> {
    return prisma.globalConfig.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    // Soft delete
    await prisma.globalConfig.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async isActive(id: string): Promise<boolean> {
    const config = await prisma.globalConfig.findUnique({
      where: { id },
      select: { isActive: true },
    });
    return config?.isActive ?? false;
  }

  async countByType(type?: ConfigType): Promise<number> {
    return prisma.globalConfig.count({
      where: {
        deletedAt: null,
        ...(type ? { type } : {}),
      },
    });
  }
}

