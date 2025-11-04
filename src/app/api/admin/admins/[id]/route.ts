import { NextRequest } from 'next/server';
import { adminManagementController } from '@/core/controllers/admin';

/**
 * Get Admin by ID
 * GET /api/admin/admins/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return adminManagementController.getById(request, id);
}

/**
 * Update Admin
 * PUT /api/admin/admins/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return adminManagementController.update(request, id);
}

/**
 * Delete Admin
 * DELETE /api/admin/admins/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return adminManagementController.remove(request, id);
}

