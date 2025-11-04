import { User, UserRole } from '@prisma/client';
import { BaseResource } from './BaseResource';

/**
 * User Resource
 * Transforms user data for API responses
 * Excludes sensitive fields like password
 */
export class UserResource extends BaseResource<User> {
  toArray() {
    return {
      id: this.data.id,
      email: this.data.email,
      name: this.data.name,
      phone: this.data.phone,
      role: this.data.role as UserRole,
      isActive: this.data.isActive,
      createdAt: this.formatDate(this.data.createdAt),
      updatedAt: this.formatDate(this.data.updatedAt),
    };
  }
}

/**
 * User with Wallet Resource
 * Includes wallet information with the user
 */
export class UserWithWalletResource extends BaseResource<
  User & { wallet?: { balance: any } | null }
> {
  toArray() {
    return {
      id: this.data.id,
      email: this.data.email,
      name: this.data.name,
      phone: this.data.phone,
      role: this.data.role as UserRole,
      isActive: this.data.isActive,
      createdAt: this.formatDate(this.data.createdAt),
      updatedAt: this.formatDate(this.data.updatedAt),
      wallet: this.data.wallet
        ? {
            balance: this.toNumber(this.data.wallet.balance),
          }
        : null,
    };
  }
}

/**
 * Auth User Resource
 * Extended user resource for authenticated user responses
 * Includes additional fields needed after login
 */
export class AuthUserResource extends BaseResource<
  User & {
    wallet?: {
      id: string;
      balance: any;
      totalEarned: any;
      totalBurned: any;
      totalExpired: any;
      lastActivity: Date;
    } | null;
  }
> {
  toArray() {
    return {
      id: this.data.id,
      email: this.data.email,
      name: this.data.name,
      phone: this.data.phone,
      role: this.data.role as UserRole,
      isActive: this.data.isActive,
      createdAt: this.formatDate(this.data.createdAt),
      updatedAt: this.formatDate(this.data.updatedAt),
      wallet: this.data.wallet
        ? {
            id: this.data.wallet.id,
            balance: this.toNumber(this.data.wallet.balance) ?? 0,
            totalEarned: this.toNumber(this.data.wallet.totalEarned) ?? 0,
            totalBurned: this.toNumber(this.data.wallet.totalBurned) ?? 0,
            totalExpired: this.toNumber(this.data.wallet.totalExpired) ?? 0,
            lastActivity: this.formatDate(this.data.wallet.lastActivity),
          }
        : null,
    };
  }
}

