import { NextRequest } from 'next/server';
import { serviceController } from '@/core/controllers/service.controller';

/**
 * Get Service by ID
 * GET /api/services/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return serviceController.getServiceById(request, id);
}

