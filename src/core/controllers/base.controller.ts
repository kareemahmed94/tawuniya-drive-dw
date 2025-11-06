import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Base Controller
 * Provides common helper methods for all controllers
 * Follows DRY principle by centralizing reusable HTTP response methods
 */
export abstract class BaseController {
  /**
   * Return unauthorized response (401)
   */
  protected unauthorizedResponse(message: string = 'Authentication required'): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 401 }
    );
  }

  /**
   * Return forbidden response (403)
   */
  protected forbiddenResponse(message: string = 'Insufficient permissions'): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 403 }
    );
  }

  /**
   * Return not found response (404)
   */
  protected notFoundResponse(message: string = 'Resource not found'): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 404 }
    );
  }

  /**
   * Return bad request response (400)
   */
  protected badRequestResponse(message: string = 'Bad request', errors?: Record<string, string[]>): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
        ...(errors && { errors }),
      },
      { status: 400 }
    );
  }

  /**
   * Return conflict response (409)
   */
  protected conflictResponse(message: string = 'Resource already exists'): NextResponse {
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 409 }
    );
  }

  /**
   * Return success response
   */
  protected successResponse<T>(
    data: T,
    message?: string,
    status: number = 200
  ): NextResponse {
    return NextResponse.json(
      {
        success: true,
        data,
        ...(message && { message }),
      },
      { status }
    );
  }

  /**
   * Handle errors and return appropriate response
   * Supports ZodError validation errors and general errors
   */
  protected handleError(error: unknown): NextResponse {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: error.errors.reduce((acc: Record<string, string[]>, err) => {
            const field = err.path.join('.');
            if (!acc[field]) acc[field] = [];
            acc[field].push(err.message);
            return acc;
          }, {}),
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const status = this.getStatusCode(errorMessage);

    // Log error for debugging (in production, use proper logging)
    console.error('Controller error:', error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status }
    );
  }

  /**
   * Get appropriate HTTP status code based on error message
   * Can be overridden by child classes for custom status code mapping
   */
  protected getStatusCode(message: string): number {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('already exists') || lowerMessage.includes('already registered')) return 409;
    if (lowerMessage.includes('not found')) return 404;
    if (lowerMessage.includes('invalid credentials') || lowerMessage.includes('authentication required')) return 401;
    if (lowerMessage.includes('insufficient') || lowerMessage.includes('forbidden') || lowerMessage.includes('deactivated')) return 403;
    if (lowerMessage.includes('not active') || lowerMessage.includes('insufficient')) return 400;
    if (lowerMessage.includes('deleted')) return 410;
    if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) return 400;

    return 500;
  }
}

