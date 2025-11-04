import { NextRequest } from 'next/server';
import { adminManagementController } from '@/core/controllers/admin';

/**
 * Get All Admins
 * GET /api/admin/admins
 */
export async function GET(request: NextRequest) {
  return adminManagementController.index(request);
}

/**
 * Create Admin
 * POST /api/admin/admins
 */
export async function POST(request: NextRequest) {
  return adminManagementController.create(request);
}

