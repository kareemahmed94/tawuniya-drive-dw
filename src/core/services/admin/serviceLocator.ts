/**
 * Admin Service Locator
 * Provides instances of admin services
 * Simplified DI approach for admin system
 * Uses admin-scoped repositories for admin operations
 */

import { AdminRepository } from '../../repositories/admin/admin.repository';
import { AdminServiceRepository } from '../../repositories/admin/service.repository';
import { AdminServiceConfigRepository } from '../../repositories/admin/service-config.repository';
import { AdminTransactionRepository } from '../../repositories/admin/transaction.repository';
import { AdminUserRepository } from '../../repositories/admin/user.repository';
import { AdminGlobalConfigRepository } from '../../repositories/admin/global-config.repository';

import { AdminAuthService } from './admin-auth.service';
import { AdminManagementService } from './admin-management.service';
import { ServiceManagementService } from './service-management.service';
import { TransactionManagementService } from './transaction-management.service';
import { UserManagementService } from './user-management.service';
import { GlobalConfigManagementService } from './global-config-management.service';
import { DashboardService } from './dashboard.service';

// Admin-scoped repository instances
const adminRepository = new AdminRepository();
const adminServiceRepository = new AdminServiceRepository();
const adminServiceConfigRepository = new AdminServiceConfigRepository();
const adminTransactionRepository = new AdminTransactionRepository();
const adminUserRepository = new AdminUserRepository();
const adminGlobalConfigRepository = new AdminGlobalConfigRepository();

// Service instances with dependencies (using admin-scoped repositories)
const adminAuthService = new AdminAuthService(adminRepository);
const adminManagementService = new AdminManagementService(adminRepository);
const serviceManagementService = new ServiceManagementService(
  adminServiceRepository,
  adminServiceConfigRepository
);
const transactionManagementService = new TransactionManagementService(adminTransactionRepository);
const userManagementService = new UserManagementService(adminUserRepository);
const globalConfigManagementService = new GlobalConfigManagementService(adminGlobalConfigRepository);
const dashboardService = new DashboardService();

/**
 * Get Admin Auth Service instance
 */
export function getAdminAuthService(): AdminAuthService {
  return adminAuthService;
}

/**
 * Get Admin Management Service instance
 */
export function getAdminManagementService(): AdminManagementService {
  return adminManagementService;
}

/**
 * Get Service Management Service instance
 */
export function getServiceManagementService(): ServiceManagementService {
  return serviceManagementService;
}

/**
 * Get Transaction Management Service instance
 */
export function getTransactionManagementService(): TransactionManagementService {
  return transactionManagementService;
}

/**
 * Get User Management Service instance
 */
export function getUserManagementService(): UserManagementService {
  return userManagementService;
}

/**
 * Get GlobalConfig Management Service instance
 */
export function getGlobalConfigManagementService(): GlobalConfigManagementService {
  return globalConfigManagementService;
}

/**
 * Get Dashboard Service instance
 */
export function getDashboardService(): DashboardService {
  return dashboardService;
}

// Export all for convenience
export const AdminServices = {
  auth: adminAuthService,
  adminManagement: adminManagementService,
  serviceManagement: serviceManagementService,
  transactionManagement: transactionManagementService,
  userManagement: userManagementService,
  globalConfigManagement: globalConfigManagementService,
  dashboard: dashboardService,
};

