import { NextRequest } from 'next/server';
import { authController } from '@/core/controllers/auth.controller';

/**
 * User Registration
 * POST /api/auth/register
 * Create a new user account with email and password. Automatically creates a wallet for the user.
 */
export async function POST(request: NextRequest) {
  return authController.register(request);
}

