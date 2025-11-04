import { NextResponse } from 'next/server';

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  }, { status: 200 });
}

