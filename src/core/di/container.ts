import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Repository Interfaces
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { IWalletRepository } from '../interfaces/repositories/IWalletRepository';
import { ITransactionRepository } from '../interfaces/repositories/ITransactionRepository';
import { IServiceRepository } from '../interfaces/repositories/IServiceRepository';
import { IPointBalanceRepository } from '../interfaces/repositories/IPointBalanceRepository';
import { IServiceConfigRepository } from '../interfaces/repositories/IServiceConfigRepository';

// Admin Repository Interfaces
import { IAdminRepository } from '../interfaces/repositories/admin/IAdminRepository';
import { IAdminServiceRepository } from '../interfaces/repositories/admin/IServiceRepository';
import { IAdminServiceConfigRepository } from '../interfaces/repositories/admin/IServiceConfigRepository';
import { IAdminTransactionRepository } from '../interfaces/repositories/admin/ITransactionRepository';
import { IAdminUserRepository } from '../interfaces/repositories/admin/IUserRepository';
import { IAdminGlobalConfigRepository } from '../interfaces/repositories/admin/IGlobalConfigRepository';

// Repository Implementations
import { UserRepository } from '../repositories/UserRepository';
import { WalletRepository } from '../repositories/WalletRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { ServiceRepository } from '../repositories/ServiceRepository';
import { PointBalanceRepository } from '../repositories/PointBalanceRepository';
import { ServiceConfigRepository } from '../repositories/ServiceConfigRepository';

// Admin Repository Implementations
import { AdminRepository } from '../repositories/admin/AdminRepository';
import { AdminServiceRepository } from '../repositories/admin/ServiceRepository';
import { AdminServiceConfigRepository } from '../repositories/admin/ServiceConfigRepository';
import { AdminTransactionRepository } from '../repositories/admin/TransactionRepository';
import { AdminUserRepository } from '../repositories/admin/UserRepository';
import { AdminGlobalConfigRepository } from '../repositories/admin/GlobalConfigRepository';

// Service Interfaces
import { IAuthService } from '../interfaces/services/IAuthService';
import { IWalletService } from '../interfaces/services/IWalletService';
import { ITransactionService } from '../interfaces/services/ITransactionService';
import { IServiceManagementService } from '../interfaces/services/IServiceManagementService';
import { IAdminService } from '../interfaces/services/admin/IAdminService';

// Admin Service Interfaces
import { IAdminAuthService } from '../interfaces/services/IAdminAuthService';
import { IAdminManagementService } from '../interfaces/services/IAdminManagementService';
import { ITransactionManagementService } from '../interfaces/services/ITransactionManagementService';
import { IUserManagementService } from '../interfaces/services/IUserManagementService';
import { IGlobalConfigManagementService } from '../interfaces/services/IGlobalConfigManagementService';
import { IDashboardService } from '../interfaces/services/admin/IDashboardService';

// Service Implementations
import { AuthService } from '../services/auth.service';
import { WalletService } from '../services/wallet.service';
import { TransactionService } from '../services/transaction.service';
import { ServiceManagementService } from '../services/service.service';
import { AdminService } from '../services/admin/admin.service';

// Admin Service Implementations
import { AdminAuthService } from '../services/admin/admin-auth.service';
import { AdminManagementService } from '../services/admin/admin-management.service';
import { ServiceManagementService as AdminServiceManagementService } from '../services/admin/service-management.service';
import { TransactionManagementService } from '../services/admin/transaction-management.service';
import { UserManagementService } from '../services/admin/user-management.service';
import { GlobalConfigManagementService } from '../services/admin/global-config-management.service';
import { DashboardService } from '../services/admin/dashboard.service';

// Admin Controller Implementations
import { AdminAuthController } from '../controllers/admin/admin-auth.controller';
import { AdminManagementController } from '../controllers/admin/admin-management.controller';
import { ServiceManagementController } from '../controllers/admin/service-management.controller';
import { TransactionManagementController } from '../controllers/admin/transaction-management.controller';
import { UserManagementController } from '../controllers/admin/user-management.controller';
import { GlobalConfigManagementController } from '../controllers/admin/global-config-management.controller';
import { DashboardController } from '../controllers/admin/dashboard.controller';

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
// Admin Repository Bindings
// ===================================
container.bind<IAdminServiceRepository>(TYPES.AdminServiceRepository).to(AdminServiceRepository).inSingletonScope();
container.bind<IAdminServiceConfigRepository>(TYPES.AdminServiceConfigRepository).to(AdminServiceConfigRepository).inSingletonScope();
container.bind<IAdminTransactionRepository>(TYPES.AdminTransactionRepository).to(AdminTransactionRepository).inSingletonScope();
container.bind<IAdminUserRepository>(TYPES.AdminUserRepository).to(AdminUserRepository).inSingletonScope();
container.bind<IAdminGlobalConfigRepository>(TYPES.AdminGlobalConfigRepository).to(AdminGlobalConfigRepository).inSingletonScope();

// ===================================
// Service Bindings
// ===================================
container.bind<IAuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
container.bind<IWalletService>(TYPES.WalletService).to(WalletService).inSingletonScope();
container.bind<ITransactionService>(TYPES.TransactionService).to(TransactionService).inSingletonScope();
container.bind(TYPES.ServiceManagementService).to(ServiceManagementService).inSingletonScope();
container.bind<IAdminService>(TYPES.AdminService).to(AdminService).inSingletonScope();

// ===================================
// Admin Service Bindings
// ===================================
container.bind<IAdminAuthService>(TYPES.AdminAuthService).to(AdminAuthService).inSingletonScope();
container.bind<IAdminManagementService>(TYPES.AdminManagementService).to(AdminManagementService).inSingletonScope();
container.bind<IServiceManagementService>(TYPES.ServiceManagementServiceAdmin).to(AdminServiceManagementService).inSingletonScope();
container.bind<ITransactionManagementService>(TYPES.TransactionManagementService).to(TransactionManagementService).inSingletonScope();
container.bind<IUserManagementService>(TYPES.UserManagementService).to(UserManagementService).inSingletonScope();
container.bind<IGlobalConfigManagementService>(TYPES.GlobalConfigManagementService).to(GlobalConfigManagementService).inSingletonScope();
container.bind<IDashboardService>(TYPES.DashboardService).to(DashboardService).inSingletonScope();

// ===================================
// Admin Controller Bindings
// ===================================
container.bind<AdminAuthController>(TYPES.AdminAuthController).to(AdminAuthController).inSingletonScope();
container.bind<AdminManagementController>(TYPES.AdminManagementController).to(AdminManagementController).inSingletonScope();
container.bind<ServiceManagementController>(TYPES.ServiceManagementController).to(ServiceManagementController).inSingletonScope();
container.bind<TransactionManagementController>(TYPES.TransactionManagementController).to(TransactionManagementController).inSingletonScope();
container.bind<UserManagementController>(TYPES.UserManagementController).to(UserManagementController).inSingletonScope();
container.bind<GlobalConfigManagementController>(TYPES.GlobalConfigManagementController).to(GlobalConfigManagementController).inSingletonScope();
container.bind<DashboardController>(TYPES.DashboardController).to(DashboardController).inSingletonScope();

export { container };

