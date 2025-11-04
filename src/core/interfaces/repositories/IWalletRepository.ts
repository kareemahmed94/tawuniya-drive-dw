import type { Wallet, Prisma } from '@prisma/client';

export interface IWalletRepository {
  findByUserId(userId: string): Promise<Wallet | null>;
  findById(id: string): Promise<Wallet | null>;
  create(userId: string, initialBalance?: number): Promise<Wallet>;
  updateBalance(userId: string, newBalance: number): Promise<Wallet>;
  incrementBalance(userId: string, amount: number): Promise<Wallet>;
  decrementBalance(userId: string, amount: number): Promise<Wallet>;
  findByUserIdWithStats(userId: string): Promise<any>;
  findMany(where?: Prisma.WalletWhereInput): Promise<Wallet[]>;
}
