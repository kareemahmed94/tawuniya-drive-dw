import { NextRequest } from 'next/server';
import { dashboardController } from '@/core/controllers/admin';

/**
 * Get Transaction Trends
 * GET /api/admin/analytics/trends
 */
export async function GET(request: NextRequest) {
  return dashboardController.getTransactionTrends(request);
}

