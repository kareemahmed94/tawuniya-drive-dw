/**
 * Admin Controller Factory
 * Provides controller instances from Inversify container
 * This file is loaded after the container is fully initialized to avoid circular dependencies
 */

import { container } from './container';
import { TYPES } from './types';
import type { AdminAuthController } from '@/core/controllers/admin';
import type { AdminManagementController } from '@/core/controllers/admin';
import type { ServiceManagementController } from '@/core/controllers/admin';
import type { TransactionManagementController } from '@/core/controllers/admin';
import type { UserManagementController } from '@/core/controllers/admin';
import type { GlobalConfigManagementController } from '@/core/controllers/admin';
import type { DashboardController } from '@/core/controllers/admin';

/**
 * Get Admin Auth Controller instance from container
 */
export function getAdminAuthController(): AdminAuthController {
  return container.get<AdminAuthController>(TYPES.AdminAuthController);
}

/**
 * Get Admin Management Controller instance from container
 */
export function getAdminManagementController(): AdminManagementController {
  return container.get<AdminManagementController>(TYPES.AdminManagementController);
}

/**
 * Get Service Management Controller instance from container
 */
export function getServiceManagementController(): ServiceManagementController {
  return container.get<ServiceManagementController>(TYPES.ServiceManagementController);
}

/**
 * Get Transaction Management Controller instance from container
 */
export function getTransactionManagementController(): TransactionManagementController {
  return container.get<TransactionManagementController>(TYPES.TransactionManagementController);
}

/**
 * Get User Management Controller instance from container
 */
export function getUserManagementController(): UserManagementController {
  return container.get<UserManagementController>(TYPES.UserManagementController);
}

/**
 * Get GlobalConfig Management Controller instance from container
 */
export function getGlobalConfigManagementController(): GlobalConfigManagementController {
  return container.get<GlobalConfigManagementController>(TYPES.GlobalConfigManagementController);
}

/**
 * Get Dashboard Controller instance from container
 */
export function getDashboardController(): DashboardController {
  return container.get<DashboardController>(TYPES.DashboardController);
}

// Export singleton instances (lazy-loaded)
export const adminAuthController = getAdminAuthController();
export const adminManagementController = getAdminManagementController();
export const serviceManagementController = getServiceManagementController();
export const transactionManagementController = getTransactionManagementController();
export const userManagementController = getUserManagementController();
export const globalConfigManagementController = getGlobalConfigManagementController();
export const dashboardController = getDashboardController();

