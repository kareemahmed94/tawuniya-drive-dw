import { NextRequest } from 'next/server';
import { transactionManagementController } from '@/core/controllers/admin';

/**
 * Get Transactions by Service ID
 * GET /api/admin/transactions/service/:serviceId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceId: string }> }
) {
  const { serviceId } = await params;
  return transactionManagementController.getTransactionsByServiceId(request, serviceId);
}

