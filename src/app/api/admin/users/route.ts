import { NextRequest } from 'next/server';
import { userManagementController } from '@/core/controllers/admin';

/**
 * Get All Users
 * GET /api/admin/users
 */
export async function GET(request: NextRequest) {
  return userManagementController.index(request);
}

/**
 * Create User
 * POST /api/admin/users
 */
export async function POST(request: NextRequest) {
  return userManagementController.create(request);
}

