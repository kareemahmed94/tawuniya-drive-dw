/**
 * Dependency Injection Types
 * Centralized type identifiers for Inversify container
 */

export const TYPES = {
  // Repositories
  AdminRepository: Symbol.for('AdminRepository'),
  AdminServiceRepository: Symbol.for('AdminServiceRepository'),
  AdminServiceConfigRepository: Symbol.for('AdminServiceConfigRepository'),
  AdminTransactionRepository: Symbol.for('AdminTransactionRepository'),
  UserRepository: Symbol.for('UserRepository'),
  WalletRepository: Symbol.for('WalletRepository'),
  TransactionRepository: Symbol.for('TransactionRepository'),
  ServiceRepository: Symbol.for('ServiceRepository'),
  PointBalanceRepository: Symbol.for('PointBalanceRepository'),
  ServiceConfigRepository: Symbol.for('ServiceConfigRepository'),

  // Services
  AuthService: Symbol.for('AuthService'),
  WalletService: Symbol.for('WalletService'),
  TransactionService: Symbol.for('TransactionService'),
  ServiceManagementService: Symbol.for('ServiceManagementService'),
  AdminService: Symbol.for('AdminService'),
  AdminAuthService: Symbol.for('AdminAuthService'),

  // Utils
  Logger: Symbol.for('Logger'),
  DatabaseClient: Symbol.for('DatabaseClient'),
} as const;

