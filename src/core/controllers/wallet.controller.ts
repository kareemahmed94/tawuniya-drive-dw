import { injectable, inject } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { TYPES } from '../di/types';
import type { IWalletService } from '../interfaces/services/IWalletService';
import {
  requireAuth,
  validateOwnership,
  successResponse,
  handleError,
} from '@/lib/api/middleware';

/**
 * Wallet Controller
 * Handles HTTP layer for wallet endpoints
 * Delegates business logic to WalletService
 */
@injectable()
export class WalletController {
  constructor(
    @inject(TYPES.WalletService) private walletService: IWalletService
  ) {}

  /**
   * Get wallet details
   * GET /api/wallet/:userId
   */
  async getWallet(
    request: NextRequest,
    params: { userId: string }
  ): Promise<NextResponse> {
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
      const wallet = await this.walletService.getWalletByUserId(userId);

      return successResponse(wallet);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get wallet balance
   * GET /api/wallet/:userId/balance
   */
  async getBalance(
    request: NextRequest,
    params: { userId: string }
  ): Promise<NextResponse> {
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
      const balance = await this.walletService.getBalance(userId);

      return successResponse({ balance });
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get wallet statistics
   * GET /api/wallet/:userId/statistics
   */
  async getStatistics(
    request: NextRequest,
    params: { userId: string }
  ): Promise<NextResponse> {
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
      const statistics = await this.walletService.getWalletStatistics(userId);

      return successResponse(statistics);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get active point balances (breakdown by batch)
   * GET /api/wallet/:userId/point-balances
   */
  async getPointBalances(
    request: NextRequest,
    params: { userId: string }
  ): Promise<NextResponse> {
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
      const pointBalances = await this.walletService.getActivePointBalances(userId);

      return successResponse(pointBalances);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get expiring points
   * GET /api/wallet/:userId/expiring
   */
  async getExpiringPoints(
    request: NextRequest,
    params: { userId: string }
  ): Promise<NextResponse> {
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

      // Get days parameter from query string (default to 30)
      const { searchParams } = new URL(request.url);
      const daysParam = searchParams.get('days');
      const days = daysParam ? parseInt(daysParam, 10) : 30;

      // Validate days parameter
      if (isNaN(days) || days < 1) {
        return NextResponse.json(
          {
            success: false,
            error: 'Days parameter must be a positive number',
          },
          { status: 400 }
        );
      }

      // Get expiring points
      const expiringPoints = await this.walletService.getExpiringPoints(userId, days);

      return successResponse({
        expiringPoints,
        within: `${days} days`,
      });
    } catch (error) {
      return handleError(error);
    }
  }

  // ==================== Helper Methods ====================

  private handleError(error: unknown): NextResponse {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: error.errors.reduce((acc: Record<string, string[]>, err) => {
            const field = err.path.join('.');
            acc[field] = acc[field] ? [...acc[field], err.message] : [err.message];
            return acc;
          }, {}),
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const status = this.getStatusCode(errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status }
    );
  }

  private getStatusCode(message: string): number {
    if (message.includes('not found')) return 404;
    if (message.includes('not active')) return 400;
    if (message.includes('insufficient')) return 400;
    if (message.includes('already exists')) return 409;
    return 500;
  }
}

// Export singleton instance
// Note: For now, we instantiate directly with service from DI container
// This can be moved to a factory pattern later if needed
import { container } from '../di/container';

export const walletController = new WalletController(
  container.get<IWalletService>(TYPES.WalletService)
);
