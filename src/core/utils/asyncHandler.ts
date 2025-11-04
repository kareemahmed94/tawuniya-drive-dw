import { Request, Response, NextFunction } from 'express';

/**
 * Async handler wrapper
 * Eliminates try-catch boilerplate in route handlers
 * Automatically forwards errors to error handling middleware
 */
export const asyncHandler = <T = void>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

