import {Prisma, User, Wallet} from '@prisma/client';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findByEmailOrPhone(email: string, phone?: string): Promise<User | null>;
  create(data: Prisma.UserUncheckedCreateInput): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  remove(id: string): Promise<void>;
  isActive(id: string): Promise<boolean>;
  findByIdWithWallet(id: string): Promise<Prisma.UserGetPayload<{ include: { wallet: true } }>|null> ;
}
