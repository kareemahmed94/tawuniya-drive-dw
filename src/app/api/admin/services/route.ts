import { NextRequest } from 'next/server';
import { serviceManagementController } from '@/core/controllers/admin';

/**
 * Get All Services
 * GET /api/admin/services
 */
export async function GET(request: NextRequest) {
  return serviceManagementController.getAllServices(request);
}

/**
 * Create Service
 * POST /api/admin/services
 */
export async function POST(request: NextRequest) {
  return serviceManagementController.createService(request);
}

