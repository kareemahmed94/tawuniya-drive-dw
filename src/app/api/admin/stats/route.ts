import { NextRequest } from 'next/server';
import { dashboardController } from '@/core/controllers/admin';

/**
 * Get System KPIs
 * GET /api/admin/stats
 */
export async function GET(request: NextRequest) {
  return dashboardController.getSystemKPIs(request);
}

