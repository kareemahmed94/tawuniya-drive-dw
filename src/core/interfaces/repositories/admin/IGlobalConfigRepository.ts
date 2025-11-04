import type { GlobalConfig, Prisma, ConfigType } from '@prisma/client';
import type { PaginationParams } from '../../../types/admin.types';

export interface GlobalConfigFilters {
  search?: string;
  type?: ConfigType;
  isActive?: boolean;
}

/**
 * Admin GlobalConfig Repository Interface
 * Handles data access for GlobalConfig entity in admin scope
 */
export interface IAdminGlobalConfigRepository {
  /**
   * Find global config by ID
   */
  findById(id: string): Promise<GlobalConfig | null>;

  /**
   * Find global config by key
   */
  findByKey(key: string): Promise<GlobalConfig | null>;

  /**
   * Find all global configs with pagination and filters
   */
  findAll(params: PaginationParams, filters?: GlobalConfigFilters): Promise<{ data: GlobalConfig[]; total: number }>;

  /**
   * Check if key exists
   */
  keyExists(key: string, excludeId?: string): Promise<boolean>;

  /**
   * Create global config
   */
  create(data: Prisma.GlobalConfigUncheckedCreateInput): Promise<GlobalConfig>;

  /**
   * Update global config
   */
  update(id: string, data: Partial<GlobalConfig>): Promise<GlobalConfig>;

  /**
   * Soft delete global config
   */
  remove(id: string): Promise<void>;

  /**
   * Check if global config is active
   */
  isActive(id: string): Promise<boolean>;

  /**
   * Count global configs by type
   */
  countByType(type?: ConfigType): Promise<number>;
}

