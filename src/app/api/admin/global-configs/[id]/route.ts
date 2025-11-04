import { NextRequest } from 'next/server';
import { globalConfigManagementController } from '@/core/controllers/admin';

/**
 * Get Global Config by ID
 * GET /api/admin/global-configs/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return globalConfigManagementController.getById(request, id);
}

/**
 * Update Global Config
 * PUT /api/admin/global-configs/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return globalConfigManagementController.update(request, id);
}

/**
 * Delete Global Config
 * DELETE /api/admin/global-configs/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return globalConfigManagementController.delete(request, id);
}

