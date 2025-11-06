import { injectable, inject } from 'inversify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TYPES } from '@/core/di/types';
import type { IAdminRepository } from '@/core/interfaces/repositories/admin/IAdminRepository';
import type { IAdminAuthService } from '@/core/interfaces/services/IAdminAuthService';
import type {
  AdminLoginInput,
  AdminRegisterInput,
  AdminAuthResponse,
  AdminResponse,
} from '@/core/types/admin.types';
import { config } from '@/core/config/environment';

/**
 * Admin Authentication Service
 * Handles admin authentication, registration, and token management
 */
@injectable()
export class AdminAuthService implements IAdminAuthService {
  constructor(
    @inject(TYPES.AdminRepository) private adminRepository: IAdminRepository
  ) {}

  async register(data: AdminRegisterInput): Promise<AdminAuthResponse> {
    // Check if admin already exists
    const existingAdmin = await this.adminRepository.findByEmail(data.email);
    if (existingAdmin) {
      throw new Error('Admin with this email already exists');
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create admin with hashed password
    const admin = await this.adminRepository.create({
      ...data,
      password: hashedPassword,
    });

    // Generate token
    const token = this.generateToken(admin.id, admin.email, admin.role);

    // Transform response
    const adminResponse: AdminResponse = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
    };

    return {
      admin: adminResponse,
      token,
    };
  }

  async login(data: AdminLoginInput): Promise<AdminAuthResponse> {
    // Find admin by email
    const admin = await this.adminRepository.findByEmail(data.email);
    if (!admin) {
      throw new Error('Invalid credentials');
    }

    // Check if admin is not deleted
    if (admin.deletedAt) {
      throw new Error('This admin account has been deactivated');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, admin.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(admin.id, admin.email, admin.role);

    // Transform response
    const adminResponse: AdminResponse = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
    };

    return {
      admin: adminResponse,
      token,
    };
  }

  async getProfile(adminId: string): Promise<AdminResponse> {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    if (admin.deletedAt) {
      throw new Error('This admin account has been deactivated');
    }

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
    };
  }

  async verifyToken(token: string): Promise<{ adminId: string; email: string; role: string }> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        adminId: string;
        email: string;
        role: string;
      };

      // Verify admin still exists and is not deleted
      const admin = await this.adminRepository.findById(decoded.adminId);
      if (!admin || admin.deletedAt) {
        throw new Error('Invalid token');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async refreshToken(adminId: string): Promise<{ token: string }> {
    const admin = await this.adminRepository.findById(adminId);
    if (!admin) {
      throw new Error('Admin not found');
    }

    if (admin.deletedAt) {
      throw new Error('This admin account has been deactivated');
    }

    const token = this.generateToken(admin.id, admin.email, admin.role);

    return { token };
  }

  // Private helper methods

  private generateToken(adminId: string, email: string, role: string): string {
    return jwt.sign(
      {
        adminId,
        email,
        role,
        type: 'admin',
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn || '7d',
      } as object
    );
  }
}

