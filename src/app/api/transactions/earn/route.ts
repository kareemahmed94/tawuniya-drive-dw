import { NextRequest } from 'next/server';
import { transactionService } from '@/core/di/serviceLocator';
import { earnPointsSchema } from '@/core/validators/transaction.validator';
import {
  requireAuth,
  validateBody,
  successResponse,
  handleError,
} from '@/lib/api/middleware';

/**
 * Earn Loyalty Points
 * POST /api/transactions/earn
 * Record a transaction to earn loyalty points based on the service configuration.
 * Points are calculated automatically based on the service's earning rules.
 * Rate limit: 100 requests per 15 minutes.
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    if (user instanceof Response) {
      return user;
    }

    // Validate request body
    const validated = await validateBody(request, earnPointsSchema);
    console.log({validated});
    if (validated instanceof Response) {
      return validated;
    }

    // Earn points
    const result = await transactionService.earnPoints(validated);

    return successResponse(result, 'Points earned successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}

