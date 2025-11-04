import { NextRequest } from 'next/server';
import { dashboardController } from '@/core/controllers/admin';

/**
 * Get User Engagement Metrics
 * GET /api/admin/analytics/engagement
 */
export async function GET(request: NextRequest) {
  return dashboardController.getUserEngagementMetrics(request);
}

