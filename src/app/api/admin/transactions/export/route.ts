import { NextRequest } from 'next/server';
import { transactionManagementController } from '@/core/controllers/admin';

/**
 * Export Transactions to CSV
 * GET /api/admin/transactions/export
 */
export async function GET(request: NextRequest) {
  return transactionManagementController.exportTransactions(request);
}

