import { NextRequest } from 'next/server';
import { transactionController } from '@/core/controllers/transaction.controller';

/**
 * @route   GET /api/transactions/:userId/:transactionId
 * @desc    Get specific transaction
 * @access  Private (Owner or Admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; transactionId: string }> }
) {
  const { userId, transactionId } = await params;
  return transactionController.getTransaction(request, { userId, transactionId });
}

