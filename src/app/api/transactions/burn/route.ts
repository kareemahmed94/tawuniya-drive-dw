import { NextRequest } from 'next/server';
import { transactionController } from '@/core/controllers/transaction.controller';

/**
 * @route   POST /api/transactions/burn
 * @desc    Burn points for a service
 * @access  Private (Customer or Admin)
 */
export async function POST(request: NextRequest) {
  return transactionController.burnPoints(request);
}

