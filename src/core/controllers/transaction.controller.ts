import { injectable, inject } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { TYPES } from '../di/types';
import type { ITransactionService } from '../interfaces/services/ITransactionService';
import { earnPointsSchema, burnPointsSchema, getTransactionsSchema } from '../validators/transaction.validator';
import {
  requireAuth,
  validateOwnership,
  validateBody,
  validateQuery,
  successResponse,
  handleError,
} from '@/lib/api/middleware';

/**
 * Transaction Controller
 * Handles HTTP layer for transaction endpoints
 * Delegates business logic to TransactionService
 */
@injectable()
export class TransactionController {
  constructor(
    @inject(TYPES.TransactionService) private transactionService: ITransactionService
  ) {}

  /**
   * Earn points from a service
   * POST /api/transactions/earn
   */
  async earnPoints(request: NextRequest): Promise<NextResponse> {
    try {
      // Authenticate user
      const user = await requireAuth(request);
      if (user instanceof Response) {
        return user;
      }

      // Validate request body
      const validated = await validateBody(request, earnPointsSchema);
      if (validated instanceof Response) {
        return validated;
      }

      // Ensure userId matches authenticated user
      if (validated.userId !== user.id) {
        return NextResponse.json(
          {
            success: false,
            error: 'You can only earn points for your own account',
          },
          { status: 403 }
        );
      }

      // Earn points
      const result = await this.transactionService.earnPoints(validated);

      return successResponse(result, 'Points earned successfully', 201);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Burn points for a service
   * POST /api/transactions/burn
   */
  async burnPoints(request: NextRequest): Promise<NextResponse> {
    try {
      // Authenticate user
      const user = await requireAuth(request);
      if (user instanceof Response) {
        return user;
      }

      // Validate request body
      const validated = await validateBody(request, burnPointsSchema);
      if (validated instanceof Response) {
        return validated;
      }

      // Ensure userId matches authenticated user
      if (validated.userId !== user.id) {
        return NextResponse.json(
          {
            success: false,
            error: 'You can only burn points for your own account',
          },
          { status: 403 }
        );
      }

      // Burn points
      const result = await this.transactionService.burnPoints(validated);

      return successResponse(result, 'Points burned successfully', 201);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get transaction history
   * GET /api/transactions/:userId
   */
  async getTransactions(
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

      // Validate query parameters
      const validated = validateQuery(request, getTransactionsSchema);
      if (validated instanceof Response) {
        return validated;
      }

      // Get transactions
      const result = await this.transactionService.getTransactions(
        userId,
        validated as any
      );

      return successResponse(result);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * Get specific transaction
   * GET /api/transactions/:userId/:transactionId
   */
  async getTransaction(
    request: NextRequest,
    params: { userId: string; transactionId: string }
  ): Promise<NextResponse> {
    try {
      const { userId, transactionId } = params;

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
      const transaction = await this.transactionService.getTransactionById(
        transactionId,
        userId
      );

      return successResponse(transaction);
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

export const transactionController = new TransactionController(
  container.get<ITransactionService>(TYPES.TransactionService)
);
