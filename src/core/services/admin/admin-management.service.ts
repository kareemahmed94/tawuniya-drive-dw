import bcrypt from 'bcrypt';
import type { IAdminRepository } from '../../interfaces/repositories/admin/IAdminRepository';
import type { IAdminManagementService } from '../../interfaces/services/IAdminManagementService';
import type {
  CreateAdminInput,
  UpdateAdminInput,
  AdminResponse,
  AdminFilters,
  PaginationParams,
  PaginatedResponse,
} from '../../types/admin.types';
import { Prisma } from '@prisma/client';

/**
 * Admin Management Service
 * Handles CRUD operations for admin users
 */
export class AdminManagementService implements IAdminManagementService {
  constructor(private adminRepository: IAdminRepository) {}

  async createAdmin(data: CreateAdminInput): Promise<AdminResponse> {
    // Check if email already exists
    const emailExists = await this.adminRepository.emailExists(data.email);
    if (emailExists) {
      throw new Error('Admin with this email already exists');
    }

    // Check if phone already exists
    if (data.phone) {
      const phoneExists = await this.adminRepository.phoneExists(data.phone);
      if (phoneExists) {
        throw new Error('Admin with this phone number already exists');
      }
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Prepare admin data for creation
    const adminData: Prisma.AdminUncheckedCreateInput = {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      phone: data.phone || null,
      avatar: data.avatar || null,
      role: data.role,
    };

    const admin = await this.adminRepository.create(adminData);

    return this.transformAdminResponse(admin);
  }

  async getAdminById(id: string): Promise<AdminResponse> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new Error('Admin not found');
    }

    if (admin.deletedAt) {
      throw new Error('Admin has been deleted');
    }

    return this.transformAdminResponse(admin);
  }

  async getAllAdmins(
    params: PaginationParams,
    filters?: AdminFilters
  ): Promise<PaginatedResponse<AdminResponse>> {
    const { data, total } = await this.adminRepository.findAll(params, filters);

    const transformedData = data.map((admin) => this.transformAdminResponse(admin));

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: transformedData,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
    };
  }

  async updateAdmin(id: string, data: UpdateAdminInput): Promise<AdminResponse> {
    // Check if admin exists
    const existingAdmin = await this.adminRepository.findById(id);
    if (!existingAdmin) {
      throw new Error('Admin not found');
    }

    if (existingAdmin.deletedAt) {
      throw new Error('Cannot update deleted admin');
    }

    // Check email uniqueness if updating
    if (data.email) {
      const emailExists = await this.adminRepository.emailExists(data.email, id);
      if (emailExists) {
        throw new Error('Admin with this email already exists');
      }
    }

    // Check phone uniqueness if updating
    if (data.phone) {
      const phoneExists = await this.adminRepository.phoneExists(data.phone, id);
      if (phoneExists) {
        throw new Error('Admin with this phone number already exists');
      }
    }

    // Prepare update data
    const updateData: Partial<typeof existingAdmin> = { ...data };

    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const updatedAdmin = await this.adminRepository.update(id, updateData);

    return this.transformAdminResponse(updatedAdmin);
  }

  async deleteAdmin(id: string): Promise<{ success: boolean; message: string }> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) {
      throw new Error('Admin not found');
    }

    if (admin.deletedAt) {
      throw new Error('Admin already deleted');
    }

    await this.adminRepository.remove(id);

    return {
      success: true,
      message: 'Admin deleted successfully',
    };
  }

  async getAdminStats(): Promise<{
    total: number;
    byRole: {
      SUPER_ADMIN: number;
      ADMIN: number;
      STAFF: number;
    };
  }> {
    const [total, superAdminCount, adminCount, staffCount] = await Promise.all([
      this.adminRepository.countByRole(),
      this.adminRepository.countByRole('SUPER_ADMIN'),
      this.adminRepository.countByRole('ADMIN'),
      this.adminRepository.countByRole('STAFF'),
    ]);

    return {
      total,
      byRole: {
        SUPER_ADMIN: superAdminCount,
        ADMIN: adminCount,
        STAFF: staffCount,
      },
    };
  }

  // Private helper methods

  private transformAdminResponse(admin: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }): AdminResponse {
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role as 'SUPER_ADMIN' | 'ADMIN' | 'STAFF',
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
    };
  }
}

