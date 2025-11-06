import { injectable, inject } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { TYPES } from '@/core/di/types';
import type { IGlobalConfigManagementService } from '@/core/interfaces/services/IGlobalConfigManagementService';
import { paginationSchema } from '@/core/validators/admin.validator';
import { verifyAdminToken } from '@/lib/api/middleware';
import { z } from 'zod';
import { BaseController } from '../base.controller';

// Validation schemas
const createGlobalConfigSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().min(1, 'Value is required'),
  type: z.enum(['SYSTEM', 'BUSINESS', 'FEATURE']),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

const updateGlobalConfigSchema = z.object({
  key: z.string().min(1).optional(),
  value: z.string().min(1).optional(),
  type: z.enum(['SYSTEM', 'BUSINESS', 'FEATURE']).optional(),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

const globalConfigFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum(['SYSTEM', 'BUSINESS', 'FEATURE']).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GlobalConfig Management Controller
 * Handles HTTP layer for global config CRUD operations in admin scope
 */
@injectable()
export class GlobalConfigManagementController extends BaseController {
  constructor(
    @inject(TYPES.GlobalConfigManagementService) private globalConfigManagementService: IGlobalConfigManagementService
  ) {
    super();
  }
  /**
   * Get all global configs
   * GET /api/admin/global-configs
   */
  async index(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const { searchParams } = new URL(request.url);
      const pagination = paginationSchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '20',
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
      });

      const filters = globalConfigFiltersSchema.parse({
        search: searchParams.get('search') || undefined,
        type: searchParams.get('type') || undefined,
        isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      });

      const result = await this.globalConfigManagementService.getAllGlobalConfigs(pagination, filters);

      return NextResponse.json(
        {
          success: true,
          data: {
            data: result.data,
            pagination: result.pagination,
          },
          message: 'Global configs retrieved successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get global config by ID
   * GET /api/admin/global-configs/:id
   */
  async getById(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const config = await this.globalConfigManagementService.getGlobalConfigById(id);

      return NextResponse.json(
        {
          success: true,
          data: config,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create global config
   * POST /api/admin/global-configs
   */
  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const body = await request.json();
      const validated = createGlobalConfigSchema.parse(body);

      const result = await this.globalConfigManagementService.createGlobalConfig(validated);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Global config created successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update global config
   * PUT /api/admin/global-configs/:id
   */
  async update(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const body = await request.json();
      const validated = updateGlobalConfigSchema.parse(body);

      const result = await this.globalConfigManagementService.updateGlobalConfig(id, validated);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Global config updated successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete global config
   * DELETE /api/admin/global-configs/:id
   */
  async delete(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const result = await this.globalConfigManagementService.deleteGlobalConfig(id);

      return NextResponse.json(
        {
          success: true,
          message: result.message,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Toggle global config status
   * PATCH /api/admin/global-configs/:id/status
   */
  async toggleStatus(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const body = await request.json();
      const { isActive } = z.object({ isActive: z.boolean() }).parse(body);

      const result = await this.globalConfigManagementService.toggleGlobalConfigStatus(id, isActive);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: `Global config ${isActive ? 'activated' : 'deactivated'} successfully`,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

}

// Controller instances are exported from @/core/di/adminControllerFactory

