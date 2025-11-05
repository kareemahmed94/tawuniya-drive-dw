import { NextRequest } from 'next/server';
import { walletController } from '@/core/controllers/wallet.controller';

/**
 * @route   GET /api/wallet/:userId/balance
 * @desc    Get wallet balance
 * @access  Private (Owner or Admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return walletController.getBalance(request, { userId });
}

