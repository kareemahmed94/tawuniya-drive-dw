import type {
  ServiceResponse,
  ServiceWithDetailsResponse,
  UpdateServiceConfigInput,
  ServiceConfigResponse,
  ServiceConfigFilters,
  ServiceFilters,
  PaginationParams,
  PaginatedResponse,
} from '@/core/types/admin.types';
import {
  CreateServiceInput,
  UpdateServiceInput,
} from '@/core/validators/service.validator';
import {
  CreateServiceConfigInput,
} from '@/core/validators/admin.validator';

/**
 * Service Management Service Interface
 * Handles CRUD operations for services and their configurations
 */
export interface IServiceManagementService {
  // ==================== Service Operations ====================

  /**
   * Create a new service
   */
  createService(data: CreateServiceInput): Promise<ServiceResponse>;

  /**
   * Get service by ID
   */
  getServiceById(id: string): Promise<ServiceResponse>;

  /**
   * Get service with full details including configs and stats
   */
  getServiceWithDetails(id: string): Promise<ServiceWithDetailsResponse>;

  /**
   * Get all services with pagination and filters
   */
  getAllServices(
    params: PaginationParams,
    filters?: ServiceFilters
  ): Promise<PaginatedResponse<ServiceResponse>>;

  /**
   * Update service
   */
  updateService(id: string, data: UpdateServiceInput): Promise<ServiceResponse>;

  /**
   * Delete service
   */
  deleteService(id: string): Promise<{ success: boolean; message: string }>;

  /**
   * Toggle service active/inactive status
   */
  toggleServiceStatus(id: string, isActive: boolean): Promise<ServiceResponse>;

  // ==================== Service Config Operations ====================

  /**
   * Create service configuration
   */
  createServiceConfig(data: CreateServiceConfigInput): Promise<ServiceConfigResponse>;

  /**
   * Get service config by ID
   */
  getServiceConfigById(id: string): Promise<ServiceConfigResponse>;

  /**
   * Get all configs for a service
   */
  getServiceConfigs(serviceId: string, filters?: ServiceConfigFilters): Promise<ServiceConfigResponse[]>;

  /**
   * Get all service configs with pagination and filters
   */
  getAllServiceConfigs(
    params: PaginationParams,
    filters?: ServiceConfigFilters
  ): Promise<PaginatedResponse<ServiceConfigResponse>>;

  /**
   * Update service configuration
   */
  updateServiceConfig(
    id: string,
    data: UpdateServiceConfigInput
  ): Promise<ServiceConfigResponse>;

  /**
   * Delete service configuration
   */
  deleteServiceConfig(id: string): Promise<{ success: boolean; message: string }>;

  /**
   * Toggle service config active/inactive status
   */
  toggleServiceConfigStatus(id: string, isActive: boolean): Promise<ServiceConfigResponse>;

  /**
   * Get active config by rule type for a service
   */
  getActiveConfigByRuleType(
    serviceId: string,
    ruleType: 'EARN' | 'BURN'
  ): Promise<ServiceConfigResponse | null>;
}
