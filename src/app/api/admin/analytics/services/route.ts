import { NextRequest } from 'next/server';
import { dashboardController } from '@/core/controllers/admin';

/**
 * Get Service Analytics
 * GET /api/admin/analytics/services
 */
export async function GET(request: NextRequest) {
  return dashboardController.getServiceAnalytics(request);
}

