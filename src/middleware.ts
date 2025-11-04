import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * Handles authentication and route protection
 * Runs on Edge Runtime - cannot use Node.js APIs
 */

// Public routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
  '/api/docs',
];

// Admin routes that require admin authentication
const adminRoutes = [
  '/admin',
];

// Admin public routes (login)
const adminPublicRoutes = [
  '/admin/login',
  '/api/admin/auth/login',
];

/**
 * Check if path matches any of the patterns
 */
function matchesPath(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    if (pattern.endsWith('*')) {
      return pathname.startsWith(pattern.slice(0, -1));
    }
    return pathname === pattern || pathname.startsWith(pattern + '/');
  });
}

/**
 * Extract token from cookie
 * Note: In Edge Runtime, we can only read cookies, not verify JWT
 * Actual token verification happens in API routes
 */
function getToken(request: NextRequest): string | null {
  const tokenCookie = request.cookies.get('auth_token');
  return tokenCookie?.value || null;
}

/**
 * Extract admin token from cookie
 */
function getAdminToken(request: NextRequest): string | null {
  const tokenCookie = request.cookies.get('admin_token');
  return tokenCookie?.value || null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API routes that are public
  if (matchesPath(pathname, publicRoutes)) {
    return NextResponse.next();
  }

  // Handle admin routes
  if (matchesPath(pathname, adminRoutes)) {
    // Allow admin login page
    if (matchesPath(pathname, adminPublicRoutes)) {
      return NextResponse.next();
    }

    // Check for admin token
    const adminToken = getAdminToken(request);
    if (!adminToken) {
      // Redirect to admin login
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Handle regular user routes (dashboard, services, transactions)
  // Check for user token
  const token = getToken(request);

  // If no token and trying to access protected route, redirect to login
  if (!token && !pathname.startsWith('/api/')) {
    // Don't redirect if already on login page
    if (!pathname.startsWith('/auth/')) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Allow API routes to handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

