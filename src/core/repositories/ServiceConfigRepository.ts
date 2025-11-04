import { injectable } from 'inversify';
import { ServiceConfig, RuleType, Prisma } from '@prisma/client';
import { IServiceConfigRepository } from '../interfaces/repositories/IServiceConfigRepository';
import { prisma } from '../config/database';

/**
 * Service Configuration Repository Implementation
 * Handles data access for ServiceConfig entity using Prisma
 */
@injectable()
export class ServiceConfigRepository implements IServiceConfigRepository {
  async findActiveByServiceAndType(
    serviceId: string,
    ruleType: RuleType
  ): Promise<ServiceConfig | null> {
    const now = new Date();

    // Get all active configs for this service and rule type
    const configs = await prisma.serviceConfig.findMany({
      where: {
        serviceId,
        ruleType,
        isActive: true,
      },
      orderBy: {
        validFrom: 'desc',
      },
    });

    // Filter by validity dates in memory
    return configs.find(config => {
      const validFromOk = !config.validFrom || config.validFrom <= now;
      const validUntilOk = !config.validUntil || config.validUntil >= now;
      return validFromOk && validUntilOk;
    }) || null;
  }

  async findByServiceId(serviceId: string): Promise<ServiceConfig[]> {
    return prisma.serviceConfig.findMany({
      where: { serviceId },
      orderBy: { validFrom: 'desc' },
    });
  }

  async findById(id: string): Promise<ServiceConfig | null> {
    return prisma.serviceConfig.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.ServiceConfigCreateInput): Promise<ServiceConfig> {
    return prisma.serviceConfig.create({
      data,
    });
  }

  async update(
    id: string,
    data: Prisma.ServiceConfigUpdateInput
  ): Promise<ServiceConfig> {
    return prisma.serviceConfig.update({
      where: { id },
      data,
    });
  }

  async deactivate(id: string): Promise<ServiceConfig> {
    return prisma.serviceConfig.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async remove(id: string): Promise<void> {
    await prisma.serviceConfig.delete({
      where: { id },
    });
  }

  async isActive(id: string): Promise<boolean> {
    const config = await prisma.serviceConfig.findUnique({
      where: { id },
      select: { isActive: true },
    });
    return config?.isActive ?? false;
  }
}

