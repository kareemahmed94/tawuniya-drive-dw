import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { transactionService } from '../di/serviceLocator';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponseUtil } from '../utils/apiResponse';

/**
 * Transaction Controller
 * Handles HTTP requests for transaction endpoints
 */
export class TransactionController {
  /**
   * POST /api/transactions/earn
   * Earn points from a service
   */
  earnPoints = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await transactionService.earnPoints(req.body);
    
    return ApiResponseUtil.created(
      res,
      result,
      'Points earned successfully'
    );
  });

  /**
   * POST /api/transactions/burn
   * Burn points for a service
   */
  burnPoints = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await transactionService.burnPoints(req.body);
    
    return ApiResponseUtil.success(
      res,
      result,
      'Points burned successfully'
    );
  });

  /**
   * GET /api/transactions/:userId
   * Get transaction history
   */
  getTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId } = req.params;
    const {
      page,
      limit,
      type,
      serviceId,
      startDate,
      endDate,
    } = req.query as any;

    const result = await transactionService.getTransactions(userId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      type,
      serviceId,
      startDate,
      endDate,
    });

    return ApiResponseUtil.paginated(
      res,
      result.transactions,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  });

  /**
   * GET /api/transactions/:userId/:transactionId
   * Get specific transaction
   */
  getTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { userId, transactionId } = req.params;
    const transaction = await transactionService.getTransactionById(
      transactionId,
      userId
    );
    
    return ApiResponseUtil.success(res, transaction);
  });
}

// Export singleton instance
export const transactionController = new TransactionController();

