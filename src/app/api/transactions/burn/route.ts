import { NextRequest } from 'next/server';
import { transactionService } from '@/core/di/serviceLocator';
import { burnPointsSchema } from '@/core/validators/transaction.validator';
import {
  requireAuth,
  validateBody,
  successResponse,
  handleError,
} from '@/lib/api/middleware';

/**
 * @route   POST /api/transactions/burn
 * @desc    Burn points for a service
 * @access  Private (Customer or Admin)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth(request);
    if (user instanceof Response) {
      return user;
    }

    // Validate request body
    const validated = await validateBody(request, burnPointsSchema);
    if (validated instanceof Response) {
      return validated;
    }

    // Burn points
    const result = await transactionService.burnPoints(validated);

    return successResponse(result, 'Points burned successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}

