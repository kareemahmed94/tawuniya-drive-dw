import { injectable } from 'inversify';
import { ServiceConfig, RuleType, Prisma } from '@prisma/client';
import { prisma } from '@/core/config/database';
import { IAdminServiceConfigRepository } from '@/core/interfaces/repositories/admin/IServiceConfigRepository';
import type { PaginationParams, ServiceConfigFilters } from '@/core/types/admin.types';

/**
 * Admin Service Config Repository Implementation
 * Handles data access for ServiceConfig entity with admin-specific operations
 * Includes pagination, filtering, and soft delete support
 */
@injectable()
export class AdminServiceConfigRepository implements IAdminServiceConfigRepository {
  /**
   * Find active config by service and rule type
   */
  async findActiveByServiceAndType(
    serviceId: string,
    ruleType: RuleType
  ): Promise<ServiceConfig | null> {
    const now = new Date();

    const configs = await prisma.serviceConfig.findMany({
      where: {
        serviceId,
        ruleType,
        isActive: true,
        deletedAt: null,
      },
      orderBy: {
        validFrom: 'desc',
      },
    });

    // Filter by validity dates
    return configs.find(config => {
      const validFromOk = !config.validFrom || config.validFrom <= now;
      const validUntilOk = !config.validUntil || config.validUntil >= now;
      return validFromOk && validUntilOk;
    }) || null;
  }

  /**
   * Find active config by rule type (alias for findActiveByServiceAndType)
   */
  async findActiveByRuleType(
    serviceId: string,
    ruleType: RuleType
  ): Promise<ServiceConfig | null> {
    return this.findActiveByServiceAndType(serviceId, ruleType);
  }

  /**
   * Find configs by service ID with optional filters
   * Excludes soft-deleted configs
   */
  async findByServiceId(
    serviceId: string,
    filters?: ServiceConfigFilters
  ): Promise<ServiceConfig[]> {
    const where: Prisma.ServiceConfigWhereInput = {
      serviceId,
      deletedAt: null,
      ...(filters?.ruleType && { ruleType: filters.ruleType }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    };

    return prisma.serviceConfig.findMany({
      where,
      orderBy: { validFrom: 'desc' },
    });
  }

  /**
   * Find all configs with pagination and filters
   * Excludes soft-deleted configs
   */
  async findAll(
    params: PaginationParams,
    filters?: ServiceConfigFilters
  ): Promise<{ data: ServiceConfig[]; total: number }> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = params;

    // Build where clause
    const where: Prisma.ServiceConfigWhereInput = {
      deletedAt: null,
      ...(filters?.serviceId && { serviceId: filters.serviceId }),
      ...(filters?.ruleType && { ruleType: filters.ruleType }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    };

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      prisma.serviceConfig.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.serviceConfig.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Find config by ID (excluding soft-deleted)
   */
  async findById(id: string): Promise<ServiceConfig | null> {
    return prisma.serviceConfig.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  /**
   * Create new config
   */
  async create(data: Prisma.ServiceConfigCreateInput): Promise<ServiceConfig> {
    return prisma.serviceConfig.create({
      data,
    });
  }

  /**
   * Update config
   */
  async update(
    id: string,
    data: Prisma.ServiceConfigUpdateInput
  ): Promise<ServiceConfig> {
    return prisma.serviceConfig.update({
      where: { id },
      data,
    });
  }

  /**
   * Deactivate config
   */
  async deactivate(id: string): Promise<ServiceConfig> {
    return prisma.serviceConfig.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Soft delete config (sets deletedAt)
   */
  async remove(id: string): Promise<void> {
    await prisma.serviceConfig.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Check if config is active
   */
  async isActive(id: string): Promise<boolean> {
    const config = await prisma.serviceConfig.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: { isActive: true },
    });
    return config?.isActive ?? false;
  }
}

