import {injectable, inject} from 'inversify';
import {TYPES} from '@/core/di/types';
import type {IAdminService} from '@/core/interfaces/services/admin/IAdminService';
import {prisma} from '@/core/config/database';
import type {IAdminRepository} from "@/core/interfaces/repositories/admin/IAdminRepository";
import {Admin} from '@prisma/client';

/**
 * Admin Service Implementation
 * Provides analytics, reporting, and KPIs for administrators using DI
 * Follows SOLID principles: SRP, DIP, OCP
 */
@injectable()
export class AdminService implements IAdminService {
    constructor(
        @inject(TYPES.AdminRepository) private adminRepository: IAdminRepository,
    ) {
    }

    getAdmins(): Promise<Array<Admin>> {
        throw new Error('Method not implemented.');
    }

    createAdmin(): Promise<Array<Admin>> {
        throw new Error('Method not implemented.');
    }

    updateAdmin(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    deleteAdmin(): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}
