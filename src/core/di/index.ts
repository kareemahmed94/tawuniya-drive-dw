/**
 * Dependency Injection Exports
 * Central export point for DI container and types
 */

export { container } from './container';
export { TYPES } from './types';

// Export interfaces for type checking
export * from '@/core/interfaces/repositories/IUserRepository';
export * from '@/core/interfaces/repositories/IWalletRepository';
export * from '@/core/interfaces/repositories/ITransactionRepository';
export * from '@/core/interfaces/repositories/IServiceRepository';
export * from '@/core/interfaces/repositories/IPointBalanceRepository';
export * from '@/core/interfaces/repositories/IServiceConfigRepository';

export * from '@/core/interfaces/services/IAuthService';
export * from '@/core/interfaces/services/IWalletService';
export * from '@/core/interfaces/services/ITransactionService';
export * from '@/core/interfaces/services/IServiceManagementService';

