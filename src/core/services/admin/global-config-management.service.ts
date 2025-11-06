import { injectable, inject } from 'inversify';
import { TYPES } from '@/core/di/types';
import type { IAdminGlobalConfigRepository } from '@/core/interfaces/repositories/admin/IGlobalConfigRepository';
import type {
  IGlobalConfigManagementService,
  CreateGlobalConfigInput,
  UpdateGlobalConfigInput,
  GlobalConfigResponse,
  GlobalConfigFilters,
} from '@/core/interfaces/services/IGlobalConfigManagementService';
import type { PaginationParams, PaginatedResponse } from '@/core/types/admin.types';
import { Prisma } from '@prisma/client';

/**
 * GlobalConfig Management Service
 * Handles CRUD operations for global configurations in admin scope
 */
@injectable()
export class GlobalConfigManagementService implements IGlobalConfigManagementService {
  constructor(
    @inject(TYPES.AdminGlobalConfigRepository) private globalConfigRepository: IAdminGlobalConfigRepository
  ) {}

  async createGlobalConfig(data: CreateGlobalConfigInput): Promise<GlobalConfigResponse> {
    // Check if key already exists
    const keyExists = await this.globalConfigRepository.keyExists(data.key);
    if (keyExists) {
      throw new Error('Global config with this key already exists');
    }

    // Prepare config data for creation
    const configData: Prisma.GlobalConfigUncheckedCreateInput = {
      key: data.key,
      value: data.value,
      type: data.type,
      description: data.description || null,
      isActive: data.isActive ?? true,
    };

    const config = await this.globalConfigRepository.create(configData);

    return this.mapToResponse(config);
  }

  async getGlobalConfigById(id: string): Promise<GlobalConfigResponse> {
    const config = await this.globalConfigRepository.findById(id);
    if (!config) {
      throw new Error('Global config not found');
    }

    return this.mapToResponse(config);
  }

  async getAllGlobalConfigs(
    params: PaginationParams,
    filters?: GlobalConfigFilters
  ): Promise<PaginatedResponse<GlobalConfigResponse>> {
    const result = await this.globalConfigRepository.findAll(params, filters);

    const data = result.data.map((config) => this.mapToResponse(config));
    const totalPages = Math.ceil(result.total / params.limit);

    return {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: result.total,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
    };
  }

  async updateGlobalConfig(id: string, data: UpdateGlobalConfigInput): Promise<GlobalConfigResponse> {
    const existingConfig = await this.globalConfigRepository.findById(id);
    if (!existingConfig) {
      throw new Error('Global config not found');
    }

    // Check if key is being changed and if it already exists
    if (data.key && data.key !== existingConfig.key) {
      const keyExists = await this.globalConfigRepository.keyExists(data.key, id);
      if (keyExists) {
        throw new Error('Global config with this key already exists');
      }
    }

    // Prepare update data
    const updateData: Partial<Prisma.GlobalConfigUpdateInput> = {};
    if (data.key !== undefined) updateData.key = data.key;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const config = await this.globalConfigRepository.update(id, updateData as any);

    return this.mapToResponse(config);
  }

  async deleteGlobalConfig(id: string): Promise<{ success: boolean; message: string }> {
    const config = await this.globalConfigRepository.findById(id);
    if (!config) {
      throw new Error('Global config not found');
    }

    await this.globalConfigRepository.remove(id);

    return {
      success: true,
      message: 'Global config deleted successfully',
    };
  }

  async toggleGlobalConfigStatus(id: string, isActive: boolean): Promise<GlobalConfigResponse> {
    const config = await this.globalConfigRepository.findById(id);
    if (!config) {
      throw new Error('Global config not found');
    }

    const updatedConfig = await this.globalConfigRepository.update(id, { isActive });

    return this.mapToResponse(updatedConfig);
  }

  private mapToResponse(config: any): GlobalConfigResponse {
    return {
      id: config.id,
      key: config.key,
      value: config.value,
      type: config.type,
      description: config.description,
      isActive: config.isActive,
      createdAt: config.createdAt.toISOString(),
      updatedAt: config.updatedAt.toISOString(),
    };
  }
}

