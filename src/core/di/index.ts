/**
 * Dependency Injection Exports
 * Central export point for DI container and types
 */

export { container } from './container';
export { TYPES } from './types';

// Export interfaces for type checking
export * from '../interfaces/repositories/IUserRepository';
export * from '../interfaces/repositories/IWalletRepository';
export * from '../interfaces/repositories/ITransactionRepository';
export * from '../interfaces/repositories/IServiceRepository';
export * from '../interfaces/repositories/IPointBalanceRepository';
export * from '../interfaces/repositories/IServiceConfigRepository';

export * from '../interfaces/services/IAuthService';
export * from '../interfaces/services/IWalletService';
export * from '../interfaces/services/ITransactionService';
export * from '../interfaces/services/IServiceManagementService';

