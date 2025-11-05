import { NextRequest } from 'next/server';
import { transactionService } from '../di/serviceLocator';
import { earnPointsSchema, burnPointsSchema, getTransactionsSchema } from '../validators/transaction.validator';
import {
  requireAuth,
  validateBody,
  validateQuery,
  validateOwnership,
  successResponse,
  handleError,
} from '../../lib/api/middleware';

/**
 * Transaction Controller
 * Handles HTTP requests for transaction endpoints using Next.js API routes
 */
export class TransactionController {
  /**
   * POST /api/transactions/earn
   * Earn points from a service
   */
  async earnPoints(request: NextRequest): Promise<Response> {
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

      // Earn points
      const result = await transactionService.earnPoints(validated);

      return successResponse(result, 'Points earned successfully', 201);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * POST /api/transactions/burn
   * Burn points for a service
   */
  async burnPoints(request: NextRequest): Promise<Response> {
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

      // Burn points
      const result = await transactionService.burnPoints(validated);

      return successResponse(result, 'Points burned successfully', 201);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * GET /api/transactions/:userId
   * Get transaction history
   */
  async getTransactions(request: NextRequest, userId: string): Promise<Response> {
    try {
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
      const result = await transactionService.getTransactions(userId, validated as any);

      return successResponse(result);
    } catch (error) {
      return handleError(error);
    }
  }

  /**
   * GET /api/transactions/:userId/:transactionId
   * Get specific transaction
   */
  async getTransaction(request: NextRequest, userId: string, transactionId: string): Promise<Response> {
    try {
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
      const transaction = await transactionService.getTransactionById(
        transactionId,
        userId
      );

      return successResponse(transaction);
    } catch (error) {
      return handleError(error);
    }
  }
}

// Export singleton instance
export const transactionController = new TransactionController();

