import { NextRequest } from 'next/server';
import { globalConfigManagementController } from '@/core/controllers/admin';

/**
 * Toggle Global Config Status
 * PATCH /api/admin/global-configs/:id/status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return globalConfigManagementController.toggleStatus(request, id);
}

