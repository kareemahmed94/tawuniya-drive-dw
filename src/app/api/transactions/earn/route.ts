import { NextRequest } from 'next/server';
import { transactionController } from '@/core/controllers/transaction.controller';

/**
 * Earn Loyalty Points
 * POST /api/transactions/earn
 * Record a transaction to earn loyalty points based on the service configuration.
 * Points are calculated automatically based on the service's earning rules.
 * Rate limit: 100 requests per 15 minutes.
 */
export async function POST(request: NextRequest) {
  return transactionController.earnPoints(request);
}

