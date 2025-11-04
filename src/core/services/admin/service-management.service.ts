import type { IAdminServiceRepository } from '../../interfaces/repositories/admin/IServiceRepository';
import type { IAdminServiceConfigRepository } from '../../interfaces/repositories/admin/IServiceConfigRepository';
import type { IServiceManagementService } from '../../interfaces/services/IServiceManagementService';
import type {
  ServiceResponse,
  ServiceWithDetailsResponse,
  ServiceFilters,
  UpdateServiceConfigInput,
  ServiceConfigResponse,
  ServiceConfigFilters,
  PaginationParams,
  PaginatedResponse,
} from '@/core/types/admin.types';
import type {
  CreateServiceInput,
  UpdateServiceInput,
} from '@/core/validators/service.validator';
import type {
  CreateServiceConfigInput,
} from '@/core/validators/admin.validator';
import type { Prisma } from '@prisma/client';

/**
 * Service Management Service
 * Handles CRUD operations for services and their configurations
 */
export class ServiceManagementService implements IServiceManagementService {
  constructor(
    private serviceRepository: IAdminServiceRepository,
    private configRepository: IAdminServiceConfigRepository
  ) {}

  // ==================== Service Operations ====================

  async createService(data: CreateServiceInput): Promise<ServiceResponse> {
    // Check if service name already exists
    const existing = await this.serviceRepository.findByName(data.name);
    if (existing) {
      throw new Error('Service with this name already exists');
    }

    const service = await this.serviceRepository.create(data);

    return this.transformServiceResponse(service);
  }

