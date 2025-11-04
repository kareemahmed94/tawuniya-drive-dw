import { NextRequest } from 'next/server';
import { serviceController } from '@/core/controllers/service.controller';

/**
 * Deactivate Service Configuration
 * PATCH /api/services/config/:id/deactivate
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return serviceController.deactivateServiceConfig(request, id);
}

