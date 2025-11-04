import type {
  PaginationParams,
  PaginatedResponse,
} from '../types/admin.types';

export interface GlobalConfigResponse {
  id: string;
  key: string;
  value: string;
  type: 'SYSTEM' | 'BUSINESS' | 'FEATURE';
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGlobalConfigInput {
  key: string;
  value: string;
  type: 'SYSTEM' | 'BUSINESS' | 'FEATURE';
  description?: string | null;
  isActive?: boolean;
}

export interface UpdateGlobalConfigInput {
  key?: string;
  value?: string;
  type?: 'SYSTEM' | 'BUSINESS' | 'FEATURE';
  description?: string | null;
  isActive?: boolean;
}

export interface GlobalConfigFilters {
  search?: string;
  type?: 'SYSTEM' | 'BUSINESS' | 'FEATURE';
  isActive?: boolean;
}

/**
 * GlobalConfig Management Service Interface
 * Handles CRUD operations for global configurations in admin scope
 */
export interface IGlobalConfigManagementService {
  /**
   * Create a new global config
   */
  createGlobalConfig(data: CreateGlobalConfigInput): Promise<GlobalConfigResponse>;

  /**
   * Get global config by ID
   */
  getGlobalConfigById(id: string): Promise<GlobalConfigResponse>;

  /**
   * Get all global configs with pagination and filters
   */
  getAllGlobalConfigs(
    params: PaginationParams,
    filters?: GlobalConfigFilters
  ): Promise<PaginatedResponse<GlobalConfigResponse>>;

  /**
   * Update global config
   */
  updateGlobalConfig(id: string, data: UpdateGlobalConfigInput): Promise<GlobalConfigResponse>;

  /**
   * Delete global config (soft delete)
   */
  deleteGlobalConfig(id: string): Promise<{ success: boolean; message: string }>;

  /**
   * Toggle global config active status
   */
  toggleGlobalConfigStatus(id: string, isActive: boolean): Promise<GlobalConfigResponse>;
}

