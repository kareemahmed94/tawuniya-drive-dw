import { NextRequest } from 'next/server';
import { globalConfigManagementController } from '@/core/controllers/admin';

/**
 * Get All Global Configs
 * GET /api/admin/global-configs
 */
export async function GET(request: NextRequest) {
  return globalConfigManagementController.index(request);
}

/**
 * Create Global Config
 * POST /api/admin/global-configs
 */
export async function POST(request: NextRequest) {
  return globalConfigManagementController.create(request);
}

