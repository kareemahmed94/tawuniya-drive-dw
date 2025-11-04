import { NextRequest } from 'next/server';
import { serviceManagementController } from '@/core/controllers/admin';

/**
 * Get Service by ID
 * GET /api/admin/services/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return serviceManagementController.getServiceById(request, id);
}

/**
 * Update Service
 * PUT /api/admin/services/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return serviceManagementController.updateService(request, id);
}

/**
 * Delete Service
 * DELETE /api/admin/services/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return serviceManagementController.deleteService(request, id);
}

