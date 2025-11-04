import { NextRequest } from 'next/server';
import { authController } from '@/core/controllers/auth.controller';

/**
 * User Login
 * POST /api/auth/login
 * Authenticate user with email and password, returns JWT token
 */
export async function POST(request: NextRequest) {
  return authController.login(request);
}

