import { NextRequest } from 'next/server';
import { userManagementController } from '@/core/controllers/admin';

/**
 * Toggle User Status
 * PATCH /api/admin/users/:id/status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return userManagementController.toggleStatus(request, id);
}

