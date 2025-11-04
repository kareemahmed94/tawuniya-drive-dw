import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { authService } from '@/core/di/serviceLocator';
import { loginSchema, registerSchema, updateProfileSchema } from '@/core/validators/auth.validator';
import { requireAuth } from '@/lib/api/middleware';

/**
 * Authentication Controller
 * Handles HTTP layer for user authentication endpoints
 * Thin wrapper that delegates to AuthService
 */
export class AuthController {
  /**
   * Login user
   * POST /api/auth/login
   */
  async login(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();

      // Validate input
      const validated = loginSchema.parse(body);

      // Login user
      const result = await authService.login(validated);

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
      response.cookies.set('auth_token', result.token, {
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
   * Register user
   * POST /api/auth/register
   */
  async register(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();

      // Validate input
      const validated = registerSchema.parse(body);

      // Register user
      const result = await authService.register(validated);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'User registered successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user profile
   * GET /api/auth/profile
   */
  async getProfile(request: NextRequest): Promise<NextResponse> {
    try {
      // Authenticate user
      const user = await requireAuth(request);
      if (user instanceof NextResponse) {
        return user;
      }

      // Get profile
      const profile = await authService.getProfile(user.id);

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
   * Update user profile
   * PUT /api/auth/profile
   */
  async updateProfile(request: NextRequest): Promise<NextResponse> {
    try {
      // Authenticate user
      const user = await requireAuth(request);
      if (user instanceof NextResponse) {
        return user;
      }

      // Validate request body
      const body = await request.json();
      const validated = updateProfileSchema.parse(body);

      // Update profile
      const updatedProfile = await authService.updateProfile(user.id, validated);

      return NextResponse.json(
        {
          success: true,
          data: updatedProfile,
          message: 'Profile updated successfully',
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
    if (message.includes('already exists') || message.includes('already registered')) return 409;
    if (message.includes('not found')) return 404;
    if (message.includes('Invalid credentials')) return 401;
    if (message.includes('Authentication required')) return 401;
    if (message.includes('deactivated')) return 403;
    return 500;
  }
}

// Export singleton instance
export const authController = new AuthController();
