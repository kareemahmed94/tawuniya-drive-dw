import type { ServiceConfig, RuleType, Prisma } from '@prisma/client';

export interface IServiceConfigRepository {
  findActiveByServiceAndType(
    serviceId: string,
    ruleType: RuleType
  ): Promise<ServiceConfig | null>;
  findByServiceId(serviceId: string): Promise<ServiceConfig[]>;
  findById(id: string): Promise<ServiceConfig | null>;
  create(data: Prisma.ServiceConfigCreateInput): Promise<ServiceConfig>;
  update(id: string, data: Prisma.ServiceConfigUpdateInput): Promise<ServiceConfig>;
  deactivate(id: string): Promise<ServiceConfig>;
  remove(id: string): Promise<void>;
  isActive(id: string): Promise<boolean>;
}
