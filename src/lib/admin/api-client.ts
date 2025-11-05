/**
 * Admin API Client
 * Simplified client that uses modular service classes
 */

import { adminAuthService } from '@/lib/api/services/admin/admin-auth.service';
import { adminManagementService } from '@/lib/api/services/admin/admin-management.service';
import { adminServicesService } from '@/lib/api/services/admin/admin-services.service';
import { adminServiceConfigsService } from '@/lib/api/services/admin/admin-service-configs.service';
import { adminUsersService } from '@/lib/api/services/admin/admin-users.service';
import { adminTransactionsService } from '@/lib/api/services/admin/admin-transactions.service';
import { adminGlobalConfigsService } from '@/lib/api/services/admin/admin-global-configs.service';
import { adminAnalyticsService } from '@/lib/api/services/admin/admin-analytics.service';

// Re-export types for convenience
export type {
  AdminUser,
  AdminAuthResponse,
  Service,
  ServiceConfigExtended as ServiceConfig,
  TransactionExtended as Transaction,
  AdminUserExtended as User,
  GlobalConfig,
  DashboardStats,
  ServiceAnalytics,
  UserEngagementMetrics,
  ExpiryAnalytics,
  TransactionTrend,
} from '@/lib/api/types';

/**
 * Admin API Client
 * Provides a unified interface to all admin services
 */
export class AdminApiClient {
  // Authentication
  get auth() {
    return adminAuthService;
  }

  // Admin Management
  get admins() {
    return adminManagementService;
  }

  // Services Management
  get services() {
    return adminServicesService;
  }

  // Service Configs Management
  get serviceConfigs() {
    return adminServiceConfigsService;
  }

  // Users Management
  get users() {
    return adminUsersService;
  }

  // Transactions Management
  get transactions() {
    return adminTransactionsService;
  }

  // Global Configs Management
  get globalConfigs() {
    return adminGlobalConfigsService;
  }

  // Analytics
  get analytics() {
    return adminAnalyticsService;
  }

  // Convenience methods for backward compatibility
  login = adminAuthService.login;
  register = adminAuthService.register;
  getProfile = adminAuthService.getProfile;
  logout = adminAuthService.logout;
  getToken = adminAuthService.getToken;

  getAdmins = adminManagementService.getAdmins;
  getAdminById = adminManagementService.getAdminById;
  createAdmin = adminManagementService.createAdmin;
  updateAdmin = adminManagementService.updateAdmin;
  deleteAdmin = adminManagementService.deleteAdmin;

  getServices = adminServicesService.getServices;
  getServiceById = adminServicesService.getServiceById;
  getServiceWithDetails = adminServicesService.getServiceWithDetails;
  createService = adminServicesService.createService;
  updateService = adminServicesService.updateService;
  deleteService = adminServicesService.deleteService;
  toggleServiceStatus = adminServicesService.toggleServiceStatus;

  getServiceConfigs = adminServiceConfigsService.getServiceConfigs;
  getServiceConfigById = adminServiceConfigsService.getServiceConfigById;
  createServiceConfig = adminServiceConfigsService.createServiceConfig;
  updateServiceConfig = adminServiceConfigsService.updateServiceConfig;
  deleteServiceConfig = adminServiceConfigsService.deleteServiceConfig;
  toggleServiceConfigStatus = adminServiceConfigsService.toggleServiceConfigStatus;

  getUsers = adminUsersService.getUsers;
  getUserById = adminUsersService.getUserById;
  createUser = adminUsersService.createUser;
  updateUser = adminUsersService.updateUser;
  deleteUser = adminUsersService.deleteUser;
  toggleUserStatus = adminUsersService.toggleUserStatus;
  getUserStatistics = adminUsersService.getUserStatistics;

  getTransactions = adminTransactionsService.getTransactions;
  getTransactionById = adminTransactionsService.getTransactionById;
  updateTransaction = adminTransactionsService.updateTransaction;
  getTransactionStatistics = adminTransactionsService.getTransactionStatistics;
  exportTransactions = adminTransactionsService.exportTransactions;

  getGlobalConfigs = adminGlobalConfigsService.getGlobalConfigs;
  getGlobalConfigById = adminGlobalConfigsService.getGlobalConfigById;
  createGlobalConfig = adminGlobalConfigsService.createGlobalConfig;
  updateGlobalConfig = adminGlobalConfigsService.updateGlobalConfig;
  deleteGlobalConfig = adminGlobalConfigsService.deleteGlobalConfig;
  toggleGlobalConfigStatus = adminGlobalConfigsService.toggleGlobalConfigStatus;

  getDashboardStats = adminAnalyticsService.getDashboardStats;
  getServiceAnalytics = adminAnalyticsService.getServiceAnalytics;
  getUserEngagementMetrics = adminAnalyticsService.getUserEngagementMetrics;
  getExpiryAnalytics = adminAnalyticsService.getExpiryAnalytics;
  getTransactionTrends = adminAnalyticsService.getTransactionTrends;
}

// Singleton instance
export const adminApi = new AdminApiClient();
