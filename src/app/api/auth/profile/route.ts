import { NextRequest } from 'next/server';
import { authController } from '@/core/controllers/auth.controller';

/**
 * @route   GET /api/auth/profile
 * @desc    Get authenticated user profile
 * @access  Private
 */
export async function GET(request: NextRequest) {
  return authController.getProfile(request);
}

/**
 * @route   PUT /api/auth/profile
 * @desc    Update authenticated user profile
 * @access  Private
 */
export async function PUT(request: NextRequest) {
  return authController.updateProfile(request);
}

