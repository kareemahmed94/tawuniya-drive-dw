import rateLimit from 'express-rate-limit';
import { config } from '@/core/config/environment';

/**
 * General API rate limiter
 * Prevents abuse by limiting requests per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isProduction ? 100 : 1000, // 100 requests per 15 min in production
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.isProduction ? 5 : 100, // 5 login attempts per 15 min in production
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Too many login attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Transaction rate limiter
 * Prevents rapid transaction spam
 */
export const transactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: config.isProduction ? 10 : 100, // 10 transactions per minute
  message: {
    success: false,
    error: 'Too many transactions, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

