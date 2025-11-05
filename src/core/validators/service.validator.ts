import { z } from 'zod';
import { ServiceCategory, RuleType } from '@prisma/client';

// ============================================
// Express Middleware Schemas (with wrappers)
// ============================================

/**
 * Create service validation schema (Express)
 */
export const createServiceSchemaWithBody = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Service name must be at least 2 characters')
      .max(100, 'Service name too long')
      .trim(),
    description: z
      .string()
      .max(500, 'Description too long')
      .optional(),
    category: z.nativeEnum(ServiceCategory, {
      errorMap: () => ({ message: 'Invalid service category' }),
    }),
    iconUrl: z
      .string()
      .url('Invalid icon URL')
      .optional(),
  }),
});

/**
 * Update service validation schema (Express)
 */
export const updateServiceSchemaWithBody = z.object({
  params: z.object({
    id: z.string().cuid('Invalid service ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Service name must be at least 2 characters')
      .max(100, 'Service name too long')
      .trim()
      .optional(),
    description: z
      .string()
      .max(500, 'Description too long')
      .optional(),
    category: z
      .nativeEnum(ServiceCategory)
      .optional(),
    isActive: z
      .boolean()
      .optional(),
    iconUrl: z
      .string()
      .url('Invalid icon URL')
      .optional(),
  }),
});

/**
 * Create service config validation schema (Express)
 */
export const createServiceConfigSchemaWithBody = z.object({
  body: z.object({
    serviceId: z
      .string()
      .cuid('Invalid service ID format'),
    ruleType: z.nativeEnum(RuleType, {
      errorMap: () => ({ message: 'Rule type must be EARN or BURN' }),
    }),
    pointsPerUnit: z
      .number()
      .positive('Points per unit must be positive')
      .max(10000, 'Points per unit too large'),
    unitAmount: z
      .number()
      .positive('Unit amount must be positive')
      .max(1000000, 'Unit amount too large'),
    minAmount: z
      .number()
      .positive('Min amount must be positive')
      .optional(),
    maxPoints: z
      .number()
      .positive('Max points must be positive')
      .optional(),
    expiryDays: z
      .number()
      .int('Expiry days must be an integer')
      .positive('Expiry days must be positive')
      .max(3650, 'Expiry days cannot exceed 10 years')
      .optional(),
    validFrom: z
      .string()
      .datetime()
      .optional(),
    validUntil: z
      .string()
      .datetime()
      .optional(),
  }).refine(
    (data) => !data.validUntil || !data.validFrom || new Date(data.validFrom) < new Date(data.validUntil),
    {
      message: 'validFrom must be before validUntil',
      path: ['validUntil'],
    }
  ),
});

/**
 * Service ID param validation (Express)
 */
export const serviceIdParamSchemaWithParams = z.object({
  params: z.object({
    id: z.string().cuid('Invalid service ID format'),
  }),
});

/**
 * Get services query validation (Express)
 */
export const getServicesSchemaWithQuery = z.object({
  query: z.object({
    category: z
      .nativeEnum(ServiceCategory)
      .optional(),
    isActive: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
  }),
});

// ============================================
// Next.js API Route Schemas (no wrappers)
// ============================================

/**
 * Create service validation schema (Next.js)
 */
export const createServiceSchema = z.object({
  name: z
    .string()
    .min(2, 'Service name must be at least 2 characters')
    .max(100, 'Service name too long')
    .trim(),
  description: z
    .string()
    .max(500, 'Description too long')
    .optional(),
  category: z.nativeEnum(ServiceCategory, {
    errorMap: () => ({ message: 'Invalid service category' }),
  }),
  iconUrl: z
    .string()
    .url('Invalid icon URL')
    .optional(),
});

/**
 * Update service validation schema (Next.js)
 */
export const updateServiceSchema = z.object({
  name: z
    .string()
    .min(2, 'Service name must be at least 2 characters')
    .max(100, 'Service name too long')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Description too long')
    .optional(),
  category: z
    .nativeEnum(ServiceCategory)
    .optional(),
  isActive: z
    .boolean()
    .optional(),
  iconUrl: z
    .string()
    .url('Invalid icon URL')
    .optional(),
});

/**
 * Create service config validation schema (Next.js)
 */
export const createServiceConfigSchema = z.object({
  serviceId: z
    .string()
    .cuid('Invalid service ID format'),
  ruleType: z.nativeEnum(RuleType, {
    errorMap: () => ({ message: 'Rule type must be EARN or BURN' }),
  }),
  pointsPerUnit: z
    .number()
    .positive('Points per unit must be positive')
    .max(10000, 'Points per unit too large'),
  unitAmount: z
    .number()
    .positive('Unit amount must be positive')
    .max(1000000, 'Unit amount too large'),
  minAmount: z
    .number()
    .positive('Min amount must be positive')
    .optional(),
  maxPoints: z
    .number()
    .positive('Max points must be positive')
    .optional(),
  expiryDays: z
    .number()
    .int('Expiry days must be an integer')
    .positive('Expiry days must be positive')
    .max(3650, 'Expiry days cannot exceed 10 years')
    .optional(),
  validFrom: z
    .string()
    .datetime()
    .optional(),
  validUntil: z
    .string()
    .datetime()
    .optional(),
  isActive: z.boolean().default(true),
}).refine(
  (data) => !data.validUntil || !data.validFrom || new Date(data.validFrom) < new Date(data.validUntil),
  {
    message: 'validFrom must be before validUntil',
    path: ['validUntil'],
  }
);

/**
 * Service ID param validation (Next.js)
 */
export const serviceIdParamSchema = z.object({
  id: z.string().cuid('Invalid service ID format'),
});

/**
 * Get services query validation (Next.js)
 */
export const getServicesSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  category: z.nativeEnum(ServiceCategory).optional(),
  isActive: z.coerce.boolean().optional(),
});

/**
 * Export types for TypeScript
 */
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateServiceConfigInput = z.infer<typeof createServiceConfigSchema>;
