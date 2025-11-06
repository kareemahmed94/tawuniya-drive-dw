import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from '@/core/di/types';

// Repository Interfaces
import { IUserRepository } from '@/core/interfaces/repositories/IUserRepository';
import { IWalletRepository } from '@/core/interfaces/repositories/IWalletRepository';
import { ITransactionRepository } from '@/core/interfaces/repositories/ITransactionRepository';
import { IServiceRepository } from '@/core/interfaces/repositories/IServiceRepository';
import { IPointBalanceRepository } from '@/core/interfaces/repositories/IPointBalanceRepository';
import { IServiceConfigRepository } from '@/core/interfaces/repositories/IServiceConfigRepository';

// Admin Repository Interfaces
import { IAdminRepository } from '@/core/interfaces/repositories/admin/IAdminRepository';
import { IAdminServiceRepository } from '@/core/interfaces/repositories/admin/IServiceRepository';
import { IAdminServiceConfigRepository } from '@/core/interfaces/repositories/admin/IServiceConfigRepository';
import { IAdminTransactionRepository } from '@/core/interfaces/repositories/admin/ITransactionRepository';
import { IAdminUserRepository } from '@/core/interfaces/repositories/admin/IUserRepository';
import { IAdminGlobalConfigRepository } from '@/core/interfaces/repositories/admin/IGlobalConfigRepository';

// Repository Implementations
import { UserRepository } from '@/core/repositories/user.repository';
import { WalletRepository } from '@/core/repositories/wallet.repository';
import { TransactionRepository } from '@/core/repositories/transaction.repository';
import { ServiceRepository } from '@/core/repositories/service.repository';
import { PointBalanceRepository } from '@/core/repositories/point-balance.repository';
import { ServiceConfigRepository } from '@/core/repositories/service-config.repository';

// Admin Repository Implementations
import { AdminRepository } from '@/core/repositories/admin/admin.repository';
import { AdminServiceRepository } from '@/core/repositories/admin/service.repository';
import { AdminServiceConfigRepository } from '@/core/repositories/admin/service-config.repository';
import { AdminTransactionRepository } from '@/core/repositories/admin/transaction.repository';
import { AdminUserRepository } from '@/core/repositories/admin/user.repository';
import { AdminGlobalConfigRepository } from '@/core/repositories/admin/global-config.repository';

// Service Interfaces
import { IAuthService } from '@/core/interfaces/services/IAuthService';
import { IWalletService } from '@/core/interfaces/services/IWalletService';
import { ITransactionService } from '@/core/interfaces/services/ITransactionService';
import { IServiceManagementService } from '@/core/interfaces/services/IServiceManagementService';
import { IAdminService } from '@/core/interfaces/services/admin/IAdminService';

// Admin Service Interfaces
import { IAdminAuthService } from '@/core/interfaces/services/IAdminAuthService';
import { IAdminManagementService } from '@/core/interfaces/services/IAdminManagementService';
import { ITransactionManagementService } from '@/core/interfaces/services/ITransactionManagementService';
import { IUserManagementService } from '@/core/interfaces/services/IUserManagementService';
import { IGlobalConfigManagementService } from '@/core/interfaces/services/IGlobalConfigManagementService';
import { IDashboardService } from '@/core/interfaces/services/admin/IDashboardService';

// Service Implementations
import { AuthService } from '@/core/services/auth.service';
import { WalletService } from '@/core/services/wallet.service';
import { TransactionService } from '@/core/services/transaction.service';
import { ServiceManagementService } from '@/core/services/service.service';
import { AdminService } from '@/core/services/admin/admin.service';

// Admin Service Implementations
import { AdminAuthService } from '@/core/services/admin/admin-auth.service';
import { AdminManagementService } from '@/core/services/admin/admin-management.service';
import { ServiceManagementService as AdminServiceManagementService } from '@/core/services/admin/service-management.service';
import { TransactionManagementService } from '@/core/services/admin/transaction-management.service';
import { UserManagementService } from '@/core/services/admin/user-management.service';
import { GlobalConfigManagementService } from '@/core/services/admin/global-config-management.service';
import { DashboardService } from '@/core/services/admin/dashboard.service';

// Admin Controller Implementations
import { AdminAuthController } from '@/core/controllers/admin/admin-auth.controller';
import { AdminManagementController } from '@/core/controllers/admin/admin-management.controller';
import { ServiceManagementController } from '@/core/controllers/admin/service-management.controller';
import { TransactionManagementController } from '@/core/controllers/admin/transaction-management.controller';
import { UserManagementController } from '@/core/controllers/admin/user-management.controller';
import { GlobalConfigManagementController } from '@/core/controllers/admin/global-config-management.controller';
import { DashboardController } from '@/core/controllers/admin/dashboard.controller';

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

