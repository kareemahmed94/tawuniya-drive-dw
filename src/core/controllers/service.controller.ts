import { NextRequest, NextResponse } from 'next/server';
import { serviceManagementService } from '@/core/di/serviceLocator';
import { getServicesSchema } from '@/core/validators/service.validator';
import { BaseController } from '@/core/controllers/base.controller';

/**
 * Service Controller
 * Handles HTTP layer for public service endpoints
 * Read-only operations for frontend consumption
 */
export class ServiceController extends BaseController {
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
   * Get active service rules (public)
   * GET /api/services/:id/rules
   */
  async getServiceRules(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      // Check for type query parameter
      const { searchParams } = new URL(request.url);
      const type = searchParams.get('type') as 'EARN' | 'BURN' | null;

      // Get active rules (service configs) - public endpoint
      const rules = await serviceManagementService.getServiceConfigs(id);

      if (type && (type === 'EARN' || type === 'BURN')) {
        // Return only the specific type rule (latest active one)
        const rule = rules
          .filter(rule => rule.ruleType === type)
          .sort((a, b) => new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime())[0] || null;

        return NextResponse.json(
          {
            success: true,
            data: {
              earnRule: type === 'EARN' ? rule : null,
              burnRule: type === 'BURN' ? rule : null,
            },
          },
          { status: 200 }
        );
      } else {
        // Return both rules for backward compatibility
        const earnRule = rules.find(rule => rule.ruleType === 'EARN') || null;
        const burnRule = rules.find(rule => rule.ruleType === 'BURN') || null;

        return NextResponse.json(
          {
            success: true,
            data: {
              earnRule,
              burnRule,
            },
          },
          { status: 200 }
        );
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

}

// Singleton instance
export const serviceController = new ServiceController();
