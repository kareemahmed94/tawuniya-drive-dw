import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { AuthenticatedRequest, JwtPayload } from '../types';
import { config } from '../config/environment';
import { AppError } from './errorHandler';
import { asyncHandler } from '../utils/asyncHandler';
import { prisma } from '../config/database';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (!user) {
        throw new AppError('User not found', 401);
      }

      if (!user.isActive) {
        throw new AppError('Account is deactivated', 403);
      }

      // Attach user to request
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401);
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401);
      }
      throw error;
    }
  }
);

/**
 * Role-based authorization middleware factory
 * Restricts access to specific user roles
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        'You do not have permission to perform this action',
        403
      );
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Does not throw error if no token provided
 */
export const optionalAuthenticate = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, isActive: true },
      });

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    } catch (error) {
      // Silently fail for optional auth
    }

    next();
  }
);

/**
 * Resource ownership validation middleware
 * Ensures user can only access their own resources
 */
export const validateResourceOwnership = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  // Admins can access any resource
  if (req.user.role === UserRole.ADMIN) {
    return next();
  }

  // Users can only access their own resources
  if (req.user.id !== userId) {
    throw new AppError(
      'You can only access your own resources',
      403
    );
  }

  next();
};

