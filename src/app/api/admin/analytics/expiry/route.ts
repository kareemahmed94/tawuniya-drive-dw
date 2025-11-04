import { NextRequest } from 'next/server';
import { dashboardController } from '@/core/controllers/admin';

/**
 * Get Expiry Analytics
 * GET /api/admin/analytics/expiry
 */
export async function GET(request: NextRequest) {
  return dashboardController.getExpiryAnalytics(request);
}

