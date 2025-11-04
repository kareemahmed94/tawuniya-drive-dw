import { NextRequest } from 'next/server';
import { transactionManagementController } from '@/core/controllers/admin';

/**
 * Get Transaction Trends
 * GET /api/admin/transactions/trends
 */
export async function GET(request: NextRequest) {
  return transactionManagementController.getTrends(request);
}

