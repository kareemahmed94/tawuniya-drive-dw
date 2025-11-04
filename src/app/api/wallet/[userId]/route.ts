import { NextRequest } from 'next/server';
import { walletService } from '@/core/di/serviceLocator';
import {
  requireAuth,
  validateOwnership,
  successResponse,
  handleError,
} from '@/lib/api/middleware';

/**
 * @route   GET /api/wallet/:userId
 * @desc    Get wallet details
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

    // Get wallet
    const wallet = await walletService.getWalletByUserId(userId);

    return successResponse(wallet);
  } catch (error) {
    return handleError(error);
  }
}

