import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getUserManagementService } from '@/core/services/admin/serviceLocator';
import { paginationSchema } from '@/core/validators/admin.validator';
import { verifyAdminToken } from '@/lib/api/middleware';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

const userFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * User Management Controller
 * Handles HTTP layer for user CRUD operations in admin scope
 */
export class UserManagementController {
  /**
   * Get all users
   * GET /api/admin/users
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

      const filters = userFiltersSchema.parse({
        search: searchParams.get('search') || undefined,
        isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      });

      const userManagementService = getUserManagementService();
      const result = await userManagementService.getAllUsers(pagination, filters);

      return NextResponse.json(
        {
          success: true,
          data: {
            data: result.data,
            pagination: result.pagination,
          },
          message: 'Users retrieved successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user by ID
   * GET /api/admin/users/:id
   */
  async getById(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const userManagementService = getUserManagementService();
      const user = await userManagementService.getUserById(id);

      return NextResponse.json(
        {
          success: true,
          data: user,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create user
   * POST /api/admin/users
   */
  async create(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const body = await request.json();
      const validated = createUserSchema.parse(body);

      const userManagementService = getUserManagementService();
      const result = await userManagementService.createUser(validated);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'User created successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update user
   * PUT /api/admin/users/:id
   */
  async update(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const body = await request.json();
      const validated = updateUserSchema.parse(body);

      // Transform null values to undefined for optional fields
      const userData = {
        ...validated,
        phone: validated.phone ?? undefined,
      };

      const userManagementService = getUserManagementService();
      const result = await userManagementService.updateUser(id, userData);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'User updated successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete user
   * DELETE /api/admin/users/:id
   */
  async delete(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const userManagementService = getUserManagementService();
      const result = await userManagementService.deleteUser(id);

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
   * Toggle user status
   * PATCH /api/admin/users/:id/status
   */
  async toggleStatus(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const body = await request.json();
      const { isActive } = z.object({ isActive: z.boolean() }).parse(body);

      const userManagementService = getUserManagementService();
      const result = await userManagementService.toggleUserStatus(id, isActive);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user statistics
   * GET /api/admin/users/statistics
   */
  async getStatistics(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const userManagementService = getUserManagementService();
      const stats = await userManagementService.getUserStats();

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

  private handleError(error: unknown): NextResponse {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          errors: error.errors.reduce(
            (acc, err) => {
              const path = err.path.join('.');
              if (!acc[path]) {
                acc[path] = [];
              }
              acc[path].push(err.message);
              return acc;
            },
            {} as Record<string, string[]>
          ),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }

  private unauthorizedResponse(): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
      },
      { status: 401 }
    );
  }
}

export const userManagementController = new UserManagementController();

