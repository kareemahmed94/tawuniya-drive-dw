import { NextRequest } from 'next/server';
import { transactionService } from '@/core/di/serviceLocator';
import { earnPointsSchema } from '@/core/validators/transaction.validator';
import {
  requireAuth,
  validateBody,
  successResponse,
  handleError,
} from '@/lib/api/middleware';

/**
 * @swagger
 * /api/transactions/earn:
 *   post:
 *     summary: Earn loyalty points
 *     description: Record a transaction to earn loyalty points based on the service configuration. Points are calculated automatically based on the service's earning rules.
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - serviceId
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: clxyz123abc
 *                 description: ID of the user earning points
 *               serviceId:
 *                 type: string
 *                 format: uuid
 *                 example: clservice123
 *                 description: ID of the service providing points
 *               amount:
 *                 type: number
 *                 minimum: 0
 *                 example: 500.00
 *                 description: Transaction amount in SAR
 *               description:
 *                 type: string
 *                 nullable: true
 *                 example: Hotel booking payment
 *                 description: Optional transaction description
 *               metadata:
 *                 type: object
 *                 nullable: true
 *                 example: { "orderId": "ORD-12345", "bookingRef": "BK-98765" }
 *                 description: Additional metadata for the transaction
 *     responses:
 *       200:
 *         description: Points earned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *                 message:
 *                   type: string
 *                   example: Points earned successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Service or wallet not found, or no active earning rule
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: No active earning rule found for this service
 *       429:
 *         description: Rate limit exceeded (100 requests per 15 minutes)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error: Too many requests. Please try again later.
 */
export async function POST(request: NextRequest) {
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

