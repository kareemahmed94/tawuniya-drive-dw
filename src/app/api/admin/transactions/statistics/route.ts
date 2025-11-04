import { NextRequest } from 'next/server';
import { transactionManagementController } from '@/core/controllers/admin';

/**
 * Get Transaction Statistics
 * GET /api/admin/transactions/statistics
 */
export async function GET(request: NextRequest) {
  return transactionManagementController.getStatistics(request);
}

