import type {
  ServiceResponse,
  ServiceWithDetailsResponse,
  UpdateServiceConfigInput,
  ServiceConfigResponse,
  ServiceConfigFilters,
  PaginationParams,
  PaginatedResponse,
} from '@/core/types/admin.types';
import {
  CreateServiceInput,
  UpdateServiceInput,
  CreateServiceConfigInput,
} from '@/core/validators/service.validator';
import {Service, ServiceCategory} from "@prisma/client";

/**
 * Service Management Service Interface
 * Handles CRUD operations for services and their configurations
 */
export interface IServiceManagementService {
  // ==================== Service Operations ====================

  /**
   * Create a new service
   */
  createService(data: CreateServiceInput): Promise<Service>;

  /**
   * Get service by ID
   */
  getServiceById(serviceId: string): Promise<Service>;

  /**
   * Get all services with pagination and filters
   */
  getAllServices(
      filters?: {
        category?: ServiceCategory;
        isActive?: boolean;
      }
  ): Promise<Service[]>;

  /**
   * Update service
   */
  updateService(serviceId: string, data: UpdateServiceInput): Promise<Service>;

  /**
   * Delete service
   */
  deleteService(serviceId: string): Promise<void>;

  // ==================== Service Config Operations ====================

  /**
   * Create service configuration
   */
  createServiceConfig(data: CreateServiceConfigInput): Promise<any>;

  /**
   * Get all configs for a service
   */
  getServiceConfigs(serviceId: string): Promise<any>;

  /**
   * Update service configuration
   */
  updateServiceConfig(
      configId: string,
      data: Partial<CreateServiceConfigInput>
  ): Promise<any>;
}
