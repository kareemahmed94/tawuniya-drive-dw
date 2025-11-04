import { NextRequest } from 'next/server';
import { userManagementController } from '@/core/controllers/admin';

/**
 * Get User by ID
 * GET /api/admin/users/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return userManagementController.getById(request, id);
}

/**
 * Update User
 * PUT /api/admin/users/:id
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return userManagementController.update(request, id);
}

/**
 * Delete User
 * DELETE /api/admin/users/:id
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return userManagementController.delete(request, id);
}

