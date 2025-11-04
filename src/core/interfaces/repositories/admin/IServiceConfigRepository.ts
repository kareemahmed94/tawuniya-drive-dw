import type { ServiceConfig, RuleType, Prisma } from '@prisma/client';
import type { PaginationParams, ServiceConfigFilters } from '@/core/types/admin.types';

/**
 * Admin Service Config Repository Interface
 * Extended interface for admin operations with pagination and enhanced filtering
 */
export interface IAdminServiceConfigRepository {
  /**
   * Find active config by service and rule type
   */
  findActiveByServiceAndType(
    serviceId: string,
    ruleType: RuleType
  ): Promise<ServiceConfig | null>;

  /**
   * Find active config by rule type (helper method)
   */
  findActiveByRuleType(
    serviceId: string,
    ruleType: RuleType
  ): Promise<ServiceConfig | null>;

  /**
   * Find configs by service ID with optional filters
   */
  findByServiceId(
    serviceId: string,
    filters?: ServiceConfigFilters
  ): Promise<ServiceConfig[]>;

  /**
   * Find all configs with pagination and filters
   */
  findAll(
    params: PaginationParams,
    filters?: ServiceConfigFilters
  ): Promise<{ data: ServiceConfig[]; total: number }>;

  /**
   * Find config by ID
   */
  findById(id: string): Promise<ServiceConfig | null>;

  /**
   * Create new config
   */
  create(data: Prisma.ServiceConfigCreateInput): Promise<ServiceConfig>;

  /**
   * Update config
   */
  update(
    id: string,
    data: Prisma.ServiceConfigUpdateInput
  ): Promise<ServiceConfig>;

  /**
   * Deactivate config
   */
  deactivate(id: string): Promise<ServiceConfig>;

  /**
   * Soft delete config (sets deletedAt)
   */
  remove(id: string): Promise<void>;

  /**
   * Check if config is active
   */
  isActive(id: string): Promise<boolean>;
}

