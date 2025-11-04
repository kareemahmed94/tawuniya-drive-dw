import { NextRequest } from 'next/server';
import { serviceController } from '@/core/controllers/service.controller';

/**
 * Get Service Configurations
 * GET /api/services/:id/config
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return serviceController.getServiceConfigs(request, id);
}

