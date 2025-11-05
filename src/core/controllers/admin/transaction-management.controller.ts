import { injectable, inject } from 'inversify';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { TYPES } from '@/core/di/types';
import type { ITransactionManagementService } from '@/core/interfaces/services/ITransactionManagementService';
import {
  transactionFiltersSchema,
  updateTransactionSchema,
  paginationSchema,
} from '@/core/validators/admin.validator';
import { verifyAdminToken } from '@/lib/api/middleware';

/**
 * Transaction Management Controller
 * Handles HTTP layer for transaction management operations
 */
@injectable()
export class TransactionManagementController {
  constructor(
    @inject(TYPES.TransactionManagementService) private transactionManagementService: ITransactionManagementService
  ) {}
  /**
   * Get all transactions
   * GET /api/admin/transactions
   */
  async getAllTransactions(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const { searchParams } = new URL(request.url);
      const pagination = paginationSchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '20',
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
      });

      const filters = transactionFiltersSchema.parse({
        userId: searchParams.get('userId') || undefined,
        serviceId: searchParams.get('serviceId') || undefined,
        type: searchParams.get('type') || undefined,
        status: searchParams.get('status') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        minAmount: searchParams.get('minAmount') || undefined,
        maxAmount: searchParams.get('maxAmount') || undefined,
        minPoints: searchParams.get('minPoints') || undefined,
        maxPoints: searchParams.get('maxPoints') || undefined,
      });

      const result = await this.transactionManagementService.getAllTransactions(pagination, filters);

      return NextResponse.json(
        {
          success: true,
          data: {
            data: result.data,
            pagination: result.pagination,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get transaction by ID
   * GET /api/admin/transactions/:id
   */
  async getTransactionById(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const transaction = await this.transactionManagementService.getTransactionById(id);

      return NextResponse.json(
        {
          success: true,
          data: transaction,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get transactions by user ID
   * GET /api/admin/transactions/user/:userId
   */
  async getTransactionsByUserId(request: NextRequest, userId: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const { searchParams } = new URL(request.url);
      const pagination = paginationSchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '20',
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
      });

      const result = await this.transactionManagementService.getTransactionsByUserId(userId, pagination);

      return NextResponse.json(
        {
          success: true,
          data: result.data,
          pagination: result.pagination,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get transactions by service ID
   * GET /api/admin/transactions/service/:serviceId
   */
  async getTransactionsByServiceId(request: NextRequest, serviceId: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const { searchParams } = new URL(request.url);
      const pagination = paginationSchema.parse({
        page: searchParams.get('page') || '1',
        limit: searchParams.get('limit') || '20',
        sortBy: searchParams.get('sortBy') || 'createdAt',
        sortOrder: searchParams.get('sortOrder') || 'desc',
      });

      const result = await this.transactionManagementService.getTransactionsByServiceId(
        serviceId,
        pagination
      );

      return NextResponse.json(
        {
          success: true,
          data: result.data,
          pagination: result.pagination,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update transaction
   * PATCH /api/admin/transactions/:id
   */
  async updateTransaction(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Only admins and super admins can update transactions
      if (!this.isAdminOrHigher(adminToken.role)) {
        return this.forbiddenResponse();
      }

      const body = await request.json();
      const validated = updateTransactionSchema.parse(body);

      const result = await this.transactionManagementService.updateTransaction(id, validated);

      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Transaction updated successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get transaction statistics
   * GET /api/admin/transactions/statistics
   */
  async getStatistics(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const { searchParams } = new URL(request.url);
      const filters = {
        startDate: searchParams.get('startDate')
          ? new Date(searchParams.get('startDate')!)
          : undefined,
        endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
        serviceId: searchParams.get('serviceId') || undefined,
      };

      const stats = await this.transactionManagementService.getTransactionStatistics(filters);

      return NextResponse.json(
        {
          success: true,
          data: stats,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get transaction trends
   * GET /api/admin/transactions/trends
   */
  async getTrends(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      const { searchParams } = new URL(request.url);
      const period = searchParams.get('period') as 'day' | 'week' | 'month' | 'year' || 'month';
      const startDate = searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : new Date();

      const trends = await this.transactionManagementService.getTransactionTrends(
        period,
        startDate,
        endDate
      );

      return NextResponse.json(
        {
          success: true,
          data: trends,
        },
        { status: 200 }
      );
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Export transactions to CSV
   * GET /api/admin/transactions/export
   */
  async exportTransactions(request: NextRequest): Promise<NextResponse> {
    try {
      const adminToken = verifyAdminToken(request);
      if (!adminToken) {
        return this.unauthorizedResponse();
      }

      // Only admins and super admins can export
      if (!this.isAdminOrHigher(adminToken.role)) {
        return this.forbiddenResponse();
      }

      const { searchParams } = new URL(request.url);
      const filters = transactionFiltersSchema.parse({
        userId: searchParams.get('userId') || undefined,
        serviceId: searchParams.get('serviceId') || undefined,
        type: searchParams.get('type') || undefined,
        status: searchParams.get('status') || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        minAmount: searchParams.get('minAmount') || undefined,
        maxAmount: searchParams.get('maxAmount') || undefined,
        minPoints: searchParams.get('minPoints') || undefined,
        maxPoints: searchParams.get('maxPoints') || undefined,
      });

      const csv = await this.transactionManagementService.exportTransactions(filters);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transactions_${Date.now()}.csv"`,
        },
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== Helper Methods ====================

  private isAdminOrHigher(role: string): boolean {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  private unauthorizedResponse(): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
      },
      { status: 401 }
    );
  }

  private forbiddenResponse(message = 'Insufficient permissions'): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 403 }
    );
  }

  private handleError(error: unknown): NextResponse {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: error.errors.reduce((acc: Record<string, string[]>, err) => {
            const field = err.path.join('.');
            if (!acc[field]) acc[field] = [];
            acc[field].push(err.message);
            return acc;
          }, {}),
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Operation failed';
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
    if (message.includes('deleted')) return 410;
    return 500;
  }
}

// Controller instances are exported from @/core/di/adminControllerFactory

