import { NextRequest } from 'next/server';
import { transactionController } from '@/core/controllers/transaction.controller';

/**
 * @route   GET /api/transactions/:userId
 * @desc    Get transaction history
 * @access  Private (Owner or Admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return transactionController.getTransactions(request, userId);
}

