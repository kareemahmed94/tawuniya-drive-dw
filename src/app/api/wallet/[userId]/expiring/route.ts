import { NextRequest } from 'next/server';
import { walletService } from '@/core/di/serviceLocator';
import {
  requireAuth,
  validateOwnership,
  successResponse,
  handleError,
} from '@/lib/api/middleware';

/**
 * @route   GET /api/wallet/:userId/expiring
 * @desc    Get expiring points
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

    // Get days parameter from query string
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Get expiring points
    const expiringPoints = await walletService.getExpiringPoints(userId, days);

    return successResponse({
      expiringPoints,
      within: `${days} days`,
    });
  } catch (error) {
    return handleError(error);
  }
}

