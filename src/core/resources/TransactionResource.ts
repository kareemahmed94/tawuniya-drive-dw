import { Transaction, TransactionType, TransactionStatus } from '@prisma/client';
import { BaseResource } from './BaseResource';

/**
 * Transaction Resource
 * Transforms transaction data for API responses
 */
export class TransactionResource extends BaseResource<
  Transaction & {
    service?: {
      id: string;
      name: string;
      category: string;
    };
    user?: {
      id: string;
      name: string;
      email: string;
    };
  }
> {
  toArray() {
    return {
      id: this.data.id,
      userId: this.data.userId,
      serviceId: this.data.serviceId,
      type: this.data.type as TransactionType,
      amount: this.toNumber(this.data.amount),
      points: this.toNumber(this.data.points),
      balanceBefore: this.toNumber(this.data.balanceBefore),
      balanceAfter: this.toNumber(this.data.balanceAfter),
      description: this.data.description,
      metadata: this.data.metadata,
      status: this.data.status as TransactionStatus,
      createdAt: this.formatDate(this.data.createdAt),
      updatedAt: this.formatDate(this.data.updatedAt),
      service: this.whenNotNull(this.data.service),
      user: this.whenNotNull(this.data.user),
    };
  }
}

/**
 * Transaction Summary Resource
 * Simplified transaction info for lists
 */
export class TransactionSummaryResource extends BaseResource<
  Pick<Transaction, 'id' | 'type' | 'points' | 'createdAt'> & {
    service?: { name: string };
  }
> {
  toArray() {
    return {
      id: this.data.id,
      type: this.data.type,
      points: this.toNumber(this.data.points),
      serviceName: this.data.service?.name,
      createdAt: this.formatDate(this.data.createdAt),
    };
  }
}

