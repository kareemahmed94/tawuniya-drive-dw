import { NextRequest } from 'next/server';
import { userManagementController } from '@/core/controllers/admin';

/**
 * Get User Statistics
 * GET /api/admin/users/statistics
 */
export async function GET(request: NextRequest) {
  return userManagementController.getStatistics(request);
}

