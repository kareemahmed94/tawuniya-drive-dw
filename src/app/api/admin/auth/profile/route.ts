import { NextRequest } from 'next/server';
import { adminAuthController } from '@/core/controllers/admin';

/**
 * Get Admin Profile
 * GET /api/admin/auth/profile
 */
export async function GET(request: NextRequest) {
  return adminAuthController.getProfile(request);
}

