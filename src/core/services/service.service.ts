import {injectable, inject} from 'inversify';
import {Service, ServiceCategory, ServiceConfig} from '@prisma/client';
import {TYPES} from '@/core/di/types';
import type {IServiceManagementService} from '@/core/interfaces/services/IServiceManagementService';
import type {IServiceRepository} from '@/core/interfaces/repositories/IServiceRepository';
import type {IServiceConfigRepository} from '@/core/interfaces/repositories/IServiceConfigRepository';
import type {ServiceConfigResponse} from '@/core/types';
import {AppError} from '@/core/middleware/errorHandler';
import {
    CreateServiceInput,
    UpdateServiceInput,
    CreateServiceConfigInput,
} from '@/core/validators/service.validator';
import logger from '@/core/utils/logger';
import {prisma} from '@/core/config/database';

/**
 * Service Management Service Implementation
 * Handles CRUD operations for services and configurations using DI
 * Admin-focused operations
 * Follows SOLID principles: SRP, DIP, OCP
 */
@injectable()
export class ServiceManagementService {
    constructor(
        @inject(TYPES.ServiceRepository) private serviceRepository: IServiceRepository,
        @inject(TYPES.ServiceConfigRepository) private serviceConfigRepository: IServiceConfigRepository
    ) {
    }

