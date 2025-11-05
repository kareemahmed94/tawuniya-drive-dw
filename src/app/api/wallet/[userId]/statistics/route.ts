import { NextRequest } from 'next/server';
import { walletController } from '@/core/controllers/wallet.controller';

/**
 * @route   GET /api/wallet/:userId/statistics
 * @desc    Get wallet statistics
 * @access  Private (Owner or Admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  return walletController.getStatistics(request, await params);
}

