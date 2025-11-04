import { NextRequest } from 'next/server';
import { serviceManagementController } from '@/core/controllers/admin';

/**
 * Get All Service Configs
 * GET /api/admin/service-configs
 */
export async function GET(request: NextRequest) {
  return serviceManagementController.getAllServiceConfigs(request);
}

/**
 * Create Service Config
 * POST /api/admin/service-configs
 */
export async function POST(request: NextRequest) {
  return serviceManagementController.createServiceConfig(request);
}

