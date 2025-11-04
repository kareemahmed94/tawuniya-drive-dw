import type { Service, ServiceCategory, Prisma } from '@prisma/client';

export interface IServiceRepository {
  findAll(filters?: {
    category?: ServiceCategory;
    isActive?: boolean;
  }): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  findByName(name: string): Promise<Service | null>;
  create(data: Prisma.ServiceCreateInput): Promise<Service>;
  update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service>;
  remove(id: string): Promise<void>;
  isActive(id: string): Promise<boolean>;
  findByIdWithConfigs(id: string): Promise<any>;
  findByIdWithTransactionCount(id: string): Promise<any>;
}
