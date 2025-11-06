import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError, ZodIssue } from 'zod';
import logger from '@/core/utils/logger';
import { config } from '@/core/config/environment';
import { ErrorResponse } from '@/core/types';

/**
 * Custom Application Error class
 * Extends native Error with HTTP status code
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 * Catches all errors and returns standardized responses
 */
export const errorHandler = (
  err: Error | AppError | ZodError | Prisma.PrismaClientKnownRequestError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors: Record<string, string[]> | undefined;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Handle different error types
  if (err instanceof AppError) {
    // Custom application errors
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    // Zod validation errors
    statusCode = 422;
    message = 'Validation failed';
    errors = err.issues.reduce((acc: Record<string, string[]>, error: ZodIssue) => {
      const path = error.path.join('.');
      if (!acc[path]) acc[path] = [];
      acc[path].push(error.message);
      return acc;
    }, {} as Record<string, string[]>);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Prisma database errors
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = `Duplicate entry: ${(err.meta?.target as string[])?.join(', ') || 'field'} already exists`;
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Invalid foreign key reference';
        break;
      default:
        statusCode = 400;
        message = 'Database error occurred';
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  }

  // Build error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: message,
    message: err.message,
    statusCode,
    ...(errors && { errors }),
    ...(config.isDevelopment && { stack: err.stack }),
  };

  return res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 * Catches requests to non-existent routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  return res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.url}`,
    statusCode: 404,
  });
};

