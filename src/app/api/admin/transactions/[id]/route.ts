import { NextRequest } from 'next/server';
import { transactionManagementController } from '@/core/controllers/admin';

/**
 * Get Transaction by ID
 * GET /api/admin/transactions/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return transactionManagementController.getTransactionById(request, id);
}

/**
 * Update Transaction
 * PATCH /api/admin/transactions/:id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return transactionManagementController.updateTransaction(request, id);
}

