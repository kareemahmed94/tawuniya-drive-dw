import { NextRequest } from 'next/server';
import { transactionManagementController } from '@/core/controllers/admin';

/**
 * Get Transactions by User ID
 * GET /api/admin/transactions/user/:userId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return transactionManagementController.getTransactionsByUserId(request, userId);
}

