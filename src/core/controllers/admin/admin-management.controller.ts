import { injectable, inject } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { TYPES } from '@/core/di/types';
import type { IAdminManagementService } from '@/core/interfaces/services/IAdminManagementService';
import {
  createAdminSchema,
  updateAdminSchema,
  adminFiltersSchema,
  paginationSchema,
} from '@/core/validators/admin.validator';
import { verifyAdminToken } from '@/lib/api/middleware';
import type { AdminRole } from '@prisma/client';
import { BaseController } from '@/core/controllers/base.controller';

/**
 * Admin Management Controller
 * Handles HTTP layer for admin CRUD operations
 */
@injectable()
export class AdminManagementController extends BaseController {
  constructor(
    @inject(TYPES.AdminManagementService) private adminManagementService: IAdminManagementService
  ) {
    super();
  }
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
      const result = await this.adminManagementService.getAllAdmins(pagination, filters);

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
      const admin = await this.adminManagementService.getAdminById(id);

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
      const result = await this.adminManagementService.createAdmin(validated);

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
      const result = await this.adminManagementService.updateAdmin(id, validated);

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
      const result = await this.adminManagementService.deleteAdmin(id);

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
   * Get admin statistics
   * GET /api/admin/admins/stats
   */
  async getStats(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Only super admins can view stats
      if (adminToken.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions',
          },
          { status: 403 }
        );
      }

      // Get stats
      const stats = await this.adminManagementService.getAdminStats();

      return NextResponse.json(
        {
          success: true,
          data: stats,
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
   * Check if requester is the same as target (for self-updates)
   */
  protected isSelfUpdate(requesterId: string, targetId: string): boolean {
    return requesterId === targetId;
  }
}

// Controller instances are exported from @/core/di/adminControllerFactory

