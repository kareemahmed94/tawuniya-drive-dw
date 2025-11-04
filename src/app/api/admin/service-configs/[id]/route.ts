import { NextRequest } from 'next/server';
import { serviceManagementController } from '@/core/controllers/admin';

/**
 * Get Service Config by ID
 * GET /api/admin/service-configs/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return serviceManagementController.getServiceConfigById(request, id);
}

/**
 * Update Service Config
 * PUT /api/admin/service-configs/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return serviceManagementController.updateServiceConfig(request, id);
}

/**
 * Delete Service Config
 * DELETE /api/admin/service-configs/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return serviceManagementController.deleteServiceConfig(request, id);
}