    /**
     * Get all services
     * Supports filtering by category and active status
     */
    async getAllServices(filters?: {
        category?: ServiceCategory;
        isActive?: boolean;
    }): Promise<Service[]> {
        const services = await prisma.service.findMany({
            where: {
                ...(filters?.category && {category: filters.category}),
                ...(filters?.isActive !== undefined && {isActive: filters.isActive}),
            },
            include: {
                configs: {
                    where: {isActive: true},
                    orderBy: {validFrom: 'desc'},
                },
                _count: {
                    select: {
                        transactions: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return services;
    }

    /**
     * Get service by ID
     */
    async getServiceById(serviceId: string): Promise<Service> {
        const service = await prisma.service.findUnique({
            where: {id: serviceId},
            include: {
                configs: {
                    where: {isActive: true},
                    orderBy: {validFrom: 'desc'},
                },
                _count: {
                    select: {
                        transactions: true,
                    },
                },
            },
        });

        if (!service) {
            throw new AppError('Service not found', 404);
        }

        return service;
    }

    /**
     * Create new service
     */
    async createService(data: CreateServiceInput): Promise<Service> {
        // Check if service name already exists
        const existing = await this.serviceRepository.findByName(data.name);

        if (existing) {
            throw new AppError('Service name already exists', 409);
        }

        const service = await this.serviceRepository.create({
            name: data.name,
            description: data.description,
            category: data.category,
            iconUrl: data.iconUrl,
            isActive: true,
        });

        logger.info(`Service created: ${service.name} (${service.id})`);

        return service;
    }

    /**
     * Update service
     */
    async updateService(serviceId: string, data: UpdateServiceInput): Promise<Service> {
        // Check if service exists
        const service = await this.serviceRepository.findById(serviceId);

        if (!service) {
            throw new AppError('Service not found', 404);
        }

        // If updating name, check for duplicates
        if (data.name && data.name !== service.name) {
            const existing = await this.serviceRepository.findByName(data.name);
            if (existing) {
                throw new AppError('Service name already exists', 409);
            }
        }

        const updated = await this.serviceRepository.update(serviceId, data);

        logger.info(`Service updated: ${updated.name} (${updated.id})`);

        return updated;
    }

    /**
     * Delete service
     */
    async deleteService(serviceId: string): Promise<void> {
        // Check if service exists
        const service = await this.serviceRepository.findById(serviceId);

        if (!service) {
            throw new AppError('Service not found', 404);
        }

        // Check if service has transactions
        const serviceWithCount = await prisma.service.findUnique({
            where: {id: serviceId},
            include: {
                _count: {
                    select: {
                        transactions: true,
                    },
                },
            },
        });

        if (serviceWithCount && serviceWithCount._count.transactions > 0) {
            throw new AppError(
                'Cannot delete service with existing transactions. Consider deactivating instead.',
                400
            );
        }

        await this.serviceRepository.remove(serviceId);

        logger.info(`Service deleted: ${service.name} (${service.id})`);
    }

    /**
     * Get active earning/burning rules
     */
    async getActiveRules(serviceId: string) {
        const service = await this.serviceRepository.findById(serviceId);

        if (!service) {
            throw new AppError('Service not found', 404);
        }

        const [earnRule, burnRule] = await Promise.all([
            this.serviceConfigRepository.findActiveByServiceAndType(serviceId, 'EARN'),
            this.serviceConfigRepository.findActiveByServiceAndType(serviceId, 'BURN'),
        ]);

        return {
            earnRule: earnRule
                ? {
                    ...earnRule,
                    pointsPerUnit: Number(earnRule.pointsPerUnit),
                    unitAmount: Number(earnRule.unitAmount),
                    minAmount: earnRule.minAmount ? Number(earnRule.minAmount) : null,
                    maxPoints: earnRule.maxPoints ? Number(earnRule.maxPoints) : null,
                }
                : null,
            burnRule: burnRule
                ? {
                    ...burnRule,
                    pointsPerUnit: Number(burnRule.pointsPerUnit),
                    unitAmount: Number(burnRule.unitAmount),
                    minAmount: burnRule.minAmount ? Number(burnRule.minAmount) : null,
                    maxPoints: burnRule.maxPoints ? Number(burnRule.maxPoints) : null,
                }
                : null,
        };
    }

    /**
     * Get service configurations
     */
    async getServiceConfigs(serviceId: string): Promise<ServiceConfigResponse[]> {
        const service = await this.serviceRepository.findById(serviceId);

        if (!service) {
            throw new AppError('Service not found', 404);
        }

        const configs = await this.serviceConfigRepository.findByServiceId(serviceId);

        return configs.map((config) => ({
            ...config,
            pointsPerUnit: Number(config.pointsPerUnit),
            unitAmount: Number(config.unitAmount),
            minAmount: config.minAmount ? Number(config.minAmount) : null,
            maxPoints: config.maxPoints ? Number(config.maxPoints) : null,
        }));
    }

    /**
     * Create service configuration
     */
    async createServiceConfig(data: CreateServiceConfigInput): Promise<ServiceConfigResponse> {
        // Validate service exists
        const service = await this.serviceRepository.findById(data.serviceId);

        if (!service) {
            throw new AppError('Service not found', 404);
        }

        const config = await this.serviceConfigRepository.create({
            service: {
                connect: {id: data.serviceId},
            },
            ruleType: data.ruleType,
            pointsPerUnit: data.pointsPerUnit,
            unitAmount: data.unitAmount,
            minAmount: data.minAmount,
            maxPoints: data.maxPoints,
            expiryDays: data.expiryDays,
            validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
            validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
            isActive: true,
        });

        logger.info(
            `Service config created: ${service.name} - ${data.ruleType} (${config.id})`
        );

        return {
            ...config,
            pointsPerUnit: Number(config.pointsPerUnit),
            unitAmount: Number(config.unitAmount),
            minAmount: config.minAmount ? Number(config.minAmount) : null,
            maxPoints: config.maxPoints ? Number(config.maxPoints) : null,
        };
    }

    /**
     * Update service configuration
     */
    async updateServiceConfig(
        configId: string,
        data: Partial<CreateServiceConfigInput>
    ): Promise<ServiceConfigResponse> {
        const config = await this.serviceConfigRepository.findById(configId);

        if (!config) {
            throw new AppError('Service configuration not found', 404);
        }

        const updated = await this.serviceConfigRepository.update(configId, data);

        logger.info(`Service config updated: ${configId}`);

        return {
            ...updated,
            pointsPerUnit: Number(updated.pointsPerUnit),
            unitAmount: Number(updated.unitAmount),
            minAmount: updated.minAmount ? Number(updated.minAmount) : null,
            maxPoints: updated.maxPoints ? Number(updated.maxPoints) : null,
        };
    }

    /**
     * Deactivate service configuration
     */
    async deactivateServiceConfig(configId: string) {
        const config = await this.serviceConfigRepository.findById(configId);

        if (!config) {
            throw new AppError('Service configuration not found', 404);
        }

        const updated = await this.serviceConfigRepository.deactivate(configId);

        logger.info(`Service config deactivated: ${configId}`);

        return {
            ...updated,
            pointsPerUnit: Number(updated.pointsPerUnit),
            unitAmount: Number(updated.unitAmount),
            minAmount: updated.minAmount ? Number(updated.minAmount) : null,
            maxPoints: updated.maxPoints ? Number(updated.maxPoints) : null,
        };
    }
}
