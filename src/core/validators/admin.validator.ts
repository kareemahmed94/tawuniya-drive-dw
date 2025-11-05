import { z } from 'zod';
import { AdminRole, ServiceCategory, RuleType, TransactionType, TransactionStatus } from '@prisma/client';

/**
 * Admin Validators
 * Comprehensive Zod schemas for all admin operations
 */

// ==================== Admin Authentication ====================

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const adminRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z.string().optional().nullable(),
  avatar: z.string().url('Invalid avatar URL').optional().nullable(),
  role: z.nativeEnum(AdminRole).default(AdminRole.ADMIN),
});

// ==================== Admin Management ====================

export const createAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z.string().optional().nullable(),
  avatar: z.string().url('Invalid avatar URL').optional().nullable(),
  role: z.nativeEnum(AdminRole).default(AdminRole.ADMIN),
});

export const updateAdminSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
  phone: z.string().optional().nullable(),
  avatar: z.string().url('Invalid avatar URL').optional().nullable(),
  role: z.nativeEnum(AdminRole).optional(),
});

export const adminFiltersSchema = z.object({
  role: z.nativeEnum(AdminRole).optional(),
  search: z.string().optional(),
});

// ==================== Service Management ====================

export const createServiceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.nativeEnum(ServiceCategory),
  iconUrl: z.string().url('Invalid icon URL').optional(),
  isActive: z.boolean().default(true),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z.string().optional(),
  category: z.nativeEnum(ServiceCategory).optional(),
  iconUrl: z.string().url('Invalid icon URL').optional(),
  isActive: z.boolean().optional(),
});

export const serviceFiltersSchema = z.object({
  category: z.nativeEnum(ServiceCategory).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// ==================== Service Config Management ====================

export const createServiceConfigSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  ruleType: z.nativeEnum(RuleType),
  pointsPerUnit: z.coerce.number().positive('Points per unit must be positive'),
  unitAmount: z.coerce.number().positive('Unit amount must be positive'),
  minAmount: z.coerce.number().positive('Min amount must be positive').optional().nullable(),
  maxPoints: z.coerce.number().positive('Max points must be positive').optional().nullable(),
  expiryDays: z.coerce.number().int().positive('Expiry days must be a positive integer').optional().nullable(),
  isActive: z.boolean().default(true),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional().nullable(),
}).refine(
  (data) => !data.validUntil || !data.validFrom || data.validUntil > data.validFrom,
  {
    message: 'Valid until must be after valid from',
    path: ['validUntil'],
  }
);

export const updateServiceConfigSchema = z.object({
  ruleType: z.nativeEnum(RuleType).optional(),
  pointsPerUnit: z.coerce.number().positive('Points per unit must be positive').optional(),
  unitAmount: z.coerce.number().positive('Unit amount must be positive').optional(),
  minAmount: z.coerce.number().positive('Min amount must be positive').optional().nullable(),
  maxPoints: z.coerce.number().positive('Max points must be positive').optional().nullable(),
  expiryDays: z.coerce.number().int().positive('Expiry days must be a positive integer').optional().nullable(),
  isActive: z.boolean().optional(),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional().nullable(),
}).refine(
  (data) => !data.validUntil || !data.validFrom || data.validUntil > data.validFrom,
  {
    message: 'Valid until must be after valid from',
    path: ['validUntil'],
  }
);

export const serviceConfigFiltersSchema = z.object({
  serviceId: z.string().uuid().optional(),
  ruleType: z.nativeEnum(RuleType).optional(),
  isActive: z.coerce.boolean().optional(),
});

// ==================== Transaction Management ====================

export const transactionFiltersSchema = z.object({
  userId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  status: z.nativeEnum(TransactionStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  minPoints: z.coerce.number().optional(),
  maxPoints: z.coerce.number().optional(),
});

export const updateTransactionSchema = z.object({
  status: z.nativeEnum(TransactionStatus).optional(),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// ==================== User Management (Admin View) ====================

export const userFiltersSchema = z.object({
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  hasWallet: z.coerce.boolean().optional(),
  minBalance: z.coerce.number().optional(),
  maxBalance: z.coerce.number().optional(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

// ==================== Pagination ====================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ==================== Analytics & Reporting ====================

export const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

export const analyticsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const expiryQuerySchema = z.object({
  days: z.coerce.number().int().positive().max(365).default(30),
  serviceId: z.string().uuid().optional(),
});

// ==================== Bulk Operations ====================

export const bulkUpdateSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one ID is required'),
  data: z.record(z.unknown()),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one ID is required'),
});

// ==================== Export Types ====================

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminRegisterInput = z.infer<typeof adminRegisterSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>;
export type AdminFilters = z.infer<typeof adminFiltersSchema>;

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceFilters = z.infer<typeof serviceFiltersSchema>;

export type CreateServiceConfigInput = z.infer<typeof createServiceConfigSchema>;
export type UpdateServiceConfigInput = z.infer<typeof updateServiceConfigSchema>;
export type ServiceConfigFilters = z.infer<typeof serviceConfigFiltersSchema>;

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

export type UserFilters = z.infer<typeof userFiltersSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

export type PaginationParams = z.infer<typeof paginationSchema>;
export type DateRangeQuery = z.infer<typeof dateRangeSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type ExpiryQuery = z.infer<typeof expiryQuerySchema>;

export type BulkUpdateInput = z.infer<typeof bulkUpdateSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;

