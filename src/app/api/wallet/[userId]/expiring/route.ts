import { NextRequest } from 'next/server';
import { walletController } from '@/core/controllers/wallet.controller';

/**
 * @route   GET /api/wallet/:userId/expiring
 * @desc    Get expiring points
 * @access  Private (Owner or Admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  return walletController.getExpiringPoints(request, await params);
}

