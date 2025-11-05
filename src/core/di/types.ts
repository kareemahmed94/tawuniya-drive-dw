/**
 * Dependency Injection Types
 * Centralized type identifiers for Inversify container
 */

export const TYPES = {
  // Repositories
  AdminRepository: Symbol.for('AdminRepository'),
  UserRepository: Symbol.for('UserRepository'),
  WalletRepository: Symbol.for('WalletRepository'),
  TransactionRepository: Symbol.for('TransactionRepository'),
  ServiceRepository: Symbol.for('ServiceRepository'),
  PointBalanceRepository: Symbol.for('PointBalanceRepository'),
  ServiceConfigRepository: Symbol.for('ServiceConfigRepository'),

  // Admin Repositories
  AdminServiceRepository: Symbol.for('AdminServiceRepository'),
  AdminServiceConfigRepository: Symbol.for('AdminServiceConfigRepository'),
  AdminTransactionRepository: Symbol.for('AdminTransactionRepository'),
  AdminUserRepository: Symbol.for('AdminUserRepository'),
  AdminGlobalConfigRepository: Symbol.for('AdminGlobalConfigRepository'),

  // Services
  AuthService: Symbol.for('AuthService'),
  WalletService: Symbol.for('WalletService'),
  TransactionService: Symbol.for('TransactionService'),
  ServiceManagementService: Symbol.for('ServiceManagementService'),
  AdminService: Symbol.for('AdminService'),

  // Admin Services
  AdminAuthService: Symbol.for('AdminAuthService'),
  AdminManagementService: Symbol.for('AdminManagementService'),
  ServiceManagementServiceAdmin: Symbol.for('ServiceManagementServiceAdmin'),
  TransactionManagementService: Symbol.for('TransactionManagementService'),
  UserManagementService: Symbol.for('UserManagementService'),
  GlobalConfigManagementService: Symbol.for('GlobalConfigManagementService'),
  DashboardService: Symbol.for('DashboardService'),

  // Admin Controllers
  AdminAuthController: Symbol.for('AdminAuthController'),
  AdminManagementController: Symbol.for('AdminManagementController'),
  ServiceManagementController: Symbol.for('ServiceManagementController'),
  TransactionManagementController: Symbol.for('TransactionManagementController'),
  UserManagementController: Symbol.for('UserManagementController'),
  GlobalConfigManagementController: Symbol.for('GlobalConfigManagementController'),
  DashboardController: Symbol.for('DashboardController'),

  // Utils
  Logger: Symbol.for('Logger'),
  DatabaseClient: Symbol.for('DatabaseClient'),
} as const;

