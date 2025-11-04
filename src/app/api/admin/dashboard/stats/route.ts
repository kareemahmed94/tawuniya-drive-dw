import { NextRequest } from 'next/server';
import { dashboardController } from '@/core/controllers/admin';

/**
 * Get Dashboard Statistics
 * GET /api/admin/dashboard/stats
 */
export async function GET(request: NextRequest) {
  return dashboardController.getDashboardStats(request);
}

