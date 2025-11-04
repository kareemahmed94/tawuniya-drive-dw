import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { serviceManagementService } from '@/core/di/serviceLocator';
import {
  createServiceSchema,
  updateServiceSchema,
  getServicesSchema,
  createServiceConfigSchema,
} from '@/core/validators/service.validator';
import { updateServiceConfigSchema } from '@/core/validators/admin.validator';
import { verifyAdminToken } from '@/lib/api/middleware';

/**
 * Service Controller
 * Handles HTTP layer for public service endpoints
 * Some operations require admin authentication
 */
export class ServiceController {
  /**
   * Get all services
   * GET /api/services
   */
  async getAllServices(request: NextRequest): Promise<NextResponse> {
    try {
      // Validate query parameters
      const { searchParams } = new URL(request.url);
      const queryParams = {
        page: searchParams.get('page') || undefined,
        limit: searchParams.get('limit') || undefined,
        category: searchParams.get('category') || undefined,
        isActive: searchParams.get('isActive') || undefined,
      };

      const validated = getServicesSchema.parse(queryParams);

      // Extract pagination and filters
      const { page = 1, limit = 20, ...filters } = validated;
      const paginationParams = { page: page as number, limit: limit as number };

      // Get services
      const services = await serviceManagementService.getAllServices(paginationParams, filters);

      return NextResponse.json(
        {
          success: true,
          data: services,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get service by ID
   * GET /api/services/:id
   */
  async getServiceById(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const service = await serviceManagementService.getServiceById(id);

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
   * POST /api/services
   */
  async createService(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Validate request body
      const body = await request.json();
      const validated = createServiceSchema.parse(body);

      // Create service
      const service = await serviceManagementService.createService(validated);

      return NextResponse.json(
        {
          success: true,
          data: service,
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
   * PUT /api/services/:id
   */
  async updateService(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Validate request body
      const body = await request.json();
      const validated = updateServiceSchema.parse(body);

      // Update service
      const service = await serviceManagementService.updateService(id, validated);

      return NextResponse.json(
        {
          success: true,
          data: service,
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
   * DELETE /api/services/:id
   */
  async deleteService(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Delete service
      await serviceManagementService.deleteService(id);

      return NextResponse.json(
        {
          success: true,
          data: null,
          message: 'Service deleted successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get service configurations
   * GET /api/services/:id/config
   */
  async getServiceConfigs(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Get service configurations
      const configs = await serviceManagementService.getServiceConfigs(id);

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
   * Get active service rules (public)
   * GET /api/services/:id/rules
   */
  async getServiceRules(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      // Get active rules (service configs) - public endpoint
      const rules = await serviceManagementService.getServiceConfigs(id);

      return NextResponse.json(
        {
          success: true,
          data: rules,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create service configuration
   * POST /api/services/config
   */
  async createServiceConfig(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Validate request body
      const body = await request.json();
      const validated = createServiceConfigSchema.parse(body);

      // Convert date strings to Date objects if present
      const configData = {
        ...validated,
        validFrom: validated.validFrom ? new Date(validated.validFrom) : undefined,
        validUntil: validated.validUntil ? new Date(validated.validUntil) : undefined,
      };

      // Create service configuration
      const config = await serviceManagementService.createServiceConfig(configData);

      return NextResponse.json(
        {
          success: true,
          data: config,
          message: 'Service configuration created successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update service configuration
   * PUT /api/services/config/:id
   */
  async updateServiceConfig(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Validate request body
      const body = await request.json();
      
      // For update, we'll use a flexible schema that allows partial updates
      const validated = updateServiceConfigSchema.parse(body);

      // Update service configuration
      const config = await serviceManagementService.updateServiceConfig(id, validated);

      return NextResponse.json(
        {
          success: true,
          data: config,
          message: 'Service configuration updated successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Deactivate service configuration
   * PATCH /api/services/config/:id/deactivate
   */
  async deactivateServiceConfig(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Deactivate service configuration
      const config = await serviceManagementService.toggleServiceConfigStatus(id, false);

      return NextResponse.json(
        {
          success: true,
          data: config,
          message: 'Service configuration deactivated successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Helper Methods ====================

  private unauthorizedResponse(): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
      },
      { status: 401 }
    );
  }

  private handleError(error: unknown): NextResponse {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          errors: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Service controller error:', error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

// Singleton instance
export const serviceController = new ServiceController();
