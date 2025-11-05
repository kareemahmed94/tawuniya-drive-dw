import { NextRequest } from 'next/server';
import { serviceController } from '@/core/controllers/service.controller';

/**
 * Get All Services
 * GET /api/services
 */
export async function GET(request: NextRequest) {
  return serviceController.getAllServices(request);
}

