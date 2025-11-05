/**
 * Admin Service Locator
 * Provides instances of admin services from Inversify container
 * Uses proper DI instead of manual instantiation
 */

import { container } from './container';
import { TYPES } from './types';
import type { IAdminAuthService } from '../interfaces/services/IAdminAuthService';
import type { IAdminManagementService } from '../interfaces/services/IAdminManagementService';
import type { IServiceManagementService } from '../interfaces/services/IServiceManagementService';
import type { ITransactionManagementService } from '../interfaces/services/ITransactionManagementService';
import type { IUserManagementService } from '../interfaces/services/IUserManagementService';
import type { IGlobalConfigManagementService } from '../interfaces/services/IGlobalConfigManagementService';
import type { IDashboardService } from '../interfaces/services/admin/IDashboardService';

/**
 * Get Admin Auth Service instance from container
 */
export function getAdminAuthService(): IAdminAuthService {
  return container.get<IAdminAuthService>(TYPES.AdminAuthService);
}

/**
 * Get Admin Management Service instance from container
 */
export function getAdminManagementService(): IAdminManagementService {
  return container.get<IAdminManagementService>(TYPES.AdminManagementService);
}

/**
 * Get Service Management Service instance from container
 */
export function getServiceManagementService(): IServiceManagementService {
  return container.get<IServiceManagementService>(TYPES.ServiceManagementServiceAdmin);
}

/**
 * Get Transaction Management Service instance from container
 */
export function getTransactionManagementService(): ITransactionManagementService {
  return container.get<ITransactionManagementService>(TYPES.TransactionManagementService);
}

/**
 * Get User Management Service instance from container
 */
export function getUserManagementService(): IUserManagementService {
  return container.get<IUserManagementService>(TYPES.UserManagementService);
}

/**
 * Get GlobalConfig Management Service instance from container
 */
export function getGlobalConfigManagementService(): IGlobalConfigManagementService {
  return container.get<IGlobalConfigManagementService>(TYPES.GlobalConfigManagementService);
}

/**
 * Get Dashboard Service instance from container
 */
export function getDashboardService(): IDashboardService {
  return container.get<IDashboardService>(TYPES.DashboardService);
}

