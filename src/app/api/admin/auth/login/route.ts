import { NextRequest } from 'next/server';
import { adminAuthController } from '@/core/controllers/admin';

/**
 * Admin Login
 * POST /api/admin/auth/login
 */
export async function POST(request: NextRequest) {
  return adminAuthController.login(request);
}

