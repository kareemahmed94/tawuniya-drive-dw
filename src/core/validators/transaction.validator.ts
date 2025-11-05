import { z } from 'zod';

// ============================================
// Express Middleware Schemas (with wrappers)
// ============================================

/**
 * Earn points validation schema (Express)
 */
export const earnPointsSchemaWithBody = z.object({
  body: z.object({
    userId: z
      .string()
      .uuid('Invalid user ID format'),
    serviceId: z
      .string()
      .uuid('Invalid service ID format'),
    amount: z
      .number()
      .positive('Amount must be positive')
      .max(1000000, 'Amount too large')
      .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
    description: z
      .string()
      .max(500, 'Description too long')
      .optional(),
    metadata: z
      .record(z.any())
      .optional(),
  }),
});

/**
 * Burn points validation schema (Express)
 */
export const burnPointsSchemaWithBody = z.object({
  body: z.object({
    userId: z
      .string()
      .uuid('Invalid user ID format'),
    serviceId: z
      .string()
      .uuid('Invalid service ID format'),
    points: z
      .number()
      .positive('Points must be positive')
      .max(1000000, 'Points amount too large')
      .multipleOf(0.01, 'Points must have at most 2 decimal places'),
    description: z
      .string()
      .max(500, 'Description too long')
      .optional(),
    metadata: z
      .record(z.any())
      .optional(),
  }),
});

/**
 * Get transactions query validation schema (Express)
 */
export const getTransactionsSchemaWithWrappers = z.object({
  params: z.object({
    userId: z
      .string()
      .cuid('Invalid user ID format'),
  }),
  query: z.object({
    page: z
      .string()
      .transform(Number)
      .pipe(z.number().int().positive())
      .default('1'),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().int().positive().max(100))
      .default('50'),
    type: z
      .enum(['EARN', 'BURN', 'EXPIRED', 'ADJUSTMENT'])
      .optional(),
    serviceId: z
      .string()
      .cuid('Invalid service ID format')
      .optional(),
    startDate: z
      .string()
      .datetime()
      .optional(),
    endDate: z
      .string()
      .datetime()
      .optional(),
  }),
});

/**
 * User ID param validation (Express)
 */
export const userIdParamSchemaWithParams = z.object({
  params: z.object({
    userId: z
      .string()
      .cuid('Invalid user ID format'),
  }),
});

// ============================================
// Next.js API Route Schemas (no wrappers)
// ============================================

/**
 * Earn points validation schema (Next.js)
 */
export const earnPointsSchema = z.object({
  userId: z
    .string()
    .uuid('Invalid user ID format'),
  serviceId: z
    .string()
    .uuid('Invalid service ID format'),
  amount: z
    .number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount too large')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
  description: z
    .string()
    .max(500, 'Description too long')
    .optional(),
  metadata: z
    .record(z.any())
    .optional(),
});

/**
 * Burn points validation schema (Next.js)
 */
export const burnPointsSchema = z.object({
  userId: z
    .string()
    .uuid('Invalid user ID format'),
  serviceId: z
    .string()
    .uuid('Invalid service ID format'),
  points: z
    .number()
    .positive('Points must be positive')
    .max(1000000, 'Points amount too large')
    .multipleOf(0.01, 'Points must have at most 2 decimal places'),
  description: z
    .string()
    .max(500, 'Description too long')
    .optional(),
  metadata: z
    .record(z.any())
    .optional(),
});

/**
 * Get transactions query validation schema (Next.js)
 */
export const getTransactionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  type: z.enum(['EARN', 'BURN', 'EXPIRED', 'ADJUSTMENT']).optional(),
  serviceId: z.string().cuid('Invalid service ID format').optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * User ID param validation (Next.js)
 */
export const userIdParamSchema = z.object({
  userId: z.string().cuid('Invalid user ID format'),
});

/**
 * Export types for TypeScript
 */
export type EarnPointsInput = z.infer<typeof earnPointsSchema>;
export type BurnPointsInput = z.infer<typeof burnPointsSchema>;
export type GetTransactionsQuery = z.infer<typeof getTransactionsSchema>;
