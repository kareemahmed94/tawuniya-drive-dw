import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

/**
 * Utility class for standardized API responses
 * Follows consistent response format across all endpoints
 */
export class ApiResponseUtil {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send created response (201)
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): Response {
    return ApiResponseUtil.success(res, data, message, 201);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors?: Record<string, string[]>
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: message,
      ...(errors && { errors }),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response (422)
   */
  static validationError(
    res: Response,
    errors: Record<string, string[]>
  ): Response {
    return ApiResponseUtil.error(
      res,
      'Validation failed',
      422,
      errors
    );
  }

  /**
   * Send not found response (404)
   */
  static notFound(
    res: Response,
    resource: string = 'Resource'
  ): Response {
    return ApiResponseUtil.error(
      res,
      `${resource} not found`,
      404
    );
  }

  /**
   * Send unauthorized response (401)
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized'
  ): Response {
    return ApiResponseUtil.error(res, message, 401);
  }

  /**
   * Send forbidden response (403)
   */
  static forbidden(
    res: Response,
    message: string = 'Forbidden'
  ): Response {
    return ApiResponseUtil.error(res, message, 403);
  }

  /**
   * Send internal server error (500)
   */
  static serverError(
    res: Response,
    message: string = 'Internal server error'
  ): Response {
    return ApiResponseUtil.error(res, message, 500);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number
  ): Response {
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    return res.status(200).json(response);
  }
}

