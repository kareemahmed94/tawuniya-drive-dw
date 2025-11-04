import { NextRequest } from 'next/server';
import { serviceManagementController } from '@/core/controllers/admin';

/**
 * Toggle Service Config Status
 * PATCH /api/admin/service-configs/:id/status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return serviceManagementController.toggleServiceConfigStatus(request, id);
}

