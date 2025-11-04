import { NextRequest } from 'next/server';
import { serviceController } from '@/core/controllers/service.controller';

/**
 * Create Service Configuration
 * POST /api/services/config
 */
export async function POST(request: NextRequest) {
  return serviceController.createServiceConfig(request);
}

