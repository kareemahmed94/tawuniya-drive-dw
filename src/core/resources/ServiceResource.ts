import { Service, ServiceCategory } from '@prisma/client';
import { BaseResource } from './BaseResource';

/**
 * Service Resource
 * Transforms service data for API responses
 */
export class ServiceResource extends BaseResource<
  Service & {
    configs?: Array<{
      id: string;
      ruleType: string;
      pointsPerUnit: any;
      unitAmount: any;
      expiryDays: number | null;
    }>;
    _count?: {
      transactions: number;
    };
  }
> {
  toArray() {
    return {
      id: this.data.id,
      name: this.data.name,
      description: this.data.description,
      category: this.data.category as ServiceCategory,
      iconUrl: this.data.iconUrl,
      isActive: this.data.isActive,
      createdAt: this.formatDate(this.data.createdAt),
      updatedAt: this.formatDate(this.data.updatedAt),
      configs: this.whenNotNull(
        this.data.configs?.map(config => ({
          id: config.id,
          ruleType: config.ruleType,
          pointsPerUnit: this.toNumber(config.pointsPerUnit),
          unitAmount: this.toNumber(config.unitAmount),
          expiryDays: config.expiryDays,
        }))
      ),
      transactionCount: this.data._count?.transactions,
    };
  }
}

/**
 * Service Config Resource
 * For service configuration responses
 */
export class ServiceConfigResource extends BaseResource<{
  id: string;
  serviceId: string;
  ruleType: string;
  pointsPerUnit: any;
  unitAmount: any;
  minAmount: any;
  maxPoints: any;
  expiryDays: number | null;
  validFrom: Date | null;
  validUntil: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}> {
  toArray() {
    return {
      id: this.data.id,
      serviceId: this.data.serviceId,
      ruleType: this.data.ruleType,
      pointsPerUnit: this.toNumber(this.data.pointsPerUnit),
      unitAmount: this.toNumber(this.data.unitAmount),
      minAmount: this.toNumber(this.data.minAmount),
      maxPoints: this.toNumber(this.data.maxPoints),
      expiryDays: this.data.expiryDays,
      validFrom: this.formatDate(this.data.validFrom),
      validUntil: this.formatDate(this.data.validUntil),
      isActive: this.data.isActive,
      createdAt: this.formatDate(this.data.createdAt),
      updatedAt: this.formatDate(this.data.updatedAt),
    };
  }
}

/**
 * Service Rules Resource
 * For active earning/burning rules
 */
export class ServiceRulesResource extends BaseResource<{
  earnRule: any;
  burnRule: any;
}> {
  toArray() {
    return {
      earnRule: this.data.earnRule
        ? {
            ...this.data.earnRule,
            pointsPerUnit: this.toNumber(this.data.earnRule.pointsPerUnit),
            unitAmount: this.toNumber(this.data.earnRule.unitAmount),
            minAmount: this.toNumber(this.data.earnRule.minAmount),
            maxPoints: this.toNumber(this.data.earnRule.maxPoints),
          }
        : null,
      burnRule: this.data.burnRule
        ? {
            ...this.data.burnRule,
            pointsPerUnit: this.toNumber(this.data.burnRule.pointsPerUnit),
            unitAmount: this.toNumber(this.data.burnRule.unitAmount),
            minAmount: this.toNumber(this.data.burnRule.minAmount),
            maxPoints: this.toNumber(this.data.burnRule.maxPoints),
          }
        : null,
    };
  }
}

