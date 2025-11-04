import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { walletService } from '../di/serviceLocator';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponseUtil } from '../utils/apiResponse';

/**
 * Wallet Controller
 * Handles HTTP requests for wallet endpoints
 */
export class WalletController {
  /**
   * GET /api/wallet/:userId
   * Get wallet details
   */
  getWallet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const wallet = await walletService.getWalletByUserId(userId);
    
    return ApiResponseUtil.success(res, wallet);
  });

  /**
   * GET /api/wallet/:userId/balance
   * Get wallet balance
   */
  getBalance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const balance = await walletService.getBalance(userId);
    
    return ApiResponseUtil.success(res, { balance });
  });

  /**
   * GET /api/wallet/:userId/statistics
   * Get wallet statistics
   */
  getStatistics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const statistics = await walletService.getWalletStatistics(userId);
    
    return ApiResponseUtil.success(res, statistics);
  });

  /**
   * GET /api/wallet/:userId/point-balances
   * Get active point balances (breakdown by batch)
   */
  getPointBalances = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const pointBalances = await walletService.getActivePointBalances(userId);
    
    return ApiResponseUtil.success(res, pointBalances);
  });

  /**
   * GET /api/wallet/:userId/expiring
   * Get expiring points
   */
  getExpiringPoints = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    
    const expiringPoints = await walletService.getExpiringPoints(userId, days);
    
    return ApiResponseUtil.success(res, {
      expiringPoints,
      within: `${days} days`,
    });
  });
}

// Export singleton instance
export const walletController = new WalletController();

