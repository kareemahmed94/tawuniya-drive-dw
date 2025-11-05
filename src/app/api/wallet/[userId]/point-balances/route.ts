import { NextRequest } from 'next/server';
import { walletController } from '@/core/controllers/wallet.controller';

/**
 * @route   GET /api/wallet/:userId/point-balances
 * @desc    Get active point balances (breakdown by batch)
 * @access  Private (Owner or Admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  return walletController.getPointBalances(request, await params);
}

