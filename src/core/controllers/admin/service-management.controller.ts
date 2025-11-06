import { injectable, inject } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError, z } from 'zod';
import { TYPES } from '@/core/di/types';
import type { IServiceManagementService } from '@/core/interfaces/services/IServiceManagementService';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceFiltersSchema,
  createServiceConfigSchema,
  updateServiceConfigSchema,
  serviceConfigFiltersSchema,
  paginationSchema,
} from '@/core/validators/admin.validator';
import { verifyAdminToken } from '@/lib/api/middleware';

/**
 * Service Management Controller
 * Handles HTTP layer for service and service config CRUD operations
 */
@injectable()
export class ServiceManagementController {
  constructor(
    @inject(TYPES.ServiceManagementServiceAdmin) private serviceManagementService: IServiceManagementService
  ) {}
  // ==================== Service Operations ====================

  /**
   * Get all services
   * GET /api/admin/services
   */
  async getAllServices(request: NextRequest): Promise<NextResponse> {
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

      const filters = serviceFiltersSchema.parse({
        category: searchParams.get('category') || undefined,
        isActive: searchParams.get('isActive') || undefined,
        search: searchParams.get('search') || undefined,
      });

      const result = await this.serviceManagementService.getAllServices(pagination, filters);

      return NextResponse.json(
        {
          success: true,
          data: {
            data: result.data,
            pagination: result.pagination,
          },
          message: 'Data retrieved successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get service by ID
   * GET /api/admin/services/:id
   */
  async getServiceById(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const service = await this.serviceManagementService.getServiceById(id);

      return NextResponse.json(
        {
          success: true,
          data: service,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get service with full details
   * GET /api/admin/services/:id/details
   */
  async getServiceWithDetails(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const service = await this.serviceManagementService.getServiceWithDetails(id);

      return NextResponse.json(
        {
          success: true,
          data: service,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create service
   * POST /api/admin/services
   */
  async createService(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      if (!this.isAdminOrHigher(adminToken.role)) {
        return this.forbiddenResponse();
      }

      const body = await request.json();
      const validated = createServiceSchema.parse(body);

      // Transform null values to undefined for optional fields
      const serviceData = {
        ...validated,
        description: validated.description ?? undefined,
        iconUrl: validated.iconUrl ?? undefined,
      };

      const result = await this.serviceManagementService.createService(serviceData);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Service created successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update service
   * PUT /api/admin/services/:id
   */
  async updateService(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      if (!this.isAdminOrHigher(adminToken.role)) {
        return this.forbiddenResponse();
      }

      const body = await request.json();
      const validated = updateServiceSchema.parse(body);

      // Transform null values to undefined for optional fields
      const serviceData = {
        ...validated,
        description: validated.description ?? undefined,
        iconUrl: validated.iconUrl ?? undefined,
      };

      const result = await this.serviceManagementService.updateService(id, serviceData);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Service updated successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete service
   * DELETE /api/admin/services/:id
   */
  async deleteService(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      if (adminToken.role !== 'SUPER_ADMIN') {
        return this.forbiddenResponse('Only SUPER_ADMIN can delete services');
      }

      const result = await this.serviceManagementService.deleteService(id);

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
   * Toggle service status
   * PATCH /api/admin/services/:id/status
   */
  async toggleServiceStatus(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      if (!this.isAdminOrHigher(adminToken.role)) {
        return this.forbiddenResponse();
      }

      const body = await request.json();
      const { isActive } = body;

      if (typeof isActive !== 'boolean') {
        return NextResponse.json(
          {
            success: false,
            error: 'isActive must be a boolean',
          },
          { status: 400 }
        );
      }

      const result = await this.serviceManagementService.toggleServiceStatus(id, isActive);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: `Service ${isActive ? 'activated' : 'deactivated'} successfully`,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Service Config Operations ====================

  /**
   * Get all service configs
   * GET /api/admin/service-configs
   */
  async getAllServiceConfigs(request: NextRequest): Promise<NextResponse> {
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

      const filters = serviceConfigFiltersSchema.parse({
        serviceId: searchParams.get('serviceId') || undefined,
        ruleType: searchParams.get('ruleType') || undefined,
        isActive: searchParams.get('isActive') || undefined,
      });

      const result = await this.serviceManagementService.getAllServiceConfigs(pagination, filters);

      return NextResponse.json(
        {
          success: true,
          data: {
            data: result.data,
            pagination: result.pagination,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get service configs by service ID
   * GET /api/admin/services/:serviceId/configs
   */
  async getServiceConfigs(request: NextRequest, serviceId: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const { searchParams } = new URL(request.url);
      const filters = serviceConfigFiltersSchema.parse({
        ruleType: searchParams.get('ruleType') || undefined,
        isActive: searchParams.get('isActive') || undefined,
      });

      const configs = await this.serviceManagementService.getServiceConfigs(serviceId, filters);

      return NextResponse.json(
        {
          success: true,
          data: configs,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get service config by ID
   * GET /api/admin/service-configs/:id
   */
  async getServiceConfigById(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const config = await this.serviceManagementService.getServiceConfigById(id);

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
   * Create service config
   * POST /api/admin/service-configs
   */
  async createServiceConfig(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      if (!this.isAdminOrHigher(adminToken.role)) {
        return this.forbiddenResponse();
      }

      const body = await request.json();
      const validated = createServiceConfigSchema.parse(body);

      const result = await this.serviceManagementService.createServiceConfig(validated);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Service config created successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update service config
   * PUT /api/admin/service-configs/:id
   */
  async updateServiceConfig(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      if (!this.isAdminOrHigher(adminToken.role)) {
        return this.forbiddenResponse();
      }

      const body = await request.json();
      const validated = updateServiceConfigSchema.parse(body);

      const result = await this.serviceManagementService.updateServiceConfig(id, validated);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Service config updated successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Toggle service config status
   * PATCH /api/admin/service-configs/:id/status
   */
  async toggleServiceConfigStatus(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      if (!this.isAdminOrHigher(adminToken.role)) {
        return this.forbiddenResponse();
      }

      const body = await request.json();
      const { isActive } = z.object({ isActive: z.boolean() }).parse(body);

      const result = await this.serviceManagementService.toggleServiceConfigStatus(id, isActive);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: `Service config ${isActive ? 'activated' : 'deactivated'} successfully`,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete service config
   * DELETE /api/admin/service-configs/:id
   */
  async deleteServiceConfig(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      if (adminToken.role !== 'SUPER_ADMIN') {
        return this.forbiddenResponse('Only SUPER_ADMIN can delete service configs');
      }

      const result = await this.serviceManagementService.deleteServiceConfig(id);

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

  // ==================== Helper Methods ====================

  private isAdminOrHigher(role: string): boolean {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  private unauthorizedResponse(): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
      },
      { status: 401 }
    );
  }

  private forbiddenResponse(message = 'Insufficient permissions'): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 403 }
    );
  }

  private handleError(error: unknown): NextResponse {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: error.errors.reduce((acc: Record<string, string[]>, err) => {
            const field = err.path.join('.');
            if (!acc[field]) acc[field] = [];
            acc[field].push(err.message);
            return acc;
          }, {}),
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
    const status = this.getStatusCode(errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status }
    );
  }

  private getStatusCode(message: string): number {
    if (message.includes('already exists')) return 409;
    if (message.includes('not found')) return 404;
    if (message.includes('deleted')) return 410;
    return 500;
  }
}

// Controller instances are exported from @/core/di/adminControllerFactory

