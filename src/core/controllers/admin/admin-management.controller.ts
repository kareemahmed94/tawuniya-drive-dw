import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getAdminManagementService } from '@/core/services/admin/serviceLocator';
import {
  createAdminSchema,
  updateAdminSchema,
  adminFiltersSchema,
  paginationSchema,
} from '@/core/validators/admin.validator';
import { verifyAdminToken } from '@/lib/api/middleware';
import type { AdminRole } from '@prisma/client';

/**
 * Admin Management Controller
 * Handles HTTP layer for admin CRUD operations
 */
export class AdminManagementController {
  /**
   * Get all admins
   * GET /api/admin/admins
   */
  async index(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Parse query params
      const { searchParams } = new URL(request.url);
      const pagination = paginationSchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '20',
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
      });

      const filters = adminFiltersSchema.parse({
        role: searchParams.get('role') || undefined,
        search: searchParams.get('search') || undefined,
      });

      // Get admins
      const adminManagementService = getAdminManagementService();
      const result = await adminManagementService.getAllAdmins(pagination, filters);

      return NextResponse.json(
        {
          success: true,
          data: {
            data: result.data,
            pagination: result.pagination,
          },
          message: 'Admins retrieved successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get admin by ID
   * GET /api/admin/admins/:id
   */
  async getById(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Get admin
      const adminManagementService = getAdminManagementService();
      const admin = await adminManagementService.getAdminById(id);

      return NextResponse.json(
        {
          success: true,
          data: admin,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create admin
   * POST /api/admin/admins
   */
  async create(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Only super admins can create admins
      if (adminToken.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions. Only SUPER_ADMIN can create admins.',
          },
          { status: 403 }
        );
      }

      const body = await request.json();

      // Validate input
      const validated = createAdminSchema.parse(body);

      // Create admin
      const adminManagementService = getAdminManagementService();
      const result = await adminManagementService.createAdmin(validated);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Admin created successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update admin
   * PUT /api/admin/admins/:id
   */
  async update(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Check permissions
      const canUpdate = this.canUpdateAdmin(adminToken.adminId, adminToken.role, id);
      if (!canUpdate) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions. You can only update your own profile or be a SUPER_ADMIN.',
          },
          { status: 403 }
        );
      }

      const body = await request.json();

      // Validate input
      const validated = updateAdminSchema.parse(body);

      // Update admin
      const adminManagementService = getAdminManagementService();
      const result = await adminManagementService.updateAdmin(id, validated);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Admin updated successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete admin
   * DELETE /api/admin/admins/:id
   */
  async remove(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Only super admins can delete admins
      if (adminToken.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions. Only SUPER_ADMIN can delete admins.',
          },
          { status: 403 }
        );
      }

      // Cannot delete self
      if (adminToken.adminId === id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot delete your own account',
          },
          { status: 400 }
        );
      }

      // Delete admin
      const adminManagementService = getAdminManagementService();
      const result = await adminManagementService.deleteAdmin(id);

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
   * Check if admin can update another admin
   */
  private canUpdateAdmin(requesterId: string, requesterRole: AdminRole, targetId: string): boolean {
    // Super admins can update anyone
    if (requesterRole === 'SUPER_ADMIN') return true;

    // Admins can only update themselves
    return requesterId === targetId;
  }

  /**
   * Unauthorized response
   */
  private unauthorizedResponse(): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
      },
      { status: 401 }
    );
  }

  /**
   * Handle errors
   */
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

  /**
   * Get appropriate HTTP status code based on error message
   */
  private getStatusCode(message: string): number {
    if (message.includes('already exists')) return 409;
    if (message.includes('not found')) return 404;
    if (message.includes('deleted')) return 410;
    if (message.includes('Cannot update')) return 400;
    return 500;
  }
}

// Export singleton instance
export const adminManagementController = new AdminManagementController();

