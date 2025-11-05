import { injectable } from 'inversify';
import { Service, ServiceCategory, Prisma } from '@prisma/client';
import { IServiceRepository } from '../interfaces/repositories/IServiceRepository';
import type { ServiceWithConfigsResponse, ServiceWithTransactionCountResponse } from '../types';
import { prisma } from '../config/database';

/**
 * Service Repository Implementation
 * Handles data access for Service entity using Prisma
 */
@injectable()
export class ServiceRepository implements IServiceRepository {
  async findAll(filters?: {
    category?: ServiceCategory;
    isActive?: boolean;
  }): Promise<Service[]> {
    return prisma.service.findMany({
      where: {
        ...(filters?.category && { category: filters.category }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findById(id: string): Promise<Service | null> {
    return prisma.service.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Service | null> {
    return prisma.service.findUnique({
      where: { name },
    });
  }

  async create(data: Prisma.ServiceCreateInput): Promise<Service> {
    return prisma.service.create({
      data,
    });
  }

  async update(id: string, data: Prisma.ServiceUpdateInput): Promise<Service> {
    return prisma.service.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<void> {
    await prisma.service.delete({
      where: { id },
    });
  }

  async isActive(id: string): Promise<boolean> {
    const service = await prisma.service.findUnique({
      where: { id },
      select: { isActive: true },
    });
    return service?.isActive ?? false;
  }

  async findByIdWithConfigs(id: string): Promise<ServiceWithConfigsResponse | null> {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        configs: {
          where: { isActive: true },
          orderBy: { validFrom: 'desc' },
        },
      },
    });

    if (!service) return null;

    return {
      ...service,
      configs: service.configs.map(config => ({
        ...config,
        pointsPerUnit: Number(config.pointsPerUnit),
        unitAmount: Number(config.unitAmount),
        minAmount: config.minAmount ? Number(config.minAmount) : null,
        maxPoints: config.maxPoints ? Number(config.maxPoints) : null,
      })),
    };
  }

  async findByIdWithTransactionCount(id: string): Promise<ServiceWithTransactionCountResponse | null> {
    return prisma.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
  }
}

