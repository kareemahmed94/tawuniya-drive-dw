import { NextRequest } from 'next/server';
import { adminAuthController } from '@/core/controllers/admin';

/**
 * Admin Registration
 * POST /api/admin/auth/register
 * 
 * Note: In production, this should be protected and only accessible by super admins
 */
export async function POST(request: NextRequest) {
  return adminAuthController.register(request);
}