  async getServiceById(id: string): Promise<ServiceResponse> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new Error('Service not found');
    }

    return this.transformServiceResponse(service);
  }

  async getServiceWithDetails(id: string): Promise<ServiceWithDetailsResponse> {
    const service = await this.serviceRepository.findByIdWithRelations(id);
    if (!service) {
      throw new Error('Service not found');
    }

    // Get configs
    const configs = await this.configRepository.findByServiceId(id);

    // Get stats (simplified - in production you'd use aggregation)
    const stats = {
      totalTransactions: service._count?.transactions || 0,
      totalPointsEarned: 0, // Would calculate from transactions
      totalPointsBurned: 0, // Would calculate from transactions
      activeConfigs: configs.filter((c) => c.isActive).length,
    };

    return {
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      isActive: service.isActive,
      iconUrl: service.iconUrl,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
      configs: configs.map((c) => this.transformConfigResponse(c, service.name)),
      stats,
    };
  }

  async getAllServices(
    params: PaginationParams,
    filters?: ServiceFilters
  ): Promise<PaginatedResponse<ServiceResponse>> {
    const { data, total } = await this.serviceRepository.findAll(params, filters);

    const transformedData = data.map((service) => this.transformServiceResponse(service));

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: transformedData,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
    };
  }

  async updateService(id: string, data: UpdateServiceInput): Promise<ServiceResponse> {
    const existing = await this.serviceRepository.findById(id);
    if (!existing) {
      throw new Error('Service not found');
    }

    // Check name uniqueness if updating
    if (data.name && data.name !== existing.name) {
      const nameExists = await this.serviceRepository.findByName(data.name);
      if (nameExists) {
        throw new Error('Service with this name already exists');
      }
    }

    const updated = await this.serviceRepository.update(id, data);

    return this.transformServiceResponse(updated);
  }

  async deleteService(id: string): Promise<{ success: boolean; message: string }> {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new Error('Service not found');
    }

    await this.serviceRepository.remove(id);

    return {
      success: true,
      message: 'Service deleted successfully',
    };
  }

  async toggleServiceStatus(id: string, isActive: boolean): Promise<ServiceResponse> {
    const service = await this.serviceRepository.update(id, { isActive });
    return this.transformServiceResponse(service);
  }

  // ==================== Service Config Operations ====================

  async createServiceConfig(data: CreateServiceConfigInput): Promise<ServiceConfigResponse> {
    // Verify service exists
    const service = await this.serviceRepository.findById(data.serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    // Convert input to Prisma format with service relation
    const prismaData: Prisma.ServiceConfigCreateInput = {
      service: {
        connect: { id: data.serviceId },
      },
      ruleType: data.ruleType,
      pointsPerUnit: data.pointsPerUnit,
      unitAmount: data.unitAmount,
      minAmount: data.minAmount ?? null,
      maxPoints: data.maxPoints ?? null,
      expiryDays: data.expiryDays ?? null,
      isActive: data.isActive ?? true,
      validFrom: data.validFrom ?? new Date(),
      validUntil: data.validUntil ?? null,
    };

    const config = await this.configRepository.create(prismaData);

    return this.transformConfigResponse(config, service.name);
  }

  async getServiceConfigById(id: string): Promise<ServiceConfigResponse> {
    const config = await this.configRepository.findById(id);
    if (!config) {
      throw new Error('Service config not found');
    }

    // Get service name
    const service = await this.serviceRepository.findById(config.serviceId);

    return this.transformConfigResponse(config, service?.name);
  }

  async getServiceConfigs(
    serviceId: string,
    filters?: ServiceConfigFilters
  ): Promise<ServiceConfigResponse[]> {
    // Verify service exists
    const service = await this.serviceRepository.findById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const configs = await this.configRepository.findByServiceId(serviceId, filters);

    return configs.map((c) => this.transformConfigResponse(c, service.name));
  }

  async getAllServiceConfigs(
    params: PaginationParams,
    filters?: ServiceConfigFilters
  ): Promise<PaginatedResponse<ServiceConfigResponse>> {
    const { data, total } = await this.configRepository.findAll(params, filters);

    // Get service names for each config
    const transformedData = await Promise.all(
      data.map(async (config) => {
        const service = await this.serviceRepository.findById(config.serviceId);
        return this.transformConfigResponse(config, service?.name);
      })
    );

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: transformedData,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
    };
  }

  async updateServiceConfig(id: string, data: UpdateServiceConfigInput): Promise<ServiceConfigResponse> {
    const existing = await this.configRepository.findById(id);
    if (!existing) {
      throw new Error('Service config not found');
    }

    const updated = await this.configRepository.update(id, data);
    const service = await this.serviceRepository.findById(updated.serviceId);

    return this.transformConfigResponse(updated, service?.name);
  }

  async deleteServiceConfig(id: string): Promise<{ success: boolean; message: string }> {
    const config = await this.configRepository.findById(id);
    if (!config) {
      throw new Error('Service config not found');
    }

    await this.configRepository.remove(id);

    return {
      success: true,
      message: 'Service config deleted successfully',
    };
  }

  async toggleServiceConfigStatus(id: string, isActive: boolean): Promise<ServiceConfigResponse> {
    const config = await this.configRepository.update(id, { isActive });
    const service = await this.serviceRepository.findById(config.serviceId);

    return this.transformConfigResponse(config, service?.name);
  }

  async getActiveConfigByRuleType(
    serviceId: string,
    ruleType: 'EARN' | 'BURN'
  ): Promise<ServiceConfigResponse | null> {
    const config = await this.configRepository.findActiveByRuleType(serviceId, ruleType);
    if (!config) {
      return null;
    }

    const service = await this.serviceRepository.findById(serviceId);

    return this.transformConfigResponse(config, service?.name);
  }

  // Private helper methods

  private transformServiceResponse(service: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    isActive: boolean;
    iconUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ServiceResponse {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category as ServiceResponse['category'],
      isActive: service.isActive,
      iconUrl: service.iconUrl,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };
  }

  private transformConfigResponse(
    config: {
      id: string;
      serviceId: string;
      ruleType: string;
      pointsPerUnit: unknown;
      unitAmount: unknown;
      minAmount: unknown;
      maxPoints: unknown;
      expiryDays: number | null;
      isActive: boolean;
      validFrom: Date;
      validUntil: Date | null;
      createdAt: Date;
      updatedAt: Date;
    },
    serviceName?: string
  ): ServiceConfigResponse {
    return {
      id: config.id,
      serviceId: config.serviceId,
      serviceName,
      ruleType: config.ruleType as 'EARN' | 'BURN',
      pointsPerUnit: Number(config.pointsPerUnit),
      unitAmount: Number(config.unitAmount),
      minAmount: config.minAmount ? Number(config.minAmount) : null,
      maxPoints: config.maxPoints ? Number(config.maxPoints) : null,
      expiryDays: config.expiryDays,
      isActive: config.isActive,
      validFrom: config.validFrom.toISOString(),
      validUntil: config.validUntil ? config.validUntil.toISOString() : null,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    };
  }
}

