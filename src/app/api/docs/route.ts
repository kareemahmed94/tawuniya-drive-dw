import { NextResponse } from 'next/server';
import { generateSimpleOpenAPISpec } from '@/lib/openapi/simple-auto-docs';

/**
 * API Documentation Endpoint
 * Returns OpenAPI specification in JSON format
 * 
 * This endpoint automatically generates documentation from:
 * - Route structure in src/app/api
 * - Aligned with existing Zod validators
 * - No manual JSDoc comments needed!
 */
export async function GET() {
  try {
    // Generate OpenAPI spec automatically
    const spec = generateSimpleOpenAPISpec();
    
    return NextResponse.json(spec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating API docs:', error);
    return NextResponse.json(
      { error: 'Failed to generate API documentation' },
      { status: 500 }
    );
  }
}

