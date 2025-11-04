import { NextRequest } from 'next/server';
import { transactionService } from '@/core/di/serviceLocator';
import { getTransactionsSchema } from '@/core/validators/transaction.validator';
import {
  requireAuth,
  validateOwnership,
  validateQuery,
  successResponse,
  handleError,
} from '@/lib/api/middleware';

/**
 * @route   GET /api/transactions/:userId
 * @desc    Get transaction history
 * @access  Private (Owner or Admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Authenticate user
    const user = await requireAuth(request);
    if (user instanceof Response) {
      return user;
    }

    // Validate ownership
    const ownershipCheck = validateOwnership(user, userId);
    if (ownershipCheck instanceof Response) {
      return ownershipCheck;
    }

    // Validate query parameters
    const validated = validateQuery(request, getTransactionsSchema);
    if (validated instanceof Response) {
      return validated;
    }

    // Get transactions (cast type to match TransactionType enum)
    const result = await transactionService.getTransactions(userId, validated as any);

    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}

