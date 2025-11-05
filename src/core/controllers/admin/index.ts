/**
 * Admin Controllers
 * Central export point for all admin controllers
 */

// Export controller classes
export { AdminAuthController } from './admin-auth.controller';
export { AdminManagementController } from './admin-management.controller';
export { ServiceManagementController } from './service-management.controller';
export { TransactionManagementController } from './transaction-management.controller';
export { UserManagementController } from './user-management.controller';
export { GlobalConfigManagementController } from './global-config-management.controller';
export { DashboardController } from './dashboard.controller';

// Export controller instances (from factory to avoid circular dependencies)
export {
  adminAuthController,
  adminManagementController,
  serviceManagementController,
  transactionManagementController,
  userManagementController,
  globalConfigManagementController,
  dashboardController,
} from '@/core/di/adminControllerFactory';

