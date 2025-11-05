import { NextRequest } from 'next/server';
import { walletService } from '../di/serviceLocator';
import {
  requireAuth,
  validateOwnership,
  successResponse,
  handleError,
} from '../../lib/api/middleware';

/**
 * Wallet Controller
 * Handles HTTP requests for wallet endpoints using Next.js API routes
 */
export class WalletController {
  /**
   * GET /api/wallet/:userId
   * Get wallet details
   */
  async getWallet(request: NextRequest, params: { userId: string }): Promise<Response> {
    try {
      const { userId } = params;

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

  /**
   * GET /api/wallet/:userId/balance
   * Get wallet balance
   */
  async getBalance(request: NextRequest, params: { userId: string }): Promise<Response> {
    try {
      const { userId } = params;

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

      // Get balance
      const balance = await walletService.getBalance(userId);

      return successResponse({ balance });
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * GET /api/wallet/:userId/statistics
   * Get wallet statistics
   */
  async getStatistics(request: NextRequest, params: { userId: string }): Promise<Response> {
    try {
      const { userId } = params;

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

      // Get statistics
      const statistics = await walletService.getWalletStatistics(userId);

      return successResponse(statistics);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * GET /api/wallet/:userId/point-balances
   * Get active point balances (breakdown by batch)
   */
  async getPointBalances(request: NextRequest, params: { userId: string }): Promise<Response> {
    try {
      const { userId } = params;

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

      // Get point balances
      const pointBalances = await walletService.getActivePointBalances(userId);

      return successResponse(pointBalances);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * GET /api/wallet/:userId/expiring
   * Get expiring points
   */
  async getExpiringPoints(request: NextRequest, params: { userId: string }): Promise<Response> {
    try {
      const { userId } = params;

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
}

// Export singleton instance
export const walletController = new WalletController();

