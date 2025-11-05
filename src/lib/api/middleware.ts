import {NextRequest, NextResponse} from 'next/server';
import jwt from 'jsonwebtoken';
import {AdminRole} from '@prisma/client';
import {config} from '@/core/config/environment';
import {prisma} from '@/core/config/database';
import {ZodSchema} from 'zod';
import {JwtPayload} from '@/core/types';

/**
 * Authenticated user context
 * Note: Users don't have roles - only Admins have roles
 */
export interface AuthUser {
    id: string;
    email: string;
}

/**
 * Error response helper
 */
export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json(
        {
            success: false,
            error: message,
            message,
        },
        {status}
    );
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, message?: string, status: number = 200) {
    return NextResponse.json(
        {
            success: true,
            data,
            ...(message && {message}),
        },
        {status}
    );
}

/**
 * Extract and verify JWT token from Next.js request
 * Checks both Authorization header and cookies
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthUser | null> {
    try {
        // Try Authorization header first
        let token: string | null = null;
        const authHeader = request.headers.get('authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            // Fallback to cookie if no Authorization header
            const cookie = request.cookies.get('auth_token');
            token = cookie?.value || null;
        }

        if (!token) {
            return null;
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

        // Check if user still exists and is active
        const user = await prisma.user.findUnique({
            where: {id: decoded.userId},
            select: {id: true, email: true, isActive: true},
        });

        if (!user || !user.isActive) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
        };
    } catch (error) {
        return null;
    }
}

/**
 * Require authentication - returns error response if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser | NextResponse> {
    const user = await authenticateRequest(request);

    if (!user) {
        return errorResponse('Authentication required', 401);
    }

    return user;
}

/**
 * Validate resource ownership (user can only access their own resources)
 * Note: Users don't have roles - admins are separate entities with their own auth
 */
export function validateOwnership(user: AuthUser, resourceUserId: string): NextResponse | true {
    // Users can only access their own resources
    if (user.id !== resourceUserId) {
        return errorResponse('You can only access your own resources', 403);
    }

    return true;
}

/**
 * Validate request body with Zod schema
 */
export async function validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): Promise<T | NextResponse> {
    try {
        const body = await request.json();
        const validated = schema.parse(body);
        return validated;
    } catch (error: any) {
      const fieldErrors: Record<string, string[]> = {};
      if (error.errors) {
            error.errors.forEach((err: any) => {
                const path = err.path.join('.');
                if (!fieldErrors[path]) {
                    fieldErrors[path] = [];
                }
                fieldErrors[path].push(err.message);
            });
        }

      console.log({error})
      console.log({fieldErrors})
        return NextResponse.json(
            {
                success: false,
                error: 'Validation failed',
                errors: fieldErrors,
            },
            {status: 500}
        );
        // return errorResponse('Invalid request body', 400);
    }
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQuery<T>(
    request: NextRequest,
    schema: ZodSchema<T>
): T | NextResponse {
    try {
        const {searchParams} = new URL(request.url);
        const queryObject: Record<string, any> = {};

        searchParams.forEach((value, key) => {
            queryObject[key] = value;
        });

        const validated = schema.parse(queryObject);
        return validated;
    } catch (error: any) {
        if (error.errors) {
            const fieldErrors: Record<string, string[]> = {};
            error.errors.forEach((err: any) => {
                const path = err.path.join('.');
                if (!fieldErrors[path]) {
                    fieldErrors[path] = [];
                }
                fieldErrors[path].push(err.message);
            });
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation failed',
                    errors: fieldErrors,
                },
                {status: 400}
            );
        }
        return errorResponse('Invalid query parameters', 400);
    }
}

/**
 * Handle errors in route handlers
 */
export function handleError(error: unknown): NextResponse {
    console.error('API Error:', error);

    // Handle AppError instances (from core/middleware/errorHandler)
    if (error && typeof error === 'object' && 'statusCode' in error) {
        const err = error as { statusCode: number; message: string };
        return errorResponse(err.message, err.statusCode);
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'name' in error) {
        if (error.name === 'PrismaClientKnownRequestError') {
            return errorResponse('Database error', 500);
        }
        if (error.name === 'PrismaClientValidationError') {
            return errorResponse('Invalid data provided', 400);
        }
    }

    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
        const fieldErrors: Record<string, string[]> = {};
        zodError.issues.forEach((issue) => {
            const path = issue.path.join('.');
            if (!fieldErrors[path]) {
                fieldErrors[path] = [];
            }
            fieldErrors[path].push(issue.message);
        });
        return NextResponse.json(
            {
                success: false,
                error: 'Validation failed',
                errors: fieldErrors,
            },
            {status: 400}
        );
    }

    // Handle generic errors
    const message = error instanceof Error ? error.message : 'Internal server error';

    return errorResponse(
        process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : message,
        500
    );
}

// ==================== Admin Authentication ====================

/**
 * Admin user context
 */
export interface AdminUser {
    adminId: string;
    email: string;
    role: AdminRole;
}

/**
 * Admin JWT Payload structure
 */
interface AdminJwtPayload {
    adminId: string;
    email: string;
    role: AdminRole;
    type: 'admin';
}

/**
 * Verify admin JWT token from request
 */
export function verifyAdminToken(request: NextRequest): AdminUser | null {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret) as AdminJwtPayload;

        // Verify it's an admin token
        if (decoded.type !== 'admin') {
            return null;
        }

        return {
            adminId: decoded.adminId,
            email: decoded.email,
            role: decoded.role,
        };
    } catch (error) {
        return null;
    }
}

/**
 * Require admin authentication
 */
export function requireAdminAuth(request: NextRequest): AdminUser | NextResponse {
    const admin = verifyAdminToken(request);

    if (!admin) {
        return errorResponse('Admin authentication required', 401);
    }

    return admin;
}

/**
 * Require specific admin role(s)
 */
export function requireAdminRole(admin: AdminUser, allowedRoles: AdminRole[]): NextResponse | true {
    if (!allowedRoles.includes(admin.role)) {
        return errorResponse('Insufficient permissions', 403);
    }
    return true;
}

