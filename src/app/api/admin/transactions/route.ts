import { NextRequest } from 'next/server';
import { transactionManagementController } from '@/core/controllers/admin';

/**
 * Get All Transactions
 * GET /api/admin/transactions
 */
export async function GET(request: NextRequest) {
  return transactionManagementController.getAllTransactions(request);
}

