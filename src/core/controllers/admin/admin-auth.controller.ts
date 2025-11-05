import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getAdminAuthService } from '@/core/services/admin/serviceLocator';
import { adminLoginSchema, adminRegisterSchema } from '@/core/validators/admin.validator';
import { verifyAdminToken } from '@/lib/api/middleware';

/**
 * Admin Authentication Controller
 * Handles HTTP layer for admin authentication
 */
export class AdminAuthController {
  /**
   * Login admin
   * POST /api/admin/auth/login
   */
  async login(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();

      // Validate input
      const validated = adminLoginSchema.parse(body);

      // Login admin
      const adminAuthService = getAdminAuthService();
      const result = await adminAuthService.login(validated);

      // Create response with cookie
      const response = NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Login successful',
        },
        { status: 200 }
      );

      // Set cookie for middleware (7 days expiry)
      response.cookies.set('admin_token', result.token, {
        httpOnly: false, // Allow client-side access for localStorage sync
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return response;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Register admin
   * POST /api/admin/auth/register
   */
  async register(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();

      // Validate input
      const validated = adminRegisterSchema.parse(body);

      // Register admin
      const adminAuthService = getAdminAuthService();
      const result = await adminAuthService.register(validated);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Admin registered successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get admin profile
   * GET /api/admin/auth/profile
   */
  async getProfile(request: NextRequest): Promise<NextResponse> {
    try {
      // Verify admin token
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication required',
          },
          { status: 401 }
        );
      }

      // Get profile
      const adminAuthService = getAdminAuthService();
      const profile = await adminAuthService.getProfile(adminToken.adminId);

      return NextResponse.json(
        {
          success: true,
          data: profile,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
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
    if (message.includes('Invalid credentials')) return 401;
    if (message.includes('Authentication required')) return 401;
    if (message.includes('deactivated')) return 403;
    return 500;
  }
}

// Export singleton instance
export const adminAuthController = new AdminAuthController();

