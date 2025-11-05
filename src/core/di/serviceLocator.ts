/**
 * Service Locator
 * Provides singleton access to services for API routes
 * Uses InversifyJS container for proper dependency injection
 * 
 * IMPORTANT: This is the ONLY file that should import the container.
 * Services should NEVER import the container directly to avoid circular dependencies.
 */

import { container } from './container';
import { TYPES } from './types';
import type { IAuthService } from '../interfaces/services/IAuthService';
import type { IWalletService } from '../interfaces/services/IWalletService';
import type { ITransactionService } from '../interfaces/services/ITransactionService';
import type { IServiceManagementService } from '../interfaces/services/IServiceManagementService';
import type { IAdminService } from '../interfaces/services/admin/IAdminService';

/**
 * Get service instances from DI container
 * These instances are singletons managed by InversifyJS
 */
export const authService = container.get<IAuthService>(TYPES.AuthService);
export const walletService = container.get<IWalletService>(TYPES.WalletService);
export const transactionService = container.get<ITransactionService>(TYPES.TransactionService);
export const serviceManagementService = container.get<IServiceManagementService>(TYPES.ServiceManagementService);
export const adminService = container.get<IAdminService>(TYPES.AdminService);
