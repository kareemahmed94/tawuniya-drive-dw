import type { Service, ServiceCategory, Prisma } from '@prisma/client';
import type { PaginationParams, ServiceFilters } from '@/core/types/admin.types';

/**
 * Admin Service Repository Interface
 * Extended interface for admin operations with pagination and enhanced filtering
 */
export interface IAdminServiceRepository {
  /**
   * Find all services with pagination and filters
   */
  findAll(
    params: PaginationParams,
    filters?: ServiceFilters
  ): Promise<{ data: Service[]; total: number }>;

  /**
   * Find service by ID
   */
  findById(id: string): Promise<Service | null>;

  /**
   * Find service by ID with relations (configs, transaction count)
   */
  findByIdWithRelations(id: string): Promise<(Service & {
    _count?: {
      transactions: number;
    };
  }) | null>;

  /**
   * Find service by name
   */
  findByName(name: string): Promise<Service | null>;

  /**
   * Create new service
   */
  create(data: Prisma.ServiceCreateInput): Promise<Service>;

  /**
   * Update service
   */
  update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service>;

  /**
   * Soft delete service (sets deletedAt)
   */
  remove(id: string): Promise<void>;

  /**
   * Check if service is active
   */
  isActive(id: string): Promise<boolean>;
}

