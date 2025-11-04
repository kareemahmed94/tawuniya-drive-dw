import { NextRequest } from 'next/server';
import { serviceManagementController } from '@/core/controllers/admin';

/**
 * Toggle Service Status
 * PATCH /api/admin/services/:id/status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return serviceManagementController.toggleServiceStatus(request, id);
}

