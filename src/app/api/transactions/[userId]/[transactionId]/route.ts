import { NextRequest } from 'next/server';
import { transactionService } from '@/core/di/serviceLocator';
import {
  requireAuth,
  validateOwnership,
  successResponse,
  handleError,
} from '@/lib/api/middleware';

/**
 * @route   GET /api/transactions/:userId/:transactionId
 * @desc    Get specific transaction
 * @access  Private (Owner or Admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; transactionId: string }> }
) {
  try {
    const { userId, transactionId } = await params;
    
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

    // Get transaction
    const transaction = await transactionService.getTransactionById(
      transactionId,
      userId
    );

    return successResponse(transaction);
  } catch (error) {
    return handleError(error);
  }
}

