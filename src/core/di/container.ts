import { Container } from 'inversify';
import { TYPES } from './types';

// Repository Interfaces
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { IWalletRepository } from '../interfaces/repositories/IWalletRepository';
import { ITransactionRepository } from '../interfaces/repositories/ITransactionRepository';
import { IServiceRepository } from '../interfaces/repositories/IServiceRepository';
import { IPointBalanceRepository } from '../interfaces/repositories/IPointBalanceRepository';
import { IServiceConfigRepository } from '../interfaces/repositories/IServiceConfigRepository';

// Repository Implementations
import { UserRepository } from '../repositories/UserRepository';
import { WalletRepository } from '../repositories/WalletRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { ServiceRepository } from '../repositories/ServiceRepository';
import { PointBalanceRepository } from '../repositories/PointBalanceRepository';
import { ServiceConfigRepository } from '../repositories/ServiceConfigRepository';

// Service Interfaces
import { IAuthService } from '../interfaces/services/IAuthService';
import { IWalletService } from '../interfaces/services/IWalletService';
import { ITransactionService } from '../interfaces/services/ITransactionService';
import { IServiceManagementService } from '../interfaces/services/IServiceManagementService';
import { IAdminService } from '../interfaces/services/admin/IAdminService';
// Note: IAdminAuthService is not bound here - it's managed by admin serviceLocator

// Service Implementations
import { AuthService } from '../services/auth.service';
import { WalletService } from '../services/wallet.service';
import { TransactionService } from '../services/transaction.service';
import { ServiceManagementService } from '../services/service.service';
import { AdminService } from '@/core/services/admin/admin.service';
// Note: AdminAuthService is not bound here - it's managed by admin serviceLocator
import {IAdminRepository} from "@/core/interfaces/repositories/admin/IAdminRepository";
import {AdminRepository} from "@/core/repositories/admin/AdminRepository";

/**
 * Inversify Dependency Injection Container
 * Centralizes all dependency bindings
 */
const container = new Container();

// ===================================
// Repository Bindings
// ===================================
container.bind<IAdminRepository>(TYPES.AdminRepository).to(AdminRepository).inSingletonScope();
container.bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
container.bind<IWalletRepository>(TYPES.WalletRepository).to(WalletRepository).inSingletonScope();
container.bind<ITransactionRepository>(TYPES.TransactionRepository).to(TransactionRepository).inSingletonScope();
container.bind<IServiceRepository>(TYPES.ServiceRepository).to(ServiceRepository).inSingletonScope();
container.bind<IPointBalanceRepository>(TYPES.PointBalanceRepository).to(PointBalanceRepository).inSingletonScope();
container.bind<IServiceConfigRepository>(TYPES.ServiceConfigRepository).to(ServiceConfigRepository).inSingletonScope();

// ===================================
// Service Bindings
// ===================================
container.bind<IAuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<IWalletService>(TYPES.WalletService).to(WalletService).inSingletonScope();
container.bind<ITransactionService>(TYPES.TransactionService).to(TransactionService).inSingletonScope();
container.bind<IServiceManagementService>(TYPES.ServiceManagementService).to(ServiceManagementService).inSingletonScope();
container.bind<IAdminService>(TYPES.AdminService).to(AdminService).inSingletonScope();
// Note: AdminAuthService is managed by admin serviceLocator, not the DI container

export { container };

