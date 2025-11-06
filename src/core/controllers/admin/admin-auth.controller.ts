import { injectable, inject } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { TYPES } from '@/core/di/types';
import type { IAdminAuthService } from '@/core/interfaces/services/IAdminAuthService';
import { adminLoginSchema, adminRegisterSchema } from '@/core/validators/admin.validator';
import { verifyAdminToken } from '@/lib/api/middleware';
import { BaseController } from '../base.controller';

/**
 * Admin Authentication Controller
 * Handles HTTP layer for admin authentication
 */
@injectable()
export class AdminAuthController extends BaseController {
  constructor(
    @inject(TYPES.AdminAuthService) private adminAuthService: IAdminAuthService
  ) {
    super();
  }
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
      const result = await this.adminAuthService.login(validated);

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
      const result = await this.adminAuthService.register(validated);

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
      const profile = await this.adminAuthService.getProfile(adminToken.adminId);

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
   * Refresh admin token
   * POST /api/admin/auth/refresh
   */
  async refreshToken(request: NextRequest): Promise<NextResponse> {
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

      // Refresh token
      const result = await this.adminAuthService.refreshToken(adminToken.adminId);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Token refreshed successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

}

// Controller instances are exported from @/core/di/adminControllerFactory

